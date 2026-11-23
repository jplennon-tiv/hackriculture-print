"""Native-colour interior with isolated 3 mm bleed; no artwork/text reprocessing.

Original PDF contents and every original resource stay intact, translated 3 mm.
Lossless 254 dpi reflected edge strips extend 3 mm beyond trim and repair only
the outer 0.2 mm perimeter where inherited source rounding left a white hairline.
"""
from pathlib import Path
import argparse, hashlib, json, zlib, logging, gc, io
import numpy as np
from PIL import Image, ImageDraw
from pypdf import PdfReader, PdfWriter
from pypdf.generic import (NameObject, DictionaryObject, DecodedStreamObject,
                           EncodedStreamObject, NumberObject, RectangleObject)
import pypdfium2 as pdfium

ROOT=Path(__file__).resolve().parents[4]
DOC=Path(__file__).resolve().parent
OUT=ROOT/'output/pdf/bookvault-second-proof-2026-11-22/interior'
SOURCE=ROOT/'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'
TARGET=OUT/'Vegetable-Guru-Interior-Production-Preparation.pdf'
EXPECTED='f87ea66a3dcd06314e518e627c54e574dabac31a31a3035aba69013ad8e1f682'
MM=72/25.4; W=185*MM; H=240*MM; B=3*MM
logging.getLogger('pypdf').setLevel(logging.ERROR)
sha=lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def render(page,w,h):
    bitmap=pdfium.PdfBitmap.new_native(w,h,format=pdfium.raw.FPDFBitmap_BGR)
    bitmap.fill_rect((255,255,255,255),0,0,w,h)
    pdfium.raw.FPDF_RenderPageBitmap(bitmap,page,0,0,w,h,0,pdfium.raw.FPDF_ANNOT)
    image=bitmap.to_pil().convert('RGB').copy()
    bitmap.close()
    return image

def image_stream(im):
    ob=EncodedStreamObject()
    ob.update({NameObject('/Type'):NameObject('/XObject'),NameObject('/Subtype'):NameObject('/Image'),
      NameObject('/Width'):NumberObject(im.width),NameObject('/Height'):NumberObject(im.height),
      NameObject('/BitsPerComponent'):NumberObject(8),NameObject('/ColorSpace'):NameObject('/DeviceRGB'),
      NameObject('/Filter'):NameObject('/FlateDecode')})
    ob._data=zlib.compress(im.tobytes(),6)
    return ob

def original_images(page):
    found=[]; seen=set()
    def colour(value):
        value=value.get_object() if hasattr(value,'get_object') else value
        if hasattr(value,'get_data'):return hashlib.sha256(value.get_data()).hexdigest()
        if isinstance(value,list):return '['+','.join(colour(v) for v in value)+']'
        return str(value)
    def walk(res):
        if not hasattr(res,'get'):return
        for name,ref in res.get('/XObject',{}).items():
            ob=ref.get_object()
            if not hasattr(ob,'get') or id(ob) in seen:continue
            seen.add(id(ob))
            if str(name).startswith('/VG_BLEED_'):continue
            if ob.get('/Subtype')=='/Image':
                found.append((int(ob['/Width']),int(ob['/Height']),colour(ob.get('/ColorSpace')),hashlib.sha256(ob._data).hexdigest()))
            elif '/Resources' in ob:walk(ob['/Resources'])
    walk(page['/Resources'])
    return sorted(found)

def font_programs(page):
    found=[];seen=set()
    def walk(res):
        if not hasattr(res,'get') or id(res) in seen:return
        seen.add(id(res))
        for ref in res.get('/Font',{}).values():
            font=ref.get_object()
            if not hasattr(font,'get'):continue
            cmap=font.get('/ToUnicode');cmap=cmap.get_object() if cmap else None
            cmhash=hashlib.sha256(cmap.get_data()).hexdigest() if hasattr(cmap,'get_data') else None
            for desc in font.get('/DescendantFonts',[font]):
                desc=desc.get_object();fd=desc.get('/FontDescriptor',{})
                fd=fd.get_object() if hasattr(fd,'get_object') else fd
                for key in ('/FontFile','/FontFile2','/FontFile3'):
                    if key in fd:
                        ob=fd[key].get_object()
                        found.append((str(font.get('/BaseFont')),key,hashlib.sha256(ob.get_data()).hexdigest(),cmhash))
        for ref in res.get('/XObject',{}).values():
            ob=ref.get_object()
            if hasattr(ob,'get') and ob.get('/Subtype')=='/Form' and '/Resources' in ob:walk(ob['/Resources'])
    walk(page['/Resources'])
    return sorted(found)

