"""Check PDF/X conversion, exact image bytes, text and actual page renders."""
from pathlib import Path
from collections import Counter
from io import BytesIO
import hashlib,json,multiprocessing as mp,re,struct,unicodedata,zlib

import numpy as np
from PIL import Image
import pypdfium2 as pdfium
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[5]
DOC=Path(__file__).resolve().parent
SOURCE=ROOT/'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Corrected-Headers.pdf'
LOSSLESS=ROOT/'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Supplier-Compatible.pdf'
CANDIDATE=ROOT/'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-PDFX3.pdf'
SELECTED={1,7,19,24,98,150,154,163,168,173}

def digest(data):return hashlib.sha256(data).hexdigest()

def image_bytes(obj):
    filters=obj.get('/Filter')
    if filters!='/FlateDecode':
        return obj.get_data()
    params=obj.get('/DecodeParms',{})
    predictor=params.get('/Predictor',1) if params else 1
    if predictor==1:return zlib.decompress(obj._data)
    assert predictor==15 and obj.get('/BitsPerComponent')==8,(predictor,obj)
    w,h=int(obj['/Width']),int(obj['/Height'])
    colours=int(params.get('/Colors',1))
    def chunk(tag,body):return struct.pack('>I',len(body))+tag+body+struct.pack('>I',zlib.crc32(tag+body)&0xffffffff)
    # PNG scanline filtering is identical for four byte channels. Reading as
    # RGBA here only reverses filters; it does not interpret CMYK as RGB.
    png=b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',w,h,8,{1:0,3:2,4:6}[colours],0,0,0))+chunk(b'IDAT',obj._data)+chunk(b'IEND',b'')
    return Image.open(BytesIO(png)).tobytes()

def image_inventory(reader):
    result={};seen=set()
    def visit(res):
        for ref in res.get('/XObject',{}).values():
            obj=ref.get_object();key=ref.idnum if hasattr(ref,'idnum') else id(obj)
            if key in seen:continue
            seen.add(key)
            if obj.get('/Subtype')=='/Form':visit(obj.get('/Resources',{}))
            elif obj.get('/Subtype')=='/Image':
                raw=image_bytes(obj)
                value={'width':int(obj['/Width']),'height':int(obj['/Height']),
                       'bits':int(obj.get('/BitsPerComponent',1)),
                       'colourSpace':str(obj.get('/ColorSpace')),'rawSHA256':digest(raw)}
                result[digest(json.dumps(value,sort_keys=True).encode())]=value
    for page in reader.pages:visit(page['/Resources'])
    return result

def init():
    global before,after
    before=pdfium.PdfDocument(str(SOURCE));after=pdfium.PdfDocument(str(CANDIDATE))

def compare(i):
    a,b=before[i],after[i]
    ta,tb=a.get_textpage(),b.get_textpage()
    at=unicodedata.normalize('NFKC',ta.get_text_range())
    bt=unicodedata.normalize('NFKC',tb.get_text_range())
    norm=lambda s:re.sub(r'\s+','',s)
    words=lambda s:set(re.findall(r'[\w]+',s.lower()))
    ai=a.render(scale=120/72).to_pil().convert('RGB')
    bi=b.render(scale=120/72).to_pil().convert('RGB')
    aa,bb=np.asarray(ai),np.asarray(bi)
    assert aa.shape==bb.shape
    diff=np.abs(aa.astype(np.int16)-bb.astype(np.int16))
    result={'folio':i+1,'textEqualIgnoringWhitespaceAndUnicodeLigatures':norm(at)==norm(bt),
            'sourceOnlyWords':sorted(words(at)-words(bt)),'candidateOnlyWords':sorted(words(bt)-words(at)),
            'meanAbsoluteChannelDifference':float(diff.mean()),'pixelsOver10':int(np.any(diff>10,axis=2).sum()),
            'totalPixels':ai.width*ai.height}
    if i+1 in SELECTED:
        for label,page in [('source',a),('pdfx',b)]:
            page.render(scale=144/72).to_pil().convert('RGB').save(DOC/f'{i+1:03d}-{label}.jpg',quality=95)
    bi.thumbnail((185,240))
    bi.save(DOC/'thumbnails'/f'{i+1:03d}.jpg',quality=90)
    ta.close();tb.close();a.close();b.close()
    return result

