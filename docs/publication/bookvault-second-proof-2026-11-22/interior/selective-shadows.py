"""Apply agreed BPC only to three photograph rectangles, from retained RGB.

All other final CMYK pixels and all native PDF lettering remain unchanged.
"""
from pathlib import Path
import argparse,io,json,hashlib,shutil,zlib
import numpy as np
from PIL import Image,ImageCms
from pypdf import PdfReader,PdfWriter
import pypdf.filters
pypdf.filters.ZLIB_MAX_OUTPUT_LENGTH=200_000_000
from pypdf.generic import (NameObject,DecodedStreamObject,NumberObject,DictionaryObject,
                           TextStringObject,ArrayObject)
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
ROOT=Path(__file__).resolve().parents[4];DOC=Path(__file__).resolve().parent
WORK=DOC/'colour-work';OUT=ROOT/'output/pdf/bookvault-second-proof-2026-11-22/interior'
PROFILE=ROOT/'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc'
PLAN=ROOT/'docs/publication/bookvault-second-proof-2026-11-22/colour/SELECTIVE-PHOTO-BPC.json'
SRC=OUT/'Vegetable-Guru-Interior-Production-Preparation.pdf'
FINAL=OUT/'Vegetable-Guru-Interior-Colour-Managed.pdf'
BASELINE=WORK/'interior-cmyk-no-bpc.pdf'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
plan=json.loads(PLAN.read_text())
plain=ImageCms.buildTransform(ImageCms.createProfile('sRGB'),ImageCms.getOpenProfile(str(PROFILE)),'RGB','CMYK',renderingIntent=1)
bpc=ImageCms.buildTransform(ImageCms.createProfile('sRGB'),ImageCms.getOpenProfile(str(PROFILE)),'RGB','CMYK',renderingIntent=1,flags=ImageCms.Flags.BLACKPOINTCOMPENSATION)

def retain():
    folder=WORK/'retained-photo-inputs';folder.mkdir(exist_ok=True)
    for item in plan['regions']:
        f=item['folio'];target=folder/f'page-{f:03}.png'
        if not target.exists():
            matches=list(WORK.glob(f'art-*-{f:03}.png'));assert len(matches)==1,(f,matches)
            shutil.copy2(matches[0],target)
    return folder

def converted(item):
    path=retain()/f'page-{item["folio"]:03}.png'
    rgb=Image.open(path).convert('RGB');cm=ImageCms.applyTransform(rgb,plain)
    box=item['pixelCentreBox600dpiPillow'];patch=ImageCms.applyTransform(rgb.crop(box),bpc)
    cm.paste(patch,box);rgb.close();patch.close();return cm

def intent(writer):
    profile=DecodedStreamObject();profile.set_data(PROFILE.read_bytes());profile[NameObject('/N')]=NumberObject(4)
    out=DictionaryObject({NameObject('/Type'):NameObject('/OutputIntent'),NameObject('/S'):NameObject('/GTS_PDFX'),NameObject('/OutputConditionIdentifier'):TextStringObject('FOGRA39'),NameObject('/Info'):TextStringObject('ISO Coated v2 300% (ECI)'),NameObject('/RegistryName'):TextStringObject('http://www.color.org'),NameObject('/DestOutputProfile'):writer._add_object(profile)})
    writer.root_object[NameObject('/OutputIntents')]=ArrayObject([writer._add_object(out)])

