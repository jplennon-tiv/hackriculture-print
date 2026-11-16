"""Version 4: two smaller upper groups, with clear cream space above the title."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from pypdf import PdfReader
import json, hashlib, shutil

HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
OUT=ROOT/'docs/publication/cover-versions/version-4'
ART=HERE.parent/'revision-14-three-square-panels'
V3=HERE.parent/'revision-13-photo-seeded-illustrations'
prior=json.loads((V3/'LAYOUT.json').read_text())
V1=ROOT/'docs/publication/cover-versions/version-1/Version-1.png'
W,H=1100,1430
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
archive=OUT/'references/full-width-cream';archive.mkdir(parents=True,exist_ok=True)
for name in ['Version-4.pdf','Version-4-review.pdf','VERSION.json','DELIVERY.json']:
 if (OUT/name).exists() and not (archive/name).exists():shutil.copyfile(OUT/name,archive/name)
def polygon(c,pts):
 p=c.beginPath();p.moveTo(pts[0][0],H-pts[0][1])
 for x,y in pts[1:]:p.lineTo(x,H-y)
 p.close();return p
def art(c,path,box):
 x,y,w,h=box;c.drawImage(str(path),x,H-y-h,w,h,mask='auto')

pdf=OUT/'Version-4.pdf'
c=canvas.Canvas(str(pdf),pagesize=(185*mm,240*mm),pageCompression=1)
c.setTitle('The Vegetable Guru — Version 4: quieter two-group top');c.setAuthor('Prepared for John Lennon')
c.saveState();c.scale(185*mm/W,240*mm/H)
c.setFillColorRGB(249/255,240/255,222/255);c.rect(0,0,W,H,stroke=0,fill=1)
for x,y,w,h,rgb in [(878,330,137,80,(248,239,220)),(0,858,255,130,(249,241,223))]:
 c.setFillColorRGB(*(v/255 for v in rgb));c.rect(x,H-y-h,w,h,stroke=0,fill=1)
c.saveState();c.clipPath(polygon(c,prior['centre_clip_points']),stroke=0,fill=0);c.drawImage(str(V1),0,0,W,H);c.restoreState()
# Roughly one-third smaller than revision 15, with natural asymmetry and open cream.
placements={'flowers':[42,0,250,250],'garlic':[805,8,234,234]}
for name,box in placements.items():art(c,ART/(name+'-illustration.png'),box)
art(c,V3/'tomato-illustration.png',prior['artwork_placements']['bottom'])
sticker=prior['sticker_clip_points'];c.saveState()
for amount,alpha in [(12,.025),(9,.035),(6,.045),(3,.055)]:
 c.setFillAlpha(alpha);c.setFillColorRGB(.09,.16,.08)
 pts=[(907+(x-907)*(1+amount/160),1133+(y-1129)*(1+amount/160)) for x,y in sticker]
 c.drawPath(polygon(c,pts),stroke=0,fill=1)
c.restoreState();c.saveState();c.clipPath(polygon(c,sticker),stroke=0,fill=0);c.drawImage(str(V1),0,0,W,H);c.restoreState()
c.restoreState();c.showPage();c.save()
# This focused revision preview is the front only; earlier source pages are retained.
review=OUT/'Version-4-review.pdf';shutil.copyfile(pdf,review)
record={'date':'2026-11-15','status':'Quieter-top Version 4 trial awaiting John’s review',
 'request':'John authorised the proposed simplification: reduce upper artwork height by roughly a third; smaller courgette group left, garlic pair right; omit cabbage and leave a generous uninterrupted band of cream above the title.',
 'base':'docs/publication/cover-refined-direction/revision-15-full-width-cream/LAYOUT.json',
 'dimensions_mm':[185,240],'placements':placements,'scale_change':{'flowers':250/374,'garlic':234/350},
 'clear_cream_band_cover_coordinates':[0,250,1100,82],
 'cream_rgb':[249,240,222],
 'intentional_omissions':'Cabbage removed from this front only; artwork and source photographs retained. The latest review PDF is front-only; original source-reference page remains in earlier revision archives.',
 'preserved':'Exact courgette/garlic image files; tomato artwork/placement; cream field above and below; centre lettering/sprout/author; sticker position/angle/size/foreground order. All prior cover revisions, back and main book retained.',
 'artwork_method':'Native PDF placement only, using uniform scaling; no regeneration, distortion or recolouring.',
 'review':'Rendered review pending','files':{}}
for p in [pdf,review,V1,V3/'tomato-illustration.png']+[ART/(n+'-illustration.png') for n in placements]:
 record['files'][str(p.relative_to(ROOT))]={'bytes':p.stat().st_size,'sha256':sha(p)}
(HERE/'LAYOUT.json').write_text(json.dumps(record,indent=2)+'\n')
(OUT/'VERSION.json').write_text(json.dumps({'version':4,'revision':'quieter-two-group-top','date':'2026-11-15','status':record['status'],'pdf':str(pdf.relative_to(ROOT)),'review_pdf':str(review.relative_to(ROOT)),'sha256':sha(pdf),'review_sha256':sha(review),'layout':str((HERE/'LAYOUT.json').relative_to(ROOT)),'earlier_revisions':['references/three-square-panels','references/full-width-cream'],'previous_versions_preserved':[1,2,3]},indent=2)+'\n')
assert len(PdfReader(pdf).pages)==1
print(json.dumps({'pdf':str(pdf),'bytes':pdf.stat().st_size,'sha256':sha(pdf),'placements':placements},indent=2))