def preflight(reader):
    root=reader.trailer['/Root']; profile=root['/OutputIntents'][0].get_object()['/DestOutputProfile'].get_object()
    seen=set();issues=[];fontcounts=Counter();spaces=Counter()
    def walk(obj):
        if hasattr(obj,'idnum'):
            key=(obj.idnum,obj.generation)
            if key in seen:return
            seen.add(key);obj=obj.get_object()
        if isinstance(obj,dict):
            if obj.get('/Subtype')=='/Image':spaces[str(obj.get('/ColorSpace'))]+=1
            if obj.get('/Type')=='/Font' and obj.get('/Subtype')!='/Type0':
                sub=str(obj.get('/Subtype'));fontcounts[sub]+=1
                if sub!='/Type3':
                    fd=obj.get('/FontDescriptor',{})
                    if hasattr(fd,'get_object'):fd=fd.get_object()
                    if not any(k in fd for k in ('/FontFile','/FontFile2','/FontFile3')):issues.append('Unembedded font '+str(obj.get('/BaseFont')))
            for k in ('/ca','/CA'):
                if k in obj and float(obj[k])!=1:issues.append('Transparency '+k)
            if obj.get('/S')=='/Transparency':issues.append('Transparency group')
            if '/SMask' in obj and obj['/SMask']!='/None':issues.append('Soft mask')
            if '/BM' in obj and obj['/BM'] not in ('/Normal','/Compatible'):issues.append('Blend mode')
            for k in ('/JavaScript','/EmbeddedFiles','/AcroForm'):
                if k in obj:issues.append('Disallowed interactive feature '+k)
            for k,v in obj.items():
                if k!='/Parent':walk(v)
        elif isinstance(obj,list):
            for v in obj:walk(v)
    walk(root)
    return {'version':reader.pdf_header,'pdfx':str(reader.metadata.get('/GTS_PDFXVersion')),
            'outputIntent':str(root['/OutputIntents'][0].get_object().get('/OutputConditionIdentifier')),
            'profileSHA256':digest(profile.get_data()),'fontTypes':dict(fontcounts),'imageColourSpaces':dict(spaces),'issues':sorted(set(issues))}

if __name__=='__main__':
    (DOC/'thumbnails').mkdir(exist_ok=True)
    src,loss,can=PdfReader(SOURCE),PdfReader(LOSSLESS),PdfReader(CANDIDATE)
    assert len(src.pages)==len(can.pages)==174
    checks=preflight(can)
    checks['sourceProfileSHA256']=digest(src.trailer['/Root']['/OutputIntents'][0].get_object()['/DestOutputProfile'].get_object().get_data())
    checks['maxPageBoxDifferencePoints']=max(abs(float(x)-float(y)) for a,b in zip(src.pages,can.pages) for key in ('/MediaBox','/TrimBox','/BleedBox') for x,y in zip(a[key],b[key]))
    checks['candidateBytes']=CANDIDATE.stat().st_size
    checks['candidateSHA256']=hashlib.file_digest(CANDIDATE.open('rb'),'sha256').hexdigest()
    print('Structure checked',flush=True)
    images_a=image_inventory(loss);print('Source image bytes checked',flush=True)
    images_b=image_inventory(can);print('Converted image bytes checked',flush=True)
    checks['imageByteComparison']={'sourceUnique':len(images_a),'candidateUnique':len(images_b),
       'missing':list(images_a.keys()-images_b.keys()),'added':list(images_b.keys()-images_a.keys()),
       'allImageBytesAndDimensionsExact':images_a==images_b}
    (DOC/'IMAGE-BYTES.json').write_text(json.dumps({'source':images_a,'candidate':images_b},indent=2)+'\n')
    with mp.Pool(4,initializer=init) as pool:
        pages=[]
        for page in pool.imap(compare,range(174)):
            pages.append(page)
            if len(pages)%25==0:print('Rendered',len(pages),flush=True)
    checks['pages']=pages
    (DOC/'CHECKS.json').write_text(json.dumps(checks,indent=2)+'\n')
    print(json.dumps({k:v for k,v in checks.items() if k!='pages'},indent=2),flush=True)
    print('Text differences',json.dumps([p for p in pages if not p['textEqualIgnoringWhitespaceAndUnicodeLigatures']]),flush=True)