def samples():
    retain();source=PdfReader(SRC);text=PdfReader(WORK/'text.pdf');writer=PdfWriter()
    for index,item in enumerate(plan['regions']):
        f=item['folio'];cm=converted(item);size=tuple(map(float,(source.pages[f-1].mediabox.width,source.pages[f-1].mediabox.height)))
        data=io.BytesIO();c=canvas.Canvas(data,pagesize=size,pageCompression=1);c.drawImage(ImageReader(cm),0,0,width=size[0],height=size[1]);c.showPage();c.save()
        page=PdfReader(io.BytesIO(data.getvalue())).pages[0];cs=page.get_contents();ops=[];inside=False
        for vals,op in cs.operations:
            if op==b'BT':inside=True;continue
            if op==b'ET':inside=False;continue
            if not inside:ops.append((vals,op))
        cs.operations=ops;page[NameObject('/Contents')]=cs;page['/Resources'].pop('/Font',None)
        page.merge_page(text.pages[f-1])
        for key in ('/MediaBox','/CropBox','/TrimBox','/BleedBox'):page[NameObject(key)]=source.pages[f-1][key]
        writer.add_page(page);writer.set_page_label(index,index,style='/D',start=f)
        cm.close();print('Sample composed',f,flush=True)
    intent(writer);writer.pdf_header='%PDF-1.4'
    writer.add_metadata({'/Title':'The Vegetable Guru - print shadow-detail samples','/Author':'John Lennon','/Subject':'Folios154,155,168; FOGRA39 with selective photo BPC; native lettering preserved'})
    target=OUT/'Vegetable-Guru-Print-Shadow-Samples.pdf';writer.write(target);print(target,flush=True)

def patch():
    assert sha(SRC)==plan['sourceSha256']
    if not BASELINE.exists():shutil.copy2(FINAL,BASELINE)
    reader=PdfReader(BASELINE);writer=PdfWriter();writer.clone_document_from_reader(reader);records=[]
    for item in plan['regions']:
        f=item['folio'];page=writer.pages[f-1];images=[]
        for ref in page['/Resources'].get('/XObject',{}).values():
            ob=ref.get_object()
            if ob.get('/Subtype')=='/Image':images.append(ob)
        assert len(images)==1,(f,len(images));ob=images[0]
        assert str(ob['/ColorSpace'])=='/DeviceCMYK'
        old=np.frombuffer(ob.get_data(),dtype=np.uint8).reshape((int(ob['/Height']),int(ob['/Width']),4))
        new=converted(item);pixels=np.asarray(new)
        assert pixels.shape==old.shape
        l,t,r,b=item['pixelCentreBox600dpiPillow'];outside=np.ones(old.shape[:2],bool);outside[t:b,l:r]=False
        assert np.array_equal(old[outside],pixels[outside]),f
        changed=np.any(old!=pixels,axis=2)
        ob[NameObject('/Filter')]=NameObject('/FlateDecode');ob.pop('/DecodeParms',None)
        ob._data=zlib.compress(pixels.tobytes(),6);ob.decoded_self=None
        records.append({'folio':f,'pixelRect':item['pixelCentreBox600dpiPillow'],'changedCMYKPixels':int(changed.sum()),'outsideRectangleCMYKBytesIdentical':True,'nativePageContentSHA256':hashlib.sha256(page.get_contents().get_data()).hexdigest()})
        new.close();print('Applied selective photo BPC',f,flush=True)
    writer.write(FINAL)
    check=PdfReader(FINAL)
    for i,(before,after) in enumerate(zip(reader.pages,check.pages),1):
        assert before.get_contents().get_data()==after.get_contents().get_data(),(i,'Native page content changed')
    receipt={'sourceRGBPreparationSHA256':sha(SRC),'noBPCBaselineSHA256':sha(BASELINE),'finalSHA256':sha(FINAL),'bytes':FINAL.stat().st_size,'profileSHA256':sha(PROFILE),'intent':1,'selectiveFlags':8192,'regions':records,'all174NativePageContentStreamsUnchangedBySelectiveCorrection':True,'noRoundTrip':'BPC conversion starts from the same retained explicit-sRGB Poppler artwork rasters, not CMYK output.'}
    (DOC/'SELECTIVE-SHADOW-CORRECTION.json').write_text(json.dumps(receipt,indent=2)+'\n');print(FINAL,flush=True)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('action',choices=['retain','samples','patch']);args=p.parse_args()
    {'retain':retain,'samples':samples,'patch':patch}[args.action]()
