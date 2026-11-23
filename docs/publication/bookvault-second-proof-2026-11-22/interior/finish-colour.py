"""Flatten non-text artwork at 600 dpi and colour-manage both layers for Bookvault.

Native glyphs are retained verbatim; sRGB text colours are converted using the
same FOGRA39 profile as the artwork. No PDF/X certification is claimed.
"""
from pathlib import Path
import argparse, hashlib, io, json, subprocess, gc, logging, concurrent.futures, shutil
from PIL import Image, ImageCms
from pypdf import PdfReader, PdfWriter
from pypdf.generic import ContentStream, NameObject, DecodedStreamObject, DictionaryObject, ArrayObject, NumberObject, FloatObject, TextStringObject
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
logging.getLogger('pypdf').setLevel(logging.ERROR)
ROOT=Path(__file__).resolve().parents[4]
DOC=Path(__file__).resolve().parent
PROFILE=ROOT/'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc'
POPPLER='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'
TEXT={b'Tj',b'TJ',b"'",b'"'}; PAINT={b'S',b's',b'f',b'F',b'f*',b'B',b'B*',b'b',b'b*'}

def resolved(v):return v.get_object() if hasattr(v,'get_object') else v

def split(source,mode,target):
    reader=PdfReader(source);writer=PdfWriter();seen=set();runs=0;current_page=0
    transform_colour=ImageCms.buildTransform(ImageCms.createProfile('sRGB'),ImageCms.getOpenProfile(str(PROFILE)),'RGB','CMYK',renderingIntent=1)
    cache={};profile_transforms={}
    def cmyk(values,space='/DeviceRGB'):
        space=resolved(space)
        if isinstance(space,list):
            assert str(space[0])=='/ICCBased',('Unsupported native-text colour space',space)
            profile=resolved(space[1]);channels=int(profile['/N']);raw_profile=profile.get_data()
            profile_key=hashlib.sha256(raw_profile).hexdigest();mode={1:'L',3:'RGB',4:'CMYK'}[channels]
            if profile_key not in profile_transforms:
                profile_transforms[profile_key]=ImageCms.buildTransform(ImageCms.getOpenProfile(io.BytesIO(raw_profile)),ImageCms.getOpenProfile(str(PROFILE)),mode,'CMYK',renderingIntent=1)
            colour_transform=profile_transforms[profile_key]
        elif str(space)=='/DeviceGray':
            return [FloatObject(0),FloatObject(0),FloatObject(0),FloatObject(1-float(values[0]))]
        elif str(space)=='/DeviceCMYK':return [FloatObject(float(v)) for v in values]
        else:
            assert str(space)=='/DeviceRGB',('Unsupported native-text colour space',space)
            profile_key='sRGB';mode='RGB';channels=3;colour_transform=transform_colour
        assert len(values)==channels,(space,values)
        samples=tuple(round(float(v)*255) for v in values)
        key=(profile_key,samples)
        if key not in cache:
            pixel=ImageCms.applyTransform(Image.new(mode,(1,1),samples if channels>1 else samples[0]),colour_transform).getpixel((0,0))
            cache[key]=[FloatObject(v/255) for v in pixel]
        return cache[key]
    def transform(stream,res,state=None):
        nonlocal runs
        out=[];state={'ca':1,'CA':1,'bm':'/Normal','mask':'/None','tr':0,'fill_space':'/DeviceGray','fill_values':[0],'font':None} if state is None else state.copy();stack=[]
        content=ContentStream(stream,reader)
        for values,op in content.operations:
            if op==b'q':stack.append(state.copy())
            elif op==b'Q':state=stack.pop()
            elif op==b'gs':
                gs=resolved(res.get('/ExtGState',{}))[values[0]].get_object()
                for k,f in (('/ca','ca'),('/CA','CA'),('/BM','bm'),('/SMask','mask')):
                    if k in gs:state[f]=gs[k]
            elif op==b'Tr':state['tr']=int(values[0])
            elif op==b'rg':state['fill_space']='/DeviceRGB';state['fill_values']=values
            elif op==b'g':state['fill_space']='/DeviceGray';state['fill_values']=values
            elif op==b'k':state['fill_space']='/DeviceCMYK';state['fill_values']=values
            elif op==b'cs':state['fill_space']=res.get('/ColorSpace',{}).get(values[0],values[0])
            elif op in (b'sc',b'scn'):state['fill_values']=values
            elif op==b'Tf':
                fd=resolved(res.get('/Font',{}).get(values[0],{}));state['font']=str(fd.get('/BaseFont','unknown'))
            elif op in TEXT:
                assert state['tr']==0 and float(state['ca'])==1 and str(state['bm']) in ('/Normal','/Compatible') and str(state['mask'])=='/None',(current_page,state,str(values)[:120])
                runs+=1
                if mode=='art':continue
                assert state['font']!='/Helvetica','Unexpected painted text in unembedded Helvetica'
                out.append((cmyk(state['fill_values'],state['fill_space']),b'k'))
            if op==b'Do':
                ob=res['/XObject'][values[0]].get_object()
                if not hasattr(ob,'get'):continue
                if ob.get('/Subtype')=='/Form' and id(ob) not in seen:
                    seen.add(id(ob)); rr=resolved(ob.get('/Resources',res))
                    ob.set_data(transform(ob,rr,state).get_data())
                    if mode=='text':ob.pop('/Group',None)
            if mode=='text':
                if op in PAINT:out.append(([],b'n'));continue
                if op==b'sh':continue
                if op==b'Do' and res['/XObject'][values[0]].get_object().get('/Subtype')!='/Form':continue
                assert op!=b'INLINE IMAGE','Unexpected inline image'
                # Only opaque fill text remains. Convert its actual active source
                # space immediately before painting, including embedded ICC RGB.
                if op in (b'rg',b'RG',b'g',b'G',b'k',b'K',b'cs',b'CS',b'sc',b'SC',b'scn',b'SCN'):continue
                if op==b'Tf' and state['font']=='/Helvetica':continue
            out.append((values,op))
        assert not stack
        content.operations=out;new=DecodedStreamObject();new.set_data(content.get_data());return new
    cleaned=set()
    def clean(res):
        res=resolved(res)
        if id(res) in cleaned:return
        cleaned.add(id(res));xobs=resolved(res.get('/XObject',{}))
        for name,ref in list(xobs.items()):
            ob=ref.get_object()
            if not hasattr(ob,'get'):
                del xobs[name];continue
            if ob.get('/Subtype')!='/Form':del xobs[name]
            elif '/Resources' in ob:clean(ob['/Resources'])
        res.pop('/Shading',None);res.pop('/Pattern',None);res.pop('/ColorSpace',None)
        for name,ref in list(res.get('/Font',{}).items()):
            if str(resolved(ref).get('/BaseFont'))=='/Helvetica':del res['/Font'][name]
        for ref in resolved(res.get('/ExtGState',{})).values():
            state=ref.get_object()
            for k in ('/SMask','/ca','/CA','/BM'):state.pop(k,None)
    for current_page,page in enumerate(reader.pages,1):
        res=resolved(page['/Resources']);page[NameObject('/Contents')]=transform(page.get_contents(),res)
    # Shared resources may contain source ICC definitions needed by a later
    # page. Finish colour interpretation before deleting art-only resources.
    for page in reader.pages:
        res=resolved(page['/Resources'])
        if mode=='text':clean(res);page.pop('/Group',None)
        writer.add_page(page)
    writer.write(target)
    return runs

