"""Native PDF layout using retained photographs and clipped Version 1 artwork."""
from pathlib import Path
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader
import hashlib, json, math
from collections import deque
from io import BytesIO

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
V1=ROOT/'docs/publication/cover-versions/version-1/Version-1.png'
PHOTOS=ROOT/'docs/publication/summer-cover-photo-search/selected-stills'
FLOWER=PHOTOS/'P04-courgette-flower.jpeg'
TOMATO=PHOTOS/'P01-tomato-trusses.png'
POTATO=PHOTOS/'P03-potatoes-in-hands.png'
W,H=1100,1430
TOP,BOTTOM=330,988
v1=Image.open(V1).convert('RGB')

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def polygon(c,points):
 p=c.beginPath();p.moveTo(points[0][0],H-points[0][1])
 for x,y in points[1:]:p.lineTo(x,H-y)
 p.close();return p

# Trace the existing sticker's white perimeter for a reusable PDF clipping path.
# This measures the supplied asset; it does not redraw its logo, words or tilt.
white=set()
for y in range(965,1300):
 for x in range(740,1072):
  rgb=v1.getpixel((x,y))
  if min(rgb)>211 and max(rgb)-min(rgb)<17:white.add((x,y))
component={(907,1249)};queue=deque(component)
while queue:
 x,y=queue.popleft()
 for point in [(x-1,y),(x+1,y),(x,y-1),(x,y+1)]:
  if point in white and point not in component:component.add(point);queue.append(point)
sticker=[]
for angle in range(360):
 a=math.radians(angle);edge=None
 for k in range(1150,849,-2):
  x=907+153*k/1000*math.cos(a);y=1129+156*k/1000*math.sin(a)
  if (round(x),round(y)) in component:
   edge=(x,y);break
 if edge is None:raise ValueError(f'No sticker edge at {angle}')
 sticker.append(edge)

# The original centre remains a placed image. Only the former generated leaf
# intrusions at its three corners are omitted from this photographic comparison.
centre=[(150,330),(878,330),(878,410),(1015,410),(1015,330),
        (1100,330),(1100,988),(255,988),(255,858),(0,858),(0,450),(132,450),(132,415),(150,415)]

photo_readers={}
def pdf_photo(path):
 # Normal PDF JPEG compression keeps the review file easy to open. Original
 # native PNGs remain untouched alongside the source manifest.
 if path.suffix.lower()!='.png':return str(path)
 if path not in photo_readers:
  out=BytesIO();Image.open(path).convert('RGB').save(out,format='JPEG',quality=95,subsampling=0)
  out.seek(0);photo_readers[path]=ImageReader(out)
 return photo_readers[path]

def image_in_box(c,path,source_crop,dest):
 """Place a complete original image behind a rectangular PDF clipping frame."""
 x0,y0,x1,y1=source_crop;x,y,w,h=dest
 iw,ih=Image.open(path).size
 sx,sy=w/(x1-x0),h/(y1-y0)
 c.saveState();p=c.beginPath();p.rect(x,H-y-h,w,h);c.clipPath(p,stroke=0,fill=0)
 c.drawImage(pdf_photo(path),x-x0*sx,H-(y-y0*sy)-ih*sy,iw*sx,ih*sy)
 c.restoreState()

def cover(c,kind):
 c.setFillColorRGB(.98,.954,.895);c.rect(0,0,W,H,stroke=0,fill=1)
 # Small plain-paper patches beneath the former generated corner foliage.
 # Colours are sampled from nearby clear paper in the same Version 1 image.
 for x,y,w,h,rgb in [(0,330,1100,658,(249,240,222)),(878,330,137,80,(248,239,220)),(0,858,255,130,(249,241,223))]:
  c.setFillColorRGB(*(v/255 for v in rgb));c.rect(x,H-y-h,w,h,stroke=0,fill=1)
 if kind=='A':
  image_in_box(c,FLOWER,[0,410,5472,2051.6],(0,0,1100,330))
 else:
  image_in_box(c,TOMATO,[0,450,3840,1602],(0,0,1100,330))
 # A deeper harvest band; move the crop down to exclude the shirt slogan.
 image_in_box(c,POTATO,[1500,1185,3840,2125.25],(0,988,1100,442))
 c.saveState();c.clipPath(polygon(c,centre),stroke=0,fill=0)
 c.drawImage(str(V1),0,0,W,H);c.restoreState()
 # A restrained cast shadow under the exact retained sticker artwork.
 c.saveState()
 for amount,alpha in [(12,.025),(9,.035),(6,.045),(3,.055)]:
  c.setFillAlpha(alpha);c.setFillColorRGB(.09,.16,.08)
  points=[(907+(x-907)*(1+amount/160),1133+(y-1129)*(1+amount/160)) for x,y in sticker]
  c.drawPath(polygon(c,points),stroke=0,fill=1)
 c.restoreState()
 c.saveState();c.clipPath(polygon(c,sticker),stroke=0,fill=0)
 c.drawImage(str(V1),0,0,W,H);c.restoreState()