def build():
    assert sha(SOURCE)==EXPECTED
    OUT.mkdir(parents=True,exist_ok=True)
    reader=PdfReader(SOURCE); writer=PdfWriter(); raster=pdfium.PdfDocument(SOURCE)
    assert len(reader.pages)==178
    records=[]
    for f in range(1,175):
        source=reader.pages[f+1]
        page=writer.add_page(source,excluded_keys=['/Annots'])
        raw=page.get_contents().get_data()
        original_digest=hashlib.sha256(raw).hexdigest()
        im=render(raster[f+1],1850,2400)
        # Several source pages contain a white rounding sliver at the extreme
        # trim edge. Start 0.2 mm inside the edge and mirror into the bleed.
        a=np.pad(np.asarray(im)[2:-2,2:-2,:],((32,32),(32,32),(0,0)),mode='symmetric')
        resources=DictionaryObject(dict(page['/Resources']))
        xobjects=DictionaryObject(dict(resources.get('/XObject',{})))
        resources[NameObject('/XObject')]=xobjects
        page[NameObject('/Resources')]=resources
        U=.2*MM
        pieces=[('TOP',a[:32,:,:],0,H+B-U,W+2*B,B+U),
                ('BOTTOM',a[-32:,:,:],0,0,W+2*B,B+U),
                ('LEFT',a[32:-32,:32,:],0,B+U,B+U,H-2*U),
                ('RIGHT',a[32:-32,-32:,:],W+B-U,B+U,B+U,H-2*U)]
        bleed=b''
        for tag,pixels,x,y,w,h in pieces:
            name=NameObject('/VG_BLEED_'+tag)
            assert name not in xobjects
            strip=Image.fromarray(np.ascontiguousarray(pixels))
            xobjects[name]=writer._add_object(image_stream(strip))
            bleed+=f'q {w:.10f} 0 0 {h:.10f} {x:.10f} {y:.10f} cm {name} Do Q\n'.encode()
        prefix=f'q 1 0 0 1 {B:.10f} {B:.10f} cm 0 0 {W:.10f} {H:.10f} re W n\n'.encode()
        content=DecodedStreamObject();content.set_data(prefix+raw+b'\nQ\n'+bleed)
        page[NameObject('/Contents')]=writer._add_object(content)
        page.mediabox=RectangleObject([0,0,W+2*B,H+2*B]);page.cropbox=RectangleObject(page.mediabox)
        page.bleedbox=RectangleObject(page.mediabox);page.trimbox=RectangleObject([B,B,W+B,H+B])
        records.append({'folio':f,'sourcePDFPage':f+2,'sourceContentSHA256':original_digest,'sourceContentBytes':len(raw),
                        'sourceImageCount':len(original_images(source)),'addedBleedImages':4})
        im.close();del a;gc.collect()
        if f%20==0 or f==174:print('Prepared',f,flush=True)
    writer.set_page_label(0,173,style='/D',start=1)
    writer.add_metadata({'/Title':'The Vegetable Guru - interior production preparation',
      '/Author':'John Lennon','/Subject':'174 pages; Traditional measurements; native-colour preparation; 185 x 240 mm trim plus 3 mm bleed. Pending metadata and final supplier preflight.'})
    writer.write(TARGET)
    assert sha(SOURCE)==EXPECTED
    report={'date':'2026-11-22','status':'Prepared; technical and visual verification pending',
      'source':str(SOURCE.relative_to(ROOT)),'sourceSHA256':EXPECTED,'output':str(TARGET.relative_to(ROOT)),
      'sha256':sha(TARGET),'bytes':TARGET.stat().st_size,'pageCount':174,'trimMm':[185,240],
      'mediaMm':[191,246],'bleedMm':3,'bleedMethod':'Symmetric continuation from 0.2 mm inside each source edge, lossless RGB at 254 dpi, extends 3 mm beyond trim and repairs the outer 0.2 mm perimeter where inherited page rounding left a white hairline. Native source content stays byte-exact and is translated 3 mm. All content farther inside trim is unchanged.',
      'colour':'Original colour spaces/resources preserved; no profile conversion or PDF/X claim',
      'screenNavigation':'Non-printing annotations and book-level bookmarks omitted in this print-preparation derivative. Printed references and page sequence unchanged.',
      'metadata':'Copyright year, ISBN and other approved placeholders retained for stage 4',
      'pages':records}
    (DOC/'PREPARATION.json').write_text(json.dumps(report,indent=2)+'\n')
    print(TARGET,flush=True)

