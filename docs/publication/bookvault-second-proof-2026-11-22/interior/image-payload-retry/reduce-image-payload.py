"""Change only selected CMYK image streams in the already-repaired PDF/X-3 file."""
from pathlib import Path
from io import BytesIO
from collections import defaultdict,Counter
import importlib.util,hashlib,json,multiprocessing as mp,struct,zlib
from PIL import Image
from pypdf import PdfReader,PdfWriter
from pypdf.generic import NameObject,NumberObject,DictionaryObject
ROOT=Path(__file__).resolve().parents[5]
DOC=Path(__file__).resolve().parent
SOURCE=ROOT/'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-PDFX3.pdf'
OUTPUT=ROOT/'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-PDFX3-Optimised.pdf'
WORK=ROOT/'tmp/pdfs/bookvault-image-payload-retry'
EXPECTED_SHA='3fab6007b25ee8f88a568f1e346813e8c03bba0f181f013c9e2f84d667cd09f9'
KEEP_600={7,146,167}|set(range(9,96,2))
spec=importlib.util.spec_from_file_location('pdfx_verify',DOC.parent/'pdfx-retry/verify-pdfx.py')
helpers=importlib.util.module_from_spec(spec);spec.loader.exec_module(helpers)

def sha(x):return hashlib.sha256(x).hexdigest()
def png_compress(raw,size):
    # Treat the four CMYK byte channels as four uninterpreted PNG channels solely
    # to use lossless PNG scanline prediction. Never resize or colour-convert RGBA.
    im=Image.frombytes('RGBA',size,raw);f=BytesIO();im.save(f,format='PNG',compress_level=6)
    data=f.getvalue();at=8;parts=[]
    while at<len(data):
        n=struct.unpack_from('>I',data,at)[0];tag=data[at+4:at+8]
        if tag==b'IDAT':parts.append(data[at+8:at+8+n])
        at+=n+12
    return b''.join(parts)

def resize_job(job):
    ident,encoded,width,height,pages=job
    # All selected source objects are Ghostscript PNG-predictor CMYK streams.
    def chunk(tag,body):return struct.pack('>I',len(body))+tag+body+struct.pack('>I',zlib.crc32(tag+body)&0xffffffff)
    png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',width,height,8,6,0,0,0))+chunk(b'IDAT',encoded)+chunk(b'IEND',b'')
    raw=Image.open(BytesIO(png)).tobytes()
    image=Image.frombytes('CMYK',(width,height),raw)
    smaller=image.resize((width//2,height//2),Image.Resampling.LANCZOS)
    out_raw=smaller.tobytes();data=png_compress(out_raw,smaller.size)
    (WORK/f'{ident}.flate').write_bytes(data)
    return {'sourceObject':ident,'folios':pages,'sourceDimensions':[width,height],'outputDimensions':list(smaller.size),'sourceEncodedBytes':len(encoded),'outputEncodedBytes':len(data),'sourcePixelsSHA256':sha(raw),'resampledPixelsSHA256':sha(out_raw),'outputStreamSHA256':sha(data),'resampling':'Pillow CMYK-channel Lanczos, exact factor 2; no colour-space conversion','filter':'FlateDecode with PNG predictor 15, lossless after resampling'}

def resources(reader):
    images={};pages=defaultdict(set)
    def walk(res,folio,seen):
        for ref in res.get('/XObject',{}).values():
            obj=ref.get_object();key=ref.idnum
            if key in seen:continue
            seen.add(key)
            if obj.get('/Subtype')=='/Form':walk(obj.get('/Resources',{}),folio,seen)
            elif obj.get('/Subtype')=='/Image':images[key]=obj;pages[key].add(folio)
    for folio,page in enumerate(reader.pages,1):walk(page['/Resources'],folio,set())
    return images,pages

if __name__=='__main__':
    assert not OUTPUT.exists(),'Refusing to overwrite existing candidate'
    WORK.mkdir(parents=True,exist_ok=True)
    source_sha=hashlib.file_digest(SOURCE.open('rb'),'sha256').hexdigest();assert source_sha==EXPECTED_SHA
    r=PdfReader(SOURCE);images,pages=resources(r);jobs=[];preserved=[]
    for ident,obj in images.items():
        fp=sorted(pages[ident]);dims=(int(obj['/Width']),int(obj['/Height']))
        if dims==(4512,5812) and not (pages[ident]&KEEP_600):
            assert obj['/ColorSpace']=='/DeviceCMYK' and obj['/BitsPerComponent']==8
            assert obj['/Filter']=='/FlateDecode' and obj['/DecodeParms']['/Predictor']==15
            assert obj['/DecodeParms']['/Colors']==4 and '/SMask' not in obj and '/Mask' not in obj
            jobs.append((ident,obj._data,*dims,fp))
        else:preserved.append({'sourceObject':ident,'folios':fp,'dimensions':list(dims),'encodedSHA256':sha(obj._data)})
    print('Selected',len(jobs),'image streams; preserving',len(preserved),flush=True)
    changes=[]
    with mp.Pool(3) as pool:
        for change in pool.imap(resize_job,jobs):
            changes.append(change)
            if len(changes)%10==0:print('Resampled',len(changes),flush=True)
    # Preserve the complete document first; only mutate the specifically mapped
    # image stream bytes, their dimensions and predictor column count.
    w=PdfWriter();w.clone_document_from_reader(r)
    writer_images,writer_pages=resources(w)
    by_use={(tuple(sorted(writer_pages[i])),int(o['/Width']),int(o['/Height'])):o for i,o in writer_images.items()}
    for change in changes:
        key=(tuple(change['folios']),*change['sourceDimensions']);obj=by_use[key]
        assert sha(obj._data)==sha(images[change['sourceObject']]._data)
        obj._data=(WORK/f"{change['sourceObject']}.flate").read_bytes()
        obj[NameObject('/Width')]=NumberObject(change['outputDimensions'][0]);obj[NameObject('/Height')]=NumberObject(change['outputDimensions'][1])
        old=obj['/DecodeParms'];params=DictionaryObject(dict(old));params[NameObject('/Columns')]=NumberObject(change['outputDimensions'][0]);obj[NameObject('/DecodeParms')]=params
        # No decoded-stream cache existed on the writer image; never copy source
        # cached pixels over the newly encoded data.
        if hasattr(obj,'decoded_self'):obj.decoded_self=None
    with OUTPUT.open('wb') as f:w.write(f)
    report={'source':str(SOURCE.relative_to(ROOT)),'sourceSHA256':source_sha,'output':str(OUTPUT.relative_to(ROOT)),'outputBytes':OUTPUT.stat().st_size,'outputSHA256':hashlib.file_digest(OUTPUT.open('rb'),'sha256').hexdigest(),'preserved600dpiFolios':sorted(KEEP_600),'changedImageCount':len(changes),'preservedImageCount':len(preserved),'changes':changes,'preservedImages':preserved,'method':'Clone the complete existing PDF/X-3; replace only selected full-page CMYK image streams with factor-two Lanczos resampled pixels, losslessly Flate-encoded. No Ghostscript rerender or colour conversion.'}
    (DOC/'IMAGE-PAYLOAD-CHANGES.json').write_text(json.dumps(report,indent=2)+'\n')
    print('Wrote',OUTPUT,OUTPUT.stat().st_size,report['outputSHA256'],flush=True)
