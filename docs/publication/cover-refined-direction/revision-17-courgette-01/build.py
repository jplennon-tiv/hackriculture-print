"""Single courgette source-01 trial; preserve all previous cover versions."""
from pathlib import Path
import hashlib,json,shutil
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from pypdf import PdfReader,PdfWriter

HERE=Path(__file__).resolve().parent; ROOT=HERE.parents[3]
V3=HERE.parent/'revision-13-photo-seeded-illustrations'
V1=ROOT/'docs/publication/cover-versions/version-1/Version-1.png'
prior=json.loads((V3/'LAYOUT.json').read_text())
generated=ROOT/'generated_images/exec-da067a7e-c0d8-4ed0-a75a-8d56874e8df1.png'
asset=HERE/'courgette-01-illustration.png'
if not asset.exists():shutil.copyfile(generated,asset)
source=ROOT/'docs/publication/cover-courgette-source-search/sources/01-horizontal-fruit-Pollinator.jpg'
heroes=[ROOT/'public/images/heroes/richer-a'/n for n in ['marrow_courgette.png','capsicum.png']]
W,H=1100,1430
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def polygon(c,pts):
 p=c.beginPath();p.moveTo(pts[0][0],H-pts[0][1])
 for x,y in pts[1:]:p.lineTo(x,H-y)
 p.close();return p
def art(c,path,box):
 x,y,w,h=box;c.drawImage(str(path),x,H-y-h,w,h,mask='auto')

iw,ih=Image.open(asset).size
top=[0,-4,1100,1100*ih/iw]
pdf=HERE/'Front-cover.pdf'
c=canvas.Canvas(str(pdf),pagesize=(185*mm,240*mm),pageCompression=1)
c.setTitle('The Vegetable Guru - courgette 01 cover trial');c.setAuthor('Prepared for John Lennon')
c.saveState();c.scale(185*mm/W,240*mm/H)
c.setFillColorRGB(249/255,240/255,222/255);c.rect(0,0,W,H,stroke=0,fill=1)
for x,y,w,h,rgb in [(878,330,137,80,(248,239,220)),(0,858,255,130,(249,241,223))]:
 c.setFillColorRGB(*(v/255 for v in rgb));c.rect(x,H-y-h,w,h,stroke=0,fill=1)
c.saveState();c.clipPath(polygon(c,prior['centre_clip_points']),stroke=0,fill=0);c.drawImage(str(V1),0,0,W,H);c.restoreState()
art(c,asset,top)
art(c,V3/'tomato-illustration.png',prior['artwork_placements']['bottom'])
sticker=prior['sticker_clip_points'];c.saveState()
for amount,alpha in [(12,.025),(9,.035),(6,.045),(3,.055)]:
 c.setFillAlpha(alpha);c.setFillColorRGB(.09,.16,.08)
 pts=[(907+(x-907)*(1+amount/160),1133+(y-1129)*(1+amount/160)) for x,y in sticker]
 c.drawPath(polygon(c,pts),stroke=0,fill=1)
c.restoreState();c.saveState();c.clipPath(polygon(c,sticker),stroke=0,fill=0);c.drawImage(str(V1),0,0,W,H);c.restoreState()
c.restoreState();c.showPage();c.save()

# The review's second page keeps the real-photo and approved-style inputs visible.
support=HERE/'Source-and-style.pdf'
c=canvas.Canvas(str(support),pagesize=(185*mm,240*mm),pageCompression=1)
c.setFillColorRGB(249/255,240/255,222/255);c.rect(0,0,185*mm,240*mm,stroke=0,fill=1)
c.setFillColor(HexColor('#173e2c'));c.setFont('Helvetica-Bold',17)
c.drawString(12*mm,224*mm,'Courgette 01 - source and style')
body=ParagraphStyle('body',fontName='Helvetica',fontSize=9,leading=12,textColor=HexColor('#173e2c'))
def text(s,x,y,w):
 p=Paragraph(s,body);_,h=p.wrap(w,150);p.drawOn(c,x,y-h)
def fit(path,x,y,w,h):
 iw,ih=Image.open(path).size;s=min(w/iw,h/ih)
 c.drawImage(str(path),x+(w-iw*s)/2,y+(h-ih*s)/2,iw*s,ih*s,mask='auto')
c.setFont('Helvetica-Bold',9);c.drawString(12*mm,210*mm,'Selected photograph: arrangement')
c.drawString(103*mm,210*mm,'Approved heroes: drawing style')
fit(source,12*mm,135*mm,84*mm,70*mm)
fit(heroes[0],103*mm,135*mm,32*mm,70*mm)
fit(heroes[1],140*mm,135*mm,32*mm,70*mm)
c.setFont('Helvetica-Bold',10);c.drawString(12*mm,124*mm,'New upper strip')
fit(asset,12*mm,63*mm,161*mm,55*mm)
text('One horizontal courgette, a small folded flower and irregular framing leaves. Soil, damaged leaf detail and most crossing stalks are omitted. The left leaf trails slightly into the title field; the central area stays open.',12*mm,57*mm,161*mm)
text('Composition adapted from <b>Zuchinni 1107.jpg</b>, Pollinator, <b>CC BY 2.5</b>. Changes: simplified illustrated redraw, transparent background and cover framing. This trial awaits review.',12*mm,33*mm,161*mm)
c.setFont('Helvetica-Bold',8);c.drawString(12*mm,11*mm,'Original photograph');c.linkURL('https://commons.wikimedia.org/wiki/File:Zuchinni_1107.jpg',(12*mm,9*mm,47*mm,15*mm))
c.drawString(53*mm,11*mm,'CC BY 2.5');c.linkURL('https://creativecommons.org/licenses/by/2.5/',(53*mm,9*mm,76*mm,15*mm))
c.showPage();c.save()
review=HERE/'Courgette-01-cover-trial.pdf';writer=PdfWriter();writer.append(str(pdf));writer.append(str(support))
writer.add_metadata({'/Title':'The Vegetable Guru - courgette 01 cover trial','/Author':'Prepared for John Lennon','/SourceAttribution':'Courgette composition adapted from Zuchinni 1107.jpg by Pollinator, CC BY 2.5. https://commons.wikimedia.org/wiki/File:Zuchinni_1107.jpg | https://creativecommons.org/licenses/by/2.5/'})
with review.open('wb') as f:writer.write(f)
record={'date':'2026-11-16','status':'Source 01 selected for this trial; resulting artwork and cover await John’s review','request':'Ok - let’s give 01 a go.','generation':'GENERATION.json','source':'docs/publication/cover-courgette-source-search/sources/01-horizontal-fruit-Pollinator.jpg','dimensions_mm':[185,240],'top_placement':top,'cream_rgb':[249,240,222],'preserved':'Centre lettering/sprout, subtitle, author, lower tomato artwork/placement, tilted foreground sticker; all prior versions, back and main book.','intentional_replacements':'Replace Version 4 courgette and garlic groups with one coherent drawing of selected photo 01. Omit source soil, damaged leaf details and excess stalks; reduce flower emphasis.','files':{str(p.relative_to(ROOT)):{'sha256':sha(p),'bytes':p.stat().st_size} for p in [asset,pdf,review,source,*heroes]}}
(HERE/'LAYOUT.json').write_text(json.dumps(record,indent=2)+'\n')
assert len(PdfReader(pdf).pages)==1 and len(PdfReader(review).pages)==2
print(json.dumps({'review':str(review),'bytes':review.stat().st_size,'top':top},indent=2))