def verify():
    assert sha(SOURCE)==EXPECTED
    before=PdfReader(SOURCE);after=PdfReader(TARGET)
    a=pdfium.PdfDocument(SOURCE);b=pdfium.PdfDocument(TARGET)
    assert len(after.pages)==174
    records=[]; (DOC/'pages').mkdir(exist_ok=True)
    for i,page in enumerate(after.pages):
        source=before.pages[i+2]
        original=source.get_contents().get_data(); output=page.get_contents().get_data()
        assert original in output,(i,'Native stream altered')
        assert original_images(source)==original_images(page),(i,'Image bytes changed')
        assert font_programs(source)==font_programs(page),(i,'Embedded font/cmap changed')
        assert not page.get('/Annots')
        assert all(abs(float(v)-e)<1e-6 for v,e in zip(page.trimbox,[B,B,W+B,H+B]))
        assert abs(float(page.mediabox.width)-(W+2*B))<1e-6
        assert abs(float(page.mediabox.height)-(H+2*B))<1e-6
        # Render the exact source at the same translated device origin. Direct
        # differently-sized page renders can snap photo sampling by one pixel.
        reference_writer=PdfWriter();reference=reference_writer.add_page(source,excluded_keys=['/Annots'])
        prefix=f'q 1 0 0 1 {B:.10f} {B:.10f} cm 0 0 {W:.10f} {H:.10f} re W n\n'.encode()
        cs=DecodedStreamObject();cs.set_data(prefix+original+b'\nQ\n')
        reference[NameObject('/Contents')]=reference_writer._add_object(cs)
        reference.mediabox=RectangleObject([0,0,W+2*B,H+2*B]);reference.cropbox=RectangleObject(reference.mediabox)
        data=io.BytesIO();reference_writer.write(data);reference_pdf=pdfium.PdfDocument(data.getvalue())
        xfull=render(reference_pdf[0],1910,2460);x=xfull.crop((30,30,1880,2430))
        full=render(b[i],1910,2460); y=full.crop((30,30,1880,2430))
        diff=np.abs(np.asarray(x,dtype=np.int16)-np.asarray(y,dtype=np.int16))
        changed=np.any(diff,axis=2)
        interior=diff[3:-3,3:-3,:]
        record={'folio':i+1,'nativeContentBytesPreserved':True,'nativeImageBytesPreserved':True,'embeddedFontsAndCmapsPreserved':True,
          'changedTrimPixels':int(changed.sum()),'maximumChannelDifference':int(diff.max()),
          'meanChannelDifference':float(diff.mean()),
          'changedPixelsBeyondPointThreeMMBoundary':int(np.any(interior,axis=2).sum()),
          'maximumDifferenceBeyondPointThreeMMBoundary':int(interior.max())}
        records.append(record)
        # Retain actual output pages for inspection, not the source render.
        y.resize((555,720),Image.Resampling.LANCZOS).save(DOC/f'pages/page-{i+1:03}.jpg',quality=90)
        if changed.sum()>5000:
            y.save(DOC/f'pages/check-{i+1:03}.png')
        if i+1 in [1,2,3,4,5,7,8,34,56,96,97,98,145,146,147,154,166,168,169,170,173,174]:
            full.save(DOC/f'pages/bleed-{i+1:03}.png')
        x.close();y.close();full.close();xfull.close();reference_pdf.close()
        del reference_writer,reference,data;gc.collect()
        if (i+1)%20==0:print('Verified',i+1,flush=True)
    for start in range(1,175,16):
        sheet=Image.new('RGB',(1200,1640),'#d9dfcf');draw=ImageDraw.Draw(sheet)
        for n,f in enumerate(range(start,min(start+16,175))):
            im=Image.open(DOC/f'pages/page-{f:03}.jpg'); im.thumbnail((285,370))
            x=(n%4)*300+8;y=(n//4)*410+28;sheet.paste(im,(x,y));draw.text((x,y-20),str(f),fill='#173e2c')
        sheet.save(DOC/f'contact-{start:03}.jpg',quality=90)
    report={'status':'All native content/image bytes preserved; raster differences require inspection',
      'comparisonMethod':'Source and output rendered at the identical 3 mm translated device origin, 254 dpi; trim pixels compared. This avoids one-pixel photo sampling differences caused solely by renderer device-origin rounding.',
      'outputSHA256':sha(TARGET),'sourceSHA256':EXPECTED,'pages':records,
      'largestDifferences':sorted(records,key=lambda r:r['changedTrimPixels'],reverse=True)[:15]}
    (DOC/'VERIFICATION.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report['largestDifferences'][:5],indent=2),flush=True)

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('action',choices=['build','verify']);args=p.parse_args()
    build() if args.action=='build' else verify()
