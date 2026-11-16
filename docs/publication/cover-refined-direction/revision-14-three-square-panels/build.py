"""Three square photo-seeded upper panels; Version 3 centre/lower band retained."""
from pathlib import Path
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from pypdf import PdfReader, PdfWriter
import json, hashlib, shutil

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[3]
OUT=ROOT/'docs/publication/cover-versions/version-4'; OUT.mkdir(exist_ok=True)
PREV=HERE.parent/'revision-13-photo-seeded-illustrations'
prior=json.loads((PREV/'LAYOUT.json').read_text())
V1=ROOT/'docs/publication/cover-versions/version-1/Version-1.png'
W,H=1100,1430
sources={
 'flowers':'exec-25e22c70-3496-41c8-a901-b27b8604dcee.png',
 'garlic':'exec-ef6dd130-aa8d-40ae-90b8-186988060eb1.png',
 'cabbage':'exec-3f8e206b-e3e4-4d39-b82f-6919fe184f0e.png'}
for name,src in sources.items():shutil.copyfile(ROOT/'generated_images'/src,HERE/(name+'-illustration.png'))
def polygon(c,pts):
 p=c.beginPath();p.moveTo(pts[0][0],H-pts[0][1])
 for x,y in pts[1:]:p.lineTo(x,H-y)
 p.close();return p
def art(c,path,box):
 x,y,w,h=box;c.drawImage(str(path),x,H-y-h,w,h,mask='auto')
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()

pdf=OUT/'Version-4.pdf'
c=canvas.Canvas(str(pdf),pagesize=(185*mm,240*mm),pageCompression=1)
c.setTitle('The Vegetable Guru — Version 4: three square panels');c.setAuthor('Prepared for John Lennon')
c.saveState();c.scale(185*mm/W,240*mm/H)
c.setFillColorRGB(249/255,240/255,222/255);c.rect(0,0,W,H,stroke=0,fill=1)
# Physical squares within the original 330-high top band; cream gutters between.
pw=330*(240/H)/(185/W); gap=(W-3*pw)/2
panel_boxes=[[i*(pw+gap),0,pw,330] for i in range(3)]
c.setFillColorRGB(231/255,237/255,219/255)
for x,y,w,h in panel_boxes:c.rect(x,H-y-h,w,h,stroke=0,fill=1)
c.rect(0,0,W,442,stroke=0,fill=1)
for x,y,w,h,rgb in [(878,330,137,80,(248,239,220)),(0,858,255,130,(249,241,223))]:
 c.setFillColorRGB(*(v/255 for v in rgb));c.rect(x,H-y-h,w,h,stroke=0,fill=1)
c.saveState();c.clipPath(polygon(c,prior['centre_clip_points']),stroke=0,fill=0);c.drawImage(str(V1),0,0,W,H);c.restoreState()
placements={'flowers':[-5,-5,340,340],'garlic':[panel_boxes[1][0]+4,4,322,322],'cabbage':[panel_boxes[2][0]-9,-2,350,350]}
for name,box in placements.items():art(c,HERE/(name+'-illustration.png'),box)
art(c,PREV/'tomato-illustration.png',prior['artwork_placements']['bottom'])
sticker=prior['sticker_clip_points'];c.saveState()
for amount,alpha in [(12,.025),(9,.035),(6,.045),(3,.055)]:
 c.setFillAlpha(alpha);c.setFillColorRGB(.09,.16,.08)
 pts=[(907+(x-907)*(1+amount/160),1133+(y-1129)*(1+amount/160)) for x,y in sticker]
 c.drawPath(polygon(c,pts),stroke=0,fill=1)
c.restoreState();c.saveState();c.clipPath(polygon(c,sticker),stroke=0,fill=0);c.drawImage(str(V1),0,0,W,H);c.restoreState()
c.restoreState();c.showPage();c.save()

# A second review page shows the actual photographic seeds and direct style inputs.
sheet=HERE/'Source-photographs.pdf'
c=canvas.Canvas(str(sheet),pagesize=(297*mm,210*mm),pageCompression=1)
c.setFillColorRGB(.98,.965,.93);c.rect(0,0,297*mm,210*mm,fill=1,stroke=0)
c.setFillColorRGB(.06,.23,.14);c.setFont('Helvetica-Bold',20)
c.drawString(15*mm,195*mm,'Version 4 — the real photographic seeds')
c.setFont('Helvetica',10);c.drawString(15*mm,187*mm,'Courgette and garlic requested by John; cabbage proposed as the third subject.')
seed_specs=[('Courgette and flowers','flowers-square.jpg','P04 / DSC08469.jpeg'),('The garlic pair','garlic-seed.jpg','L037 / DSC09815.jpeg'),('Cabbage — proposed third seed','cabbage-seed.jpg','S011 / July 2026 Heatwave, 00:27.177')]
for i,(label,name,caption) in enumerate(seed_specs):
 x=(15+i*91)*mm;path=HERE/name
 c.setFont('Helvetica-Bold',11);c.drawString(x,175*mm,label)
 with Image.open(path) as im:iw,ih=im.size
 w=85*mm;h=w*ih/iw
 c.drawImage(str(path),x,170*mm-h,w,h)
 c.setFont('Helvetica',8);c.drawString(x,79*mm,caption)