def placed_cover(c,kind,x,y,w,h):
 c.saveState();c.translate(x,y);c.scale(w/W,h/H);cover(c,kind);c.restoreState()

# Comparison PDF plus full-size individual pages. This is a screen proof, not
# a production cover wrap; the selected back and the main book are untouched.
pdf=HERE/'Real-Photo-Cover-Trials.pdf'
c=canvas.Canvas(str(pdf),pagesize=(420*mm,297*mm),pageCompression=1)
c.setTitle('The Vegetable Guru — real-photo cover trials A and B')
c.setAuthor('Prepared for John Lennon')
c.setFillColorRGB(.96,.95,.91);c.rect(0,0,420*mm,297*mm,stroke=0,fill=1)
c.setFillColorRGB(.08,.25,.15);c.setFont('Helvetica-Bold',20)
c.drawString(14*mm,278*mm,'Real-photo front cover trials')
c.setFont('Helvetica',10)
c.drawString(14*mm,269*mm,'Version 1 centre and sticker retained  |  Original photographs  |  15 November 2026')
pw,ph=122*mm,122*240/185*mm;by=89*mm
for i,(kind,title,sub) in enumerate([
 ('V1','Version 1','Saved photographic-style reference'),
 ('A','A — flowers + potatoes','P04 courgette flowers above; P03 harvest below'),
 ('B','B — tomatoes + potatoes','P01 tomato trusses above; P03 harvest below')]):
 x=(14+i*135)*mm
 c.setFont('Helvetica-Bold',12);c.drawString(x,by+ph+9*mm,title)
 if kind=='V1':c.drawImage(str(V1),x,by,pw,ph)
 else:placed_cover(c,kind,x,by,pw,ph)
 c.setFont('Helvetica',8);c.drawString(x,by-7*mm,sub)
c.setFont('Helvetica',10)
c.drawString(14*mm,64*mm,'A brings yellow flower colour and a direct human harvest detail. B uses the same lower photograph with red tomatoes above.')
c.drawString(14*mm,56*mm,'Both use original photo pixels, with cropping and placement only. The title, subtitle, author, sprout and tilted sticker are retained.')
c.drawString(14*mm,48*mm,'The old generated foliage overlaps are omitted here to keep these trials photographic. Back cover unchanged.')
c.setFont('Helvetica',8);c.drawString(14*mm,14*mm,'Layout proposals for review; individual fronts follow. No production approval or supplier update.')
c.showPage()
for kind in ['A','B']:
 c.setPageSize((185*mm,240*mm));placed_cover(c,kind,0,0,185*mm,240*mm);c.showPage()
c.save()

for kind in ['A','B']:
 p=HERE/f'Front-{kind}.pdf';single=canvas.Canvas(str(p),pagesize=(185*mm,240*mm),pageCompression=1)
 single.setTitle('The Vegetable Guru — front '+kind);placed_cover(single,kind,0,0,185*mm,240*mm);single.showPage();single.save()

record={'date':'2026-11-15','status':'Two real-photo front layout proposals; awaiting John’s review',
 'selected_sources':['P01','P03','P04'],'not_taken_forward':['P02','P05','P06'],
 'A':{'top':'P04','bottom':'P03'},'B':{'top':'P01','bottom':'P03'},
 'method':'Native PDF image placement and vector clipping; ordinary high-quality JPEG compression for the two video stills in the review PDF. Native originals remain intact. No generated replacements, retouching, colour enhancement or synthetic photo detail.',
 'preserved':'Version 1 title, subtitle, author, sprout and exact sticker artwork at the same placement and angle; original files unchanged.',
 'intentional_changes':['Replace both generated image strips with original photographs','Omit the old generated foliage intrusions and fill their small paper-corner areas','Recreate a light native cast shadow beneath the retained sticker'],
 'paper_corner_source':'Nearby clear paper areas of Version 1; no text redrawn',
 'dimensions_mm':[185,240],'full_book_changed':False,'back_changed':False,
 'files':{str(p.relative_to(ROOT)):{'sha256':sha(p),'bytes':p.stat().st_size} for p in [V1,FLOWER,TOMATO,POTATO,pdf]},
 'crop_rectangles_source_pixels':{'P04':[0,410,5472,2051.6],'P01':[0,450,3840,1602],'P03':[1500,1185,3840,2125.25]},
 'centre_clip_points':centre,'sticker_clip_points':sticker,
 'review':'Pending visual inspection of rendered PDF pages'}
(HERE/'LAYOUT.json').write_text(json.dumps(record,indent=2)+'\n')
reader=PdfReader(pdf)
assert len(reader.pages)==3
assert abs(float(reader.pages[1].mediabox.width)/mm-185)<.01
print(json.dumps({'pdf':str(pdf),'bytes':pdf.stat().st_size,'pages':len(reader.pages)},indent=2))
