"""Local foreground-leaf revision to the source-02 trial; preserve previous files."""
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
generated=ROOT/json.loads((HERE/'GENERATION.json').read_text())['output']
asset=HERE/'courgette-02-leaf-illustration.png'
if not asset.exists():shutil.copyfile(generated,asset)
source=ROOT/'docs/publication/cover-courgette-source-search/sources/02-overlapping-fruits-Thomas-Parker.jpg'
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
top=[0,16,1100,1100*ih/iw]
pdf=HERE/'Front-cover.pdf'
c=canvas.Canvas(str(pdf),pagesize=(185*mm,240*mm),pageCompression=1)
c.setTitle('The Vegetable Guru - courgette 02 cover trial - leaf revision');c.setAuthor('Prepared for John Lennon')
c.saveState();c.scale(185*mm/W,240*mm/H)
c.setFillColorRGB(249/255,240/255,222/255);c.rect(0,0,W,H,stroke=0,fill=1)
for x,y,w,h,rgb in [(878,330,137,80,(248,239,220)),(0,858,255,130,(249,241,223))]:
 c.setFillColorRGB(*(v/255 for v in rgb));c.rect(x,H-y-h,w,h,stroke=0,fill=1)
# Mask the old photographic boundary before drawing the transparent tomatoes.
centre_clip=prior['centre_clip_points']
c.saveState();c.clipPath(polygon(c,centre_clip),stroke=0,fill=0);c.drawImage(str(V1),0,0,W,H);c.restoreState()
c.setFillColorRGB(249/255,240/255,222/255);c.rect(255,H-989,845,4,stroke=0,fill=1)
# Preserve both organic edge overflows while keeping title/sprout clear of faint alpha fringes.
top_clip=[(0,0),(1100,0),(1100,380),(700,380),(700,332),(270,332),(270,380),(0,380)]
c.saveState();c.clipPath(polygon(c,top_clip),stroke=0,fill=0);art(c,asset,top);c.restoreState()
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
c.drawString(12*mm,224*mm,'Courgette 02 - leaf revision')
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
text('A small foreground leaf conceals the exposed base of the plant stem. The two-fruit arrangement, existing leaves and visible fruit-stalk attachments are retained; the large blossom remains omitted.',12*mm,57*mm,161*mm)
text('Composition source: <b>Thomas Parker / Pexels</b>, under the <b>Pexels License</b>. Changes: illustrated redraw, omitted blossom/background, shallow framing and a foreground leaf over the exposed stem base. This revision awaits review.',12*mm,33*mm,161*mm)
c.setFont('Helvetica-Bold',8);c.drawString(12*mm,11*mm,'Original photograph');c.linkURL('https://www.pexels.com/photo/fresh-zucchini-growing-in-a-lush-garden-patch-37521727/',(12*mm,9*mm,47*mm,15*mm))
c.drawString(53*mm,11*mm,'Pexels License');c.linkURL('https://www.pexels.com/license/',(53*mm,9*mm,76*mm,15*mm))
c.showPage();c.save()
review=HERE/'Courgette-02-cover-trial.pdf';writer=PdfWriter();writer.append(str(pdf));writer.append(str(support))
writer.add_metadata({'/Title':'The Vegetable Guru - courgette 02 cover trial - leaf revision','/Author':'Prepared for John Lennon','/SourceAttribution':'Courgette composition adapted from Fresh Zucchini Growing in a Lush Garden Patch by Thomas Parker / Pexels, Pexels License. https://www.pexels.com/photo/fresh-zucchini-growing-in-a-lush-garden-patch-37521727/ | https://www.pexels.com/license/'})
with review.open('wb') as f:writer.write(f)
record={'date':'2026-11-16','status':'Source 02 leaf and border revision ready for John’s review','request':'Hide the exposed plant-stem base with a leaf; remove the partial thin dark line at the top of the lower image.','generation':'GENERATION.json','source':'docs/publication/cover-courgette-source-search/sources/02-overlapping-fruits-Thomas-Parker.jpg','dimensions_mm':[185,240],'top_placement':top,'top_clip_points':top_clip,'centre_clip_points':centre_clip,'lower_seam_fix':{'cleanup_rectangle':[255,985,845,4],'units':'1100 × 1430 cover coordinates','method':'A cream PDF rectangle covers the old photographic boundary fringe before the unchanged transparent tomato asset is placed.'},'cream_rgb':[249,240,222],'preserved':'Centre lettering/sprout, subtitle, author, lower tomato artwork/placement, tilted foreground sticker; all prior versions, back and main book.','intentional_replacements':'A small foreground leaf hides the exposed crown base. The retained centre’s lower fringe is covered with matching cream to remove the partial rule. Two-fruit arrangement and house style retained. Earlier source-01 and source-02 trials preserved.','files':{str(p.relative_to(ROOT)):{'sha256':sha(p),'bytes':p.stat().st_size} for p in [asset,pdf,review,source,*heroes]}}
(HERE/'LAYOUT.json').write_text(json.dumps(record,indent=2)+'\n')
assert len(PdfReader(pdf).pages)==1 and len(PdfReader(review).pages)==2
print(json.dumps({'review':str(review),'bytes':review.stat().st_size,'top':top},indent=2))
