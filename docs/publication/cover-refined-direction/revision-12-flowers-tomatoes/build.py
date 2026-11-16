"""Swap the lower photo in trial A, retaining its flowers, centre and sticker."""
from pathlib import Path
from io import BytesIO
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader
import json, hashlib

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
PREVIOUS=HERE.parent/'revision-11-real-photos'
layout=json.loads((PREVIOUS/'LAYOUT.json').read_text())
V1=ROOT/'docs/publication/cover-versions/version-1/Version-1.png'
FLOWER=ROOT/'docs/publication/summer-cover-photo-search/selected-stills/P04-courgette-flower.jpeg'
TOMATO=ROOT/'docs/publication/summer-cover-photo-search/selected-stills/P01-tomato-trusses.png'
W,H=1100,1430
top_crop=layout['crop_rectangles_source_pixels']['P04']
bottom_crop=[0,200,3840,200+3840*442/1100]
centre=layout['centre_clip_points'];sticker=layout['sticker_clip_points']

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def polygon(c,points):
 p=c.beginPath();p.moveTo(points[0][0],H-points[0][1])
 for x,y in points[1:]:p.lineTo(x,H-y)
 p.close();return p

photo_jpeg=BytesIO()
Image.open(TOMATO).convert('RGB').save(photo_jpeg,format='JPEG',quality=95,subsampling=0)
photo_jpeg.seek(0);tomato_reader=ImageReader(photo_jpeg)

def image_in_box(c,path,crop,dest):
 x0,y0,x1,y1=crop;x,y,w,h=dest
 with Image.open(path) as im:iw,ih=im.size
 sx,sy=w/(x1-x0),h/(y1-y0)
 c.saveState();p=c.beginPath();p.rect(x,H-y-h,w,h);c.clipPath(p,stroke=0,fill=0)
 c.drawImage(tomato_reader if path==TOMATO else str(path),x-x0*sx,H-(y-y0*sy)-ih*sy,iw*sx,ih*sy)
 c.restoreState()

pdf=HERE/'Flowers-and-Tomatoes-Cover.pdf'
c=canvas.Canvas(str(pdf),pagesize=(185*mm,240*mm),pageCompression=1)
c.setTitle('The Vegetable Guru — courgette flowers and tomatoes')
c.setAuthor('Prepared for John Lennon')
c.saveState();c.scale(185*mm/W,240*mm/H)
c.setFillColorRGB(.98,.954,.895);c.rect(0,0,W,H,stroke=0,fill=1)
for x,y,w,h,rgb in [(0,330,1100,658,(249,240,222)),(878,330,137,80,(248,239,220)),(0,858,255,130,(249,241,223))]:
 c.setFillColorRGB(*(v/255 for v in rgb));c.rect(x,H-y-h,w,h,stroke=0,fill=1)
image_in_box(c,FLOWER,top_crop,(0,0,1100,330))
image_in_box(c,TOMATO,bottom_crop,(0,988,1100,442))
c.saveState();c.clipPath(polygon(c,centre),stroke=0,fill=0);c.drawImage(str(V1),0,0,W,H);c.restoreState()
c.saveState()
for amount,alpha in [(12,.025),(9,.035),(6,.045),(3,.055)]:
 c.setFillAlpha(alpha);c.setFillColorRGB(.09,.16,.08)
 points=[(907+(x-907)*(1+amount/160),1133+(y-1129)*(1+amount/160)) for x,y in sticker]
 c.drawPath(polygon(c,points),stroke=0,fill=1)
c.restoreState()
c.saveState();c.clipPath(polygon(c,sticker),stroke=0,fill=0);c.drawImage(str(V1),0,0,W,H);c.restoreState()
c.restoreState();c.showPage();c.save()

record={'date':'2026-11-15','status':'Requested flowers-above/tomatoes-below front proposal; awaiting review',
 'feedback':'John says the courgette flowers above work really well, but the potato/hands photograph does not work well in context; he requests tomatoes below instead.',
 'based_on':str((PREVIOUS/'Front-A.pdf').relative_to(ROOT)),
 'change':'Replace only the lower potato photograph with P01 tomato trusses, cropped for the deeper lower band.',
 'preserved':'Exact P04 top crop and placement from A; Version 1 centre/title/subtitle/author/sprout; exact sticker artwork, angle, size, position and shadow; original source files.',
 'photo_method':'Original photographs placed and clipped in a native PDF, with standard high-quality JPEG compression for the video frame; no generative redraw, enhancement or retouching.',
 'active_photos':['P04','P01'],'potato_photo_status':'Not taken forward after seeing the cover context',
 'crop_rectangles_source_pixels':{'P04':top_crop,'P01':bottom_crop},
 'centre_clip_points':centre,'sticker_clip_points':sticker,
 'dimensions_mm':[185,240],'back_changed':False,'book_changed':False,
 'files':{str(p.relative_to(ROOT)):{'sha256':sha(p),'bytes':p.stat().st_size} for p in [V1,FLOWER,TOMATO,pdf]},
 'review':'Pending focused rendered-PDF review'}
(HERE/'LAYOUT.json').write_text(json.dumps(record,indent=2)+'\n')
reader=PdfReader(pdf);assert len(reader.pages)==1
assert abs(float(reader.pages[0].mediabox.width)/mm-185)<.01
assert abs(float(reader.pages[0].mediabox.height)/mm-240)<.01
for path,crop in [(FLOWER,top_crop),(TOMATO,bottom_crop)]:
 with Image.open(path) as im:assert 0<=crop[0]<crop[2]<=im.width and 0<=crop[1]<crop[3]<=im.height
print(json.dumps({'pdf':str(pdf),'bytes':pdf.stat().st_size,'pages':1,'size_mm':[185,240]},indent=2))