c.setFont('Helvetica-Bold',10);c.drawString(15*mm,65*mm,'Direct book-style references')
for i,name in enumerate(['marrow_courgette.png','garlic.png','cabbage.png']):
 c.drawImage(str(ROOT/'public/images/heroes/richer-a'/name),(15+i*91)*mm,15*mm,30*mm,45*mm,mask='auto')
c.setFont('Helvetica',9);c.drawString(15*mm,8*mm,'Source photographs are unchanged crops. New drawings simplify the subjects; all three panels remain proposals.')
c.showPage();c.save()
review=OUT/'Version-4-review.pdf';writer=PdfWriter()
writer.append(str(pdf));writer.append(str(sheet))
writer.add_metadata({'/Title':'The Vegetable Guru — Version 4 cover and source photographs','/Author':'Prepared for John Lennon'})
with review.open('wb') as f:writer.write(f)
record={
 'date':'2026-11-15','status':'Version 4 proposal for review; cabbage not yet selected by John',
 'request':'Save Version 3; replace dominant upper flowers with three square photo-seeded house-style illustrations, including smaller courgette flowers and the earlier garlic pair.',
 'base':'docs/publication/cover-versions/version-3/Version-3.pdf',
 'dimensions_mm':[185,240],'panel_boxes_cover_coordinates':panel_boxes,'panel_size_mm':330*240/H,
 'placements':placements,'tomato_placement':prior['artwork_placements']['bottom'],
 'preserved':'Exact Version 3 tomato image and placement, centre lettering, sprout, author and foreground tilted sticker; all previous versions, back and main book.',
 'sources':{
  'flowers':{'photo':'docs/publication/summer-cover-photo-search/selected-stills/P04-courgette-flower.jpeg','crop':[1500,0,5148,3648],'note':'Square crop reveals developing courgette below the flower, absent from the earlier narrow strip.'},
  'garlic':{'id':'L037','original':'/Volumes/Videos/Movies/DJI Videos/Photographs/Allotment/DSC09815.jpeg','copy':'garlic-source.jpeg','crop':[900,0,5200,3080],'note':'Exact earlier two elephant-garlic bulbs on wood, one partly opened.'},
  'cabbage':{'id':'S011','original':'/Volumes/Videos/Movies/July 2026/Heatwave/DJI_20260712125617_0068_D.MP4','raw_camera_seconds':27.177,'copy':'cabbage-source.png','native_dimensions':[3840,2160],'crop':[140,170,2720,2160],'status':'Assistant-proposed third source, subject to John’s review','note':'Broader crop coverage and a clear folded-leaf silhouette; bottles, netting and soil intentionally omitted from drawing.'}},
 'scouting':'Reused retained photo contacts 01–04 and summer video contacts 01–03. Inspected native garlic/pepper/broad-bean photos and a fresh native cabbage frame. Not a new exhaustive archive scan. Pepper/broad-bean alternatives retained as leads; previously rejected P02/P03/P05/P06 not reused.',
 'generation':'GENERATION.json','files':{},'review':'Rendered review pending'
}
paths=[pdf,review,sheet,HERE/'garlic-source.jpeg',HERE/'cabbage-source.png']+[HERE/(k+'-illustration.png') for k in sources]+[HERE/x[1] for x in seed_specs]
for p in paths:record['files'][str(p.relative_to(ROOT))]={'sha256':sha(p),'bytes':p.stat().st_size}
(HERE/'LAYOUT.json').write_text(json.dumps(record,indent=2)+'\n')
(OUT/'VERSION.json').write_text(json.dumps({'version':4,'date':'2026-11-15','status':record['status'],'pdf':str(pdf.relative_to(ROOT)),'review_pdf':str(review.relative_to(ROOT)),'sha256':sha(pdf),'review_sha256':sha(review),'layout':str((HERE/'LAYOUT.json').relative_to(ROOT)),'previous_versions_preserved':[1,2,3]},indent=2)+'\n')
assert len(PdfReader(pdf).pages)==1 and len(PdfReader(review).pages)==2
print(json.dumps({'pdf':str(pdf),'review':str(review),'review_bytes':review.stat().st_size,'square_mm':record['panel_size_mm']},indent=2))
