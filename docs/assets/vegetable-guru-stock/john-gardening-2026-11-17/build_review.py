from pathlib import Path
import json, hashlib, zipfile
from PIL import Image
import numpy as np
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parent
jobs=json.loads((ROOT/'COMPOSITIONS.json').read_text())
sources=json.loads((ROOT/'SOURCES.json').read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
checks=[]
for j in jobs:
    p=ROOT/'assets'/f"{j['id']}.png"
    with Image.open(p) as im:
        assert im.mode=='RGBA', (p,im.mode)
        a=np.asarray(im.getchannel('A'))
        y,x=np.where(a>127)
        bbox=[int(x.min()),int(y.min()),int(x.max()+1),int(y.max()+1)]
        edge=np.concatenate([a[0],a[-1],a[:,0],a[:,-1]])
        j.update(file=str(p.relative_to(ROOT)),sha256=sha(p),width=im.width,height=im.height,mode=im.mode,status='candidate; awaiting John’s likeness and design review',native_canvas_mm_at_300ppi=[round(im.width/300*25.4,1),round(im.height/300*25.4,1)])
        checks.append({'id':j['id'],'alpha_min':int(a.min()),'alpha_max':int(a.max()),'transparent_fraction':round(float((a==0).mean()),4),'solid_bbox':bbox,'outer_edge_alpha_max':int(edge.max()),'solid_margins_px':[bbox[0],bbox[1],im.width-bbox[2],im.height-bbox[3]],'full_source_hash_match':sha(p)==sha(Path(json.loads((ROOT/'recipes'/f"{j['id']}.result.json").read_text())['generated_path']))})
        assert (a==0).any() and (a>=250).any()
for s in sources: assert sha(ROOT/s['file'])==s['sha256'],s['id']
manifest={'date':'2026-11-17','purpose':'Source-derived illustrations of John gardening for potential interior-book use','status':'Four new proposals, not installed in approved pages','style_authority':'Approved public/images/heroes/richer-a vegetable artwork; reference copies retained','identity_sources':['T05','L573'],'entries':jobs,'notes':['Faces and clothes are simplified to drawn colour planes while retaining distinguishing features.','Setting details, partly obscured limbs and plant forms are interpreted. These are generated illustrations, not unaltered photographs.','No canonical book data or approved pages were changed.']}
(ROOT/'ARTWORK.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
(ROOT/'CHECKS.json').write_text(json.dumps({'items':checks,'source_hashes_verified':True,'coverage':'RGBA, alpha bounds, source and master byte hashes. Visual findings recorded separately.'},indent=2)+'\n')

W,H=595.276,841.89
pdf=ROOT/'John-Gardening-Illustrations-Preview.pdf'
c=canvas.Canvas(str(pdf),pagesize=(W,H),pageCompression=1)
c.setTitle('John gardening — four illustration proposals')
c.setAuthor('The Vegetable Guru')
green=HexColor('#183e30'); cream=HexColor('#fff8e8')
style=ParagraphStyle('note',fontName='Helvetica',fontSize=10,leading=14,textColor=green)
def text(s,x,y,w=515):
    p=Paragraph(s,style);_,h=p.wrap(w,200);p.drawOn(c,x,y-h);return y-h
def image(p,x,y,w,h):
    im=Image.open(p); iw,ih=im.size
    scale=min(w/iw,h/ih);dw,dh=iw*scale,ih*scale
    c.drawImage(ImageReader(str(p)),x+(w-dw)/2,y+(h-dh)/2,dw,dh,mask='auto')
def page(title,n):
    c.setFillColor(cream);c.rect(0,0,W,H,stroke=0,fill=1)
    c.setFillColor(green);c.setFont('Helvetica-Bold',21);c.drawString(40,H-50,title)
    c.setFont('Helvetica',9);c.drawString(40,26,'The Vegetable Guru • Illustration proposals • 17 November 2026')
    c.drawRightString(W-40,26,str(n))

page('John in the garden',1)
text('Four photo-derived drawings in the book’s illustration style. Transparent PNG masters are supplied separately; cream is the preview background.',40,H-71)
image(ROOT/'review/contact-cream.jpg',30,282,W-60,430)
text('Direct drawing-style references',40,259)
for i,name in enumerate(['tomato-greenhouse','lettuce','marrow_courgette']):
    image(ROOT/'review'/f'style-{name}.jpg',40+i*172,90,155,144)
text('Approved vegetable heroes supply the broad colour planes, simplified foliage and pale highlights. The people and scene compositions remain new proposals.',40,77)
c.showPage()
for k,j in enumerate(jobs,2):
    page(j['id'][:2]+'  '+j['title'],k)
    text(j['interpretation'],40,H-72)
    image(ROOT/'review'/f"{j['id']}-cream.jpg",38,286,W-76,443)
    c.setFillColor(green);c.setFont('Helvetica-Bold',10);c.drawString(40,269,'Photographic references')
    ids=j['source_ids']; box=(W-80)/len(ids)
    for i,sid in enumerate(ids):
        image(ROOT/'review'/f'source-{sid}.jpg',40+i*box,126,box-9,125)
        c.setFont('Helvetica',9);c.drawString(40+i*box,113,sid)
    text('Sources: John’s own photographs and video material. Source paths, video timestamps, unchanged originals and exact generation prompts are retained in the project records.',40,92)
    c.showPage()
c.save()
assert len(PdfReader(str(pdf)).pages)==5

hashes={str(p.relative_to(ROOT)):sha(p) for folder in ['assets','sources','style-references','recipes'] for p in sorted((ROOT/folder).glob('*')) if p.is_file()}
(ROOT/'SHA256.json').write_text(json.dumps(hashes,indent=2)+'\n')
readme='''# John gardening — four illustration proposals

17 November 2026. Four separate source-derived drawings for possible use inside
The Vegetable Guru. These remain candidates for John's review; none is installed
in an approved page.

1. Standing with the tomato harvest.
2. Picking tomatoes.
3. Picking salad leaves.
4. Planting out.

Use the original RGBA PNGs in `assets/`, preserving transparency. The cream JPEGs
and PDF are review copies. No repeated raster editing, denoising or upscaling was
applied. The supplied masters are the exact first-generation outputs. At 300 ppi,
their canvases are about 87 × 130 mm (portrait) or 130 × 87 mm (landscape).

The likeness comes from John's own tomato-harvest and salad-harvest video frames.
The first two drawings closely follow those activities. Salad picking reconstructs
a wider view from a hands-and-bed close-up. Planting out combines John's likeness
with his young-plant/rootball photograph; the pose, visible seedling leaves and
nearby props are imagined. It is a general plant-raising illustration, not an exact
crop-identification or technical planting diagram. All settings are simplified.

The original source frames are unchanged under `sources/` in the project. The
source register records their filenames, original paths, video timing and hashes.
Exact prompts are in `recipes/`; copies of the approved drawing references are in
`style-references/`. The downloadable artwork ZIP includes masters, prompts,
source records and smaller source comparison previews; full native photographs
and the complete source package remain alongside it in the project.

See `ARTWORK.json`, `SOURCES.json`, `CHECKS.json`, `VISUAL-REVIEW.json` and
`SHA256.json` for provenance and recorded checks. A technical or visual check is
not approval of likeness or page placement.
'''
(ROOT/'README.md').write_text(readme)
for name,with_sources in [('John-Gardening-Illustrations.zip',False),('John-Gardening-Illustrations-Source-Masters.zip',True)]:
    dest=ROOT/name
    with zipfile.ZipFile(dest,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        folders=['sources','style-references'] if with_sources else ['assets','recipes','review']
        for folder in folders:
            for p in sorted((ROOT/folder).glob('*')):
                if p.is_file() and p.suffix not in ['.mjs','.py'] and not p.name.endswith('-dark.jpg') and not p.name.startswith('pdf-'):
                    z.write(p,'John-Gardening/'+str(p.relative_to(ROOT)))
        for name2 in ['README.md','ARTWORK.json','SOURCES.json','SHA256.json','CHECKS.json','COMPOSITIONS.json','VISUAL-REVIEW.json']:
            p=ROOT/name2
            if p.exists():z.write(p,'John-Gardening/'+name2)
        if not with_sources:z.write(pdf,'John-Gardening/'+pdf.name)
    with zipfile.ZipFile(dest) as z: assert z.testzip() is None
    print(dest.name,dest.stat().st_size,sha(dest))
print(pdf.name,pdf.stat().st_size,'5 pages')