def main():
    p=argparse.ArgumentParser();p.add_argument('input');p.add_argument('output');p.add_argument('--split-only',action='store_true');args=p.parse_args()
    source=Path(args.input).resolve();target=Path(args.output).resolve();assert source!=target
    scratch=DOC/'colour-work';scratch.mkdir(parents=True,exist_ok=True)
    art,text=scratch/'art.pdf',scratch/'text.pdf'
    art_runs=split(source,'art',art);text_runs=split(source,'text',text);assert art_runs==text_runs
    print(f'Split layers; retained {text_runs} native text runs',flush=True)
    if args.split_only:return
    srgb=ImageCms.ImageCmsProfile(ImageCms.createProfile('sRGB'));srgb_file=scratch/'render-sRGB.icc';srgb_file.write_bytes(srgb.tobytes())
    reader=PdfReader(source);pages=len(reader.pages)
    def render(bounds):
        first,last=bounds
        command=[POPPLER,'-f',str(first),'-l',str(last),'-r','600','-displayprofile',str(srgb_file),'-defaultrgbprofile',str(srgb_file),'-png',str(art),str(scratch/f'art-{first}')]
        subprocess.run(command,check=True,stderr=subprocess.DEVNULL)
        files=sorted(scratch.glob(f'art-{first}-*.png'));assert len(files)==last-first+1,(bounds,len(files))
        return list(zip(range(first,last+1),files))
    chunk=(pages+3)//4;ranges=[(i,min(i+chunk-1,pages)) for i in range(1,pages+1,chunk)]
    raster_map={}
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for batch in pool.map(render,ranges):
            raster_map.update(batch);print(f'Rendered artwork for {len(batch)} pages',flush=True)
    texts=PdfReader(text);writer=PdfWriter();records=[]
    transform_colour=ImageCms.buildTransform(ImageCms.createProfile('sRGB'),ImageCms.getOpenProfile(str(PROFILE)),'RGB','CMYK',renderingIntent=1)
    for i,(page,words) in enumerate(zip(reader.pages,texts.pages),1):
        raw=Image.open(raster_map[i]).convert('RGB');img=ImageCms.applyTransform(raw,transform_colour);raw.close();assert img.mode=='CMYK'
        data=io.BytesIO();size=tuple(map(float,(page.mediabox.width,page.mediabox.height)))
        c=canvas.Canvas(data,pagesize=size,pageCompression=1);c.drawImage(ImageReader(img),0,0,width=size[0],height=size[1]);c.showPage();c.save()
        base=PdfReader(io.BytesIO(data.getvalue())).pages[0];content=base.get_contents();ops=[];inside=False
        for vals,op in content.operations:
            if op==b'BT':inside=True;continue
            if op==b'ET':inside=False;continue
            if not inside:ops.append((vals,op))
        content.operations=ops;base[NameObject('/Contents')]=content;base['/Resources'].pop('/Font',None)
        base.merge_page(words)
        for box in ('/MediaBox','/CropBox','/TrimBox','/BleedBox'):base[NameObject(box)]=page[box]
        writer.add_page(base)
        records.append({'page':i,'artPixels':list(img.size),'artDpi':[round(img.width*72/size[0],3),round(img.height*72/size[1],3)]})
        img.close();gc.collect()
        if i%20==0:print(f'Assembled page {i}',flush=True)
    profile=DecodedStreamObject();profile.set_data(PROFILE.read_bytes());profile[NameObject('/N')]=NumberObject(4)
    intent=DictionaryObject({NameObject('/Type'):NameObject('/OutputIntent'),NameObject('/S'):NameObject('/GTS_PDFX'),NameObject('/OutputConditionIdentifier'):TextStringObject('FOGRA39'),NameObject('/Info'):TextStringObject('ISO Coated v2 300% (ECI)'),NameObject('/RegistryName'):TextStringObject('http://www.color.org'),NameObject('/DestOutputProfile'):writer._add_object(profile)})
    writer.root_object[NameObject('/OutputIntents')]=ArrayObject([writer._add_object(intent)])
    writer.add_metadata({'/Title':'The Vegetable Guru - '+('interior' if pages>1 else 'cover'),' /Author'.strip():'John Lennon','/Subject':'Second proof colour-managed preparation; 174 pages; 150 gsm coated; 185 x 240 mm trim; FOGRA39. Pending metadata and supplier checks.'})
    writer.pdf_header='%PDF-1.4';target.parent.mkdir(parents=True,exist_ok=True);writer.write(target)
    # Keep the exact sRGB photo inputs needed for selective BPC before cleaning
    # the reconstructible page rasters. Their data must never pass through CMYK.
    retained=scratch/'retained-photo-inputs';retained.mkdir(exist_ok=True)
    for folio in (154,155,168):
        if folio in raster_map:shutil.copy2(raster_map[folio],retained/f'page-{folio:03}.png')
    # Keep art-only/native-text PDFs and the three exact inputs for the audit.
    for file in raster_map.values():file.unlink()
    result={'source':str(source.relative_to(ROOT)),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'pdf':str(target.relative_to(ROOT)),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'bytes':target.stat().st_size,'nativeTextRuns':text_runs,'profile':'ISO Coated v2 300% (ECI), FOGRA39','profileSha256':hashlib.sha256(PROFILE.read_bytes()).hexdigest(),'method':'Opaque non-text CMYK artwork composited at 600 dpi; original native glyphs and geometry preserved. Native text colour converted from its active DeviceRGB/Gray or embedded ICC source space through LittleCMS using relative colorimetric intent. Poppler honours embedded artwork source profiles into explicit sRGB before the same FOGRA39 conversion. Lossless image compression; no PDF/X conformance claim. 600 dpi compositing does not create source detail. Unused Helvetica resources/empty font selections removed after proving no painted text uses them.','pages':records}
    target.with_suffix('.production.json').write_text(json.dumps(result,indent=2)+'\n');print(target,flush=True)
if __name__=='__main__':main()
