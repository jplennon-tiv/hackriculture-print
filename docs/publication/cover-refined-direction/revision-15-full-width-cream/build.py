"""Version 4 revision: full-width thirds on one cream field; reuse exact artwork."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from pypdf import PdfReader, PdfWriter
import json, hashlib, shutil

HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
OUT=ROOT/'docs/publication/cover-versions/version-4'
ART=HERE.parent/'revision-14-three-square-panels'
V3=HERE.parent/'revision-13-photo-seeded-illustrations'
prior=json.loads((V3/'LAYOUT.json').read_text())
V1=ROOT/'docs/publication/cover-versions/version-1/Version-1.png'
W,H=1100,1430
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
# Retain the original Version 4 PDFs/records once, before revising this version.
archive=OUT/'references/three-square-panels';archive.mkdir(parents=True,exist_ok=True)
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
c.setTitle('The Vegetable Guru — Version 4: full-width images on cream');c.setAuthor('Prepared for John Lennon')
c.saveState();c.scale(185*mm/W,240*mm/H)
# All transparent image gaps now reveal the same warm cream as the title area.
c.setFillColorRGB(249/255,240/255,222/255);c.rect(0,0,W,H,stroke=0,fill=1)
for x,y,w,h,rgb in [(878,330,137,80,(248,239,220)),(0,858,255,130,(249,241,223))]:
 c.setFillColorRGB(*(v/255 for v in rgb));c.rect(x,H-y-h,w,h,stroke=0,fill=1)
c.saveState();c.clipPath(polygon(c,prior['centre_clip_points']),stroke=0,fill=0);c.drawImage(str(V1),0,0,W,H);c.restoreState()
# Three horizontal thirds without the former square constraints or cream gutters.
# Uniform enlargement preserves shapes; outer stems may bleed, subjects stay clear.
placements={'flowers':[-8,-12,374,374],'garlic':[374,-8,350,350],'cabbage':[728,-10,380,380]}
for name,box in placements.items():art(c,ART/(name+'-illustration.png'),box)
art(c,V3/'tomato-illustration.png',prior['artwork_placements']['bottom'])
sticker=prior['sticker_clip_points'];c.saveState()
for amount,alpha in [(12,.025),(9,.035),(6,.045),(3,.055)]:
 c.setFillAlpha(alpha);c.setFillColorRGB(.09,.16,.08)
 pts=[(907+(x-907)*(1+amount/160),1133+(y-1129)*(1+amount/160)) for x,y in sticker]
 c.drawPath(polygon(c,pts),stroke=0,fill=1)
c.restoreState();c.saveState();c.clipPath(polygon(c,sticker),stroke=0,fill=0);c.drawImage(str(V1),0,0,W,H);c.restoreState()
c.restoreState();c.showPage();c.save()
review=OUT/'Version-4-review.pdf';writer=PdfWriter();writer.append(str(pdf));writer.append(str(ART/'Source-photographs.pdf'))
writer.add_metadata({'/Title':'The Vegetable Guru — Version 4, full-width cream revision','/Author':'Prepared for John Lennon'})
with review.open('wb') as f:writer.write(f)
record={'date':'2026-11-15','status':'Revised Version 4 proposal awaiting review',
 'request':'Correct the square requirement: make the three images fit horizontally across the top space. Remove pale green backgrounds and use title-area cream, explicitly including the lower image.',
 'base':'docs/publication/cover-refined-direction/revision-14-three-square-panels/LAYOUT.json',
 'dimensions_mm':[185,240],'top_zones':[[i*W/3,0,W/3,330] for i in range(3)],
 'placements':placements,'top_gutters':0,'cream_rgb':[249,240,222],
 'lower_background':'Same cream; tomato artwork and placement unchanged',
 'preserved':'Exact three illustration files, tomato artwork, centre lettering/sprout/author, sticker size/angle/position/foreground order; earlier Version 4 preserved in references/three-square-panels; Versions 1–3, back and main book unchanged.',
 'artwork_method':'Native PDF placement and background fills only; uniform image scaling, no stretching, recolouring, regeneration or retouching.',
 'review':'Rendered inspection pending','files':{}}
for p in [pdf,review,V1,V3/'tomato-illustration.png']+[ART/(n+'-illustration.png') for n in placements]:
 record['files'][str(p.relative_to(ROOT))]={'bytes':p.stat().st_size,'sha256':sha(p)}
(HERE/'LAYOUT.json').write_text(json.dumps(record,indent=2)+'\n')
(OUT/'VERSION.json').write_text(json.dumps({'version':4,'revision':'full-width-cream','date':'2026-11-15','status':record['status'],'pdf':str(pdf.relative_to(ROOT)),'review_pdf':str(review.relative_to(ROOT)),'sha256':sha(pdf),'review_sha256':sha(review),'layout':str((HERE/'LAYOUT.json').relative_to(ROOT)),'earlier_revision':'references/three-square-panels','previous_versions_preserved':[1,2,3]},indent=2)+'\n')
assert len(PdfReader(pdf).pages)==1 and len(PdfReader(review).pages)==2
print(json.dumps({'pdf':str(pdf),'review':str(review),'bytes':review.stat().st_size,'sha256':sha(review)},indent=2))
