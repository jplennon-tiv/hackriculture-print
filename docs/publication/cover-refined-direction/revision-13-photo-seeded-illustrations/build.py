"""Version 3: photo-seeded house illustrations, with the retained centre/sticker."""
from pathlib import Path
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from pypdf import PdfReader
import json, hashlib, shutil

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
OUT = ROOT / 'docs/publication/cover-versions/version-3'
OUT.mkdir(exist_ok=True)
PREVIOUS = ROOT / 'docs/publication/cover-refined-direction/revision-12-flowers-tomatoes/LAYOUT.json'
prior = json.loads(PREVIOUS.read_text())
V1 = ROOT / 'docs/publication/cover-versions/version-1/Version-1.png'
W, H = 1100, 1430
assets = {
    'top': ('exec-cb0af2f8-96b3-40dc-aae2-ead9eef49f7a.png', 'courgette-illustration.png'),
    'bottom': ('exec-c0633475-c9b4-4d2e-bce8-dbd170b20611.png', 'tomato-illustration.png'),
}
for source, target in assets.values():
    shutil.copyfile(ROOT / 'generated_images' / source, HERE / target)

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def polygon(c, points):
    p = c.beginPath(); p.moveTo(points[0][0], H-points[0][1])
    for x, y in points[1:]: p.lineTo(x, H-y)
    p.close()
    return p

def art(c, path, y):
    with Image.open(path) as im:
        width, height = im.size
    h = W * height / width
    c.drawImage(str(path), 0, H-y-h, W, h, mask='auto')
    return [0, y, W, h]

pdf = OUT / 'Version-3.pdf'
c = canvas.Canvas(str(pdf), pagesize=(185*mm,240*mm), pageCompression=1)
c.setTitle('The Vegetable Guru — Version 3: photo-seeded illustrations')
c.setAuthor('Prepared for John Lennon')
c.saveState(); c.scale(185*mm/W,240*mm/H)
c.setFillColorRGB(249/255,240/255,222/255); c.rect(0,0,W,H,fill=1,stroke=0)
# Preserve the previous strip geometry. Alpha silhouettes alone cross these edges.
c.setFillColorRGB(231/255,237/255,219/255)
c.rect(0,H-330,W,330,fill=1,stroke=0)
c.rect(0,0,W,442,fill=1,stroke=0)
for x,y,w,h,rgb in [(878,330,137,80,(248,239,220)),(0,858,255,130,(249,241,223))]:
    c.setFillColorRGB(*(v/255 for v in rgb)); c.rect(x,H-y-h,w,h,fill=1,stroke=0)
centre = [(x, 332 if y == 330 else y) for x,y in prior['centre_clip_points']]
# Trim two pixels of old photographic boundary from the inherited cream clipping.
c.saveState(); c.clipPath(polygon(c,centre),stroke=0,fill=0)
c.drawImage(str(V1),0,0,W,H); c.restoreState()
placements = {
    'top': art(c,HERE/'courgette-illustration.png',-16),
    'bottom': art(c,HERE/'tomato-illustration.png',H-W*846/1860),
}
# The retained white sticker is the final foreground layer, above all illustration.
sticker = prior['sticker_clip_points']
c.saveState()
for amount,alpha in [(12,.025),(9,.035),(6,.045),(3,.055)]:
    c.setFillAlpha(alpha); c.setFillColorRGB(.09,.16,.08)
    points=[(907+(x-907)*(1+amount/160),1133+(y-1129)*(1+amount/160)) for x,y in sticker]
    c.drawPath(polygon(c,points),stroke=0,fill=1)
c.restoreState()
c.saveState(); c.clipPath(polygon(c,sticker),stroke=0,fill=0)
c.drawImage(str(V1),0,0,W,H); c.restoreState()
c.restoreState(); c.showPage(); c.save()

reader=PdfReader(pdf)
assert len(reader.pages)==1
assert abs(float(reader.pages[0].mediabox.width)/mm-185)<.01
assert abs(float(reader.pages[0].mediabox.height)/mm-240)<.01
record={
    'date':'2026-11-15','status':'Experimental Version 3, awaiting John’s review; not production-approved',
    'request':'Use the two Version 2 photographs as composition seeds for same-slot illustrations in the book house style, with restrained overflows.',
    'base':'docs/publication/cover-versions/version-2/Version-2.pdf',
    'photo_crops':prior['crop_rectangles_source_pixels'],
    'style_authorities':['public/images/heroes/richer-a/marrow_courgette.png','public/images/heroes/richer-a/tomato-greenhouse.png','public/images/heroes/richer-a/capsicum.png'],
    'generation':'GENERATION.json',
    'intentionally_replaced':'Photographic strips become separate illustrated plants; soil, labels, greenhouse structure and photographic backgrounds omitted. Bright pale sage behind alpha silhouettes.',
    'preserved':'Exact centre lettering, sprout, subtitle, author and tilted sticker pixels from Version 1 via Version 2 clipping geometry. Sticker size, position, angle and foreground order retained.',
    'dimensions_mm':[185,240], 'coordinates':[W,H],
    'base_strip_boxes':{'top':[0,0,1100,330],'bottom':[0,988,1100,442]},
    'artwork_placements':placements, 'scaling':'Uniform within the 1100×1430 cover coordinate system; no asset stretching or recolouring',
    'centre_clip_points':centre,'sticker_clip_points':sticker,
    'boundary_cleanup':'The top cream clip begins at y332 instead of y330 to omit a two-pixel photographic seam; no lettering or sprout pixels are changed.',
    'back_changed':False,'main_book_changed':False,
    'files':{}, 'review':'Rendered review pending'
}
paths=[V1,pdf,HERE/'courgette-illustration.png',HERE/'tomato-illustration.png',HERE/'courgette-photo-seed.jpg',HERE/'tomato-photo-seed.jpg']
for path in paths:
    record['files'][str(path.relative_to(ROOT))]={'bytes':path.stat().st_size,'sha256':sha(path)}
(HERE/'LAYOUT.json').write_text(json.dumps(record,indent=2)+'\n')
(OUT/'VERSION.json').write_text(json.dumps({
    'version':3,'date':'2026-11-15','status':'Experimental design for review; not approved',
    'request':record['request'],'pdf':str(pdf.relative_to(ROOT)),'sha256':sha(pdf),
    'bytes':pdf.stat().st_size,'dimensions_mm':[185,240],
    'layout':str((HERE/'LAYOUT.json').relative_to(ROOT)),
    'previous_versions_preserved':[1,2],'back_changed':False,'main_book_changed':False
},indent=2)+'\n')
print(json.dumps({'pdf':str(pdf),'bytes':pdf.stat().st_size,'placements':placements,'sha256':sha(pdf)},indent=2))
