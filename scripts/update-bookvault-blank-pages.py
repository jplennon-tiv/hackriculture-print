"""Recolour only intentional production blanks; prove other PDF pages unchanged."""
from pathlib import Path
import hashlib,json,io,math
from pypdf import PdfReader,PdfWriter
from pypdf.generic import DecodedStreamObject,NameObject,DictionaryObject
import pypdf.filters
from PIL import Image,ImageCms
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
ROOT=Path(__file__).resolve().parents[1];DOC=ROOT/'docs/publication/bookvault-print-ready';TMP=ROOT/'tmp/pdfs/bookvault-print-ready';OUT=ROOT/'output/pdf/bookvault-print-ready'
BLANKS={3,6,8,98,168};sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
pypdf.filters.ZLIB_MAX_OUTPUT_LENGTH=150_000_000
transform=ImageCms.buildTransform(ImageCms.createProfile('sRGB'),ImageCms.getOpenProfile(str(DOC/'assets/ISOcoated_v2_300_eci.icc')),'RGB','CMYK',renderingIntent=1)
cm=ImageCms.applyTransform(Image.new('RGB',(1,1),'#fff8e9'),transform).getpixel((0,0))

def fingerprint(page):
    h=hashlib.sha256();c=page.get_contents();h.update(c.get_data() if c else b'');seen=set()
    def walk(res):
        for k,ref in sorted(res.get('/XObject',{}).items()):
            ob=ref.get_object()
            if id(ob) in seen:continue
            seen.add(id(ob));h.update(str(k).encode());h.update(ob._data)
            if '/Resources' in ob:walk(ob['/Resources'])
        for k,ref in sorted(res.get('/Font',{}).items()):
            f=ref.get_object();h.update(str(k).encode());h.update(str(f.get('/BaseFont')).encode())
    walk(page['/Resources']);return h.hexdigest()
records=[]
for kind,file,values,op in [('rgb',TMP/'interior-rgb.pdf',[1,248/255,233/255],'rg'),('cmyk',OUT/'the-vegetable-guru-interior.pdf',[v/255 for v in cm],'k')]:
    before=sha(file);r=PdfReader(file);assert len(r.pages)==168
    if kind=='cmyk':
        img=r.pages[0].images[0].image;assert img.mode=='CMYK' and img.getpixel((200,200))==cm;img.close()
    stable={f:fingerprint(p) for f,p in enumerate(r.pages,1) if f not in BLANKS}
    w=PdfWriter(clone_from=r)
    for f in BLANKS:
        p=w.pages[f-1];assert not p.extract_text().strip()
        if kind=='rgb':
            stream=DecodedStreamObject();stream.set_data(('q '+' '.join(f'{v:.12f}' for v in values)+f' {op} 0 0 {float(p.mediabox.width):.12f} {float(p.mediabox.height):.12f} re f Q').encode())
            p.replace_contents(stream);p[NameObject('/Resources')]=DictionaryObject()
        else:
            # Use the same opaque CMYK image path as neighbouring page artwork.
            # Poppler previews vector and image DeviceCMYK tints differently.
            size=tuple(map(float,(p.mediabox.width,p.mediabox.height)))
            pixels=tuple(math.ceil(v/72*600) for v in size)
            image=Image.new('CMYK',pixels,cm);data=io.BytesIO()
            c=canvas.Canvas(data,pagesize=size,pageCompression=1)
            c.drawImage(ImageReader(image),0,0,width=size[0],height=size[1]);c.showPage();c.save();image.close()
            base=PdfReader(io.BytesIO(data.getvalue())).pages[0];content=base.get_contents();ops=[];inside=False
            for vals,operator in content.operations:
                if operator==b'BT':inside=True;continue
                if operator==b'ET':inside=False;continue
                if not inside:ops.append((vals,operator))
            content.operations=ops;base[NameObject('/Contents')]=content;base['/Resources'].pop('/Font',None)
            p.replace_contents(DecodedStreamObject());p[NameObject('/Resources')]=DictionaryObject();p.merge_page(base)
        p.pop('/Annots',None)
    candidate=file.with_suffix('.candidate.pdf');w.write(candidate);check=PdfReader(candidate)
    assert len(check.pages)==168
    for f,p in enumerate(check.pages,1):
        if f not in BLANKS:assert fingerprint(p)==stable[f],('Unchanged page differs',kind,f)
        else:
            assert not p.extract_text().strip()
            if kind=='rgb':assert not list(p.images)
            else:
                image=p.images[0].image;assert image.mode=='CMYK' and image.getpixel((200,200))==cm;image.close()
            assert p.mediabox==r.pages[f-1].mediabox and p.trimbox==r.pages[f-1].trimbox and p.bleedbox==r.pages[f-1].bleedbox
    candidate.replace(file);records.append({'kind':kind,'file':str(file.relative_to(ROOT)),'previousSha256':before,'sha256':sha(file),'bytes':file.stat().st_size,'unchangedContentAndArtPages':len(stable),'changedFolios':sorted(BLANKS)})
    print(kind,': recoloured five blanks; all other 163 page content/art fingerprints unchanged',flush=True)
receipt={'date':'2026-10-19','request':'John requested cream interior blanks to match surrounding pages','rgbHex':'#fff8e9','cmykByteValues':cm,'cmykPercent':[round(v/255*100,3) for v in cm],'method':'Full-media cream on the five intentionally blank pages: native RGB rectangle in the intermediate; opaque lossless 600 dpi CMYK image in production, matching neighbouring artwork and its preview rendering. No reflow or changes to the other 163 pages. CMYK colour sampled and verified against existing opening-page artwork. Output intent and page boxes retained.','files':records}
(DOC/'BLANK-COLOUR-UPDATE.json').write_text(json.dumps(receipt,indent=2)+'\n')
prep=json.loads((DOC/'INTERIOR-PREPARATION.json').read_text());prep['sha256']=records[0]['sha256'];prep['blankColourUpdate']='BLANK-COLOUR-UPDATE.json';prep['intentionalBlankColour']='#fff8e9';(DOC/'INTERIOR-PREPARATION.json').write_text(json.dumps(prep,indent=2)+'\n')
file=OUT/'the-vegetable-guru-interior.production.json';d=json.loads(file.read_text());d['sha256']=records[1]['sha256'];d['bytes']=records[1]['bytes'];d['sourceSha256']=records[0]['sha256'];d['blankColourUpdate']='docs/publication/bookvault-print-ready/BLANK-COLOUR-UPDATE.json'
for p in d['pages']:
    if p['page'] in BLANKS:
        p['artPixels']=list(pixels);p['artDpi']=[round(pixels[i]*72/size[i],3) for i in (0,1)];p.pop('vectorCreamBackground',None);p['creamBackground']=True
file.write_text(json.dumps(d,indent=2)+'\n')
pf=DOC/'PREFLIGHT.json';d=json.loads(pf.read_text());item=next(x for x in d['checks'] if x['kind']=='interior');item['sha256']=records[1]['sha256']
for p in item['checks']:
    if p['page'] in BLANKS:
        p['nativeFontsEmbedded']={};p['imageSpaces']=['/DeviceCMYK'];p['artDpi']=round(min(pixels[i]*72/size[i] for i in (0,1)),2);p.pop('vectorCreamBackground',None);p['creamBackground']=True
item['incrementalVerification']='BLANK-COLOUR-UPDATE.json: five empty pages now CMYK cream; remaining 163 content/art fingerprints exactly unchanged.'
pf.write_text(json.dumps(d,indent=2)+'\n')
