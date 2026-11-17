"""Build a lossless repair proof and source-detail comparison; never edit image pixels."""
from pathlib import Path
import hashlib,json,io
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab import rl_config
from pypdf import PdfReader,PdfWriter
from pypdf.generic import NameObject,BooleanObject

B=Path(__file__).resolve().parent
R=B.parents[4]
rl_config.useA85=0
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
images=[('Earliest photographic source',R/'generated_images/exec-8a441e77-b186-4a65-b817-39f60adfc2ff.png'),('Before repair',R/'generated_images/exec-b07b68bf-b99b-41a4-bc4f-0d19fec63c1c.png'),('Restoration proof',R/'generated_images/exec-c8bd4eb0-0092-4b0a-89dd-a6a5bb83c88e.png')]
boxes=[('Tomato skin and stems',(140,130,360,300)),('Kale veins and leaf edges',(500,1040,720,1210)),('Carrot skin and fine roots',(280,1170,500,1340))]
out=B/'V1-Photographic-Restoration-Review.pdf'
buffer=io.BytesIO(); c=canvas.Canvas(buffer,pagesize=(210*mm,297*mm),pageCompression=1)
c.setTitle('The Vegetable Guru — photographic restoration review')
c.setAuthor('John Lennon')
c.setFillColorRGB(.05,.22,.10);c.setFont('Helvetica-Bold',14)
c.drawString(12.5*mm,283*mm,'The Vegetable Guru — photographic repair')
c.setFont('Helvetica',9);c.drawString(12.5*mm,275*mm,'Separate proof for review; saved Version 1-1 remains unchanged.')
c.drawImage(str(images[2][1]),12.5*mm,25*mm,185*mm,240*mm)
c.setFont('Helvetica',8);c.drawString(12.5*mm,15*mm,'Native image: 1100 x 1430 px (about 151 dpi at 185 mm wide). This is not a high-resolution print master.')
c.showPage()
c.setFillColorRGB(.05,.22,.10);c.setFont('Helvetica-Bold',14)
c.drawString(11*mm,282*mm,'Detail comparison — source / before / repair')
c.setFont('Helvetica',8.5)
c.drawString(11*mm,273*mm,'Original image pixels are embedded losslessly. Enlarge this page to inspect the surface detail.')
c.drawString(11*mm,267*mm,'These are matching source windows; small generative changes mean individual shapes can shift.')
for col,(label,path) in enumerate(images):
 x=(11+64*col)*mm;c.setFont('Helvetica-Bold',8.5);c.drawString(x,256*mm,label)
 for row,(subject,(l,t,rr,bb)) in enumerate(boxes):
  top=(246-row*67)*mm;w=60*mm;scale=w/(rr-l);h=(bb-t)*scale
  c.setFont('Helvetica',8);c.drawString(x,top+3*mm,subject)
  y=top-h;c.saveState();p=c.beginPath();p.rect(x,y,w,h);c.clipPath(p,stroke=0,fill=0)
  c.drawImage(str(path),x-l*scale,y-(1430-bb)*scale,1100*scale,1430*scale);c.restoreState()
c.setFont('Helvetica',8)
for i,line in enumerate(['Finding: the files are intact lossless PNGs; repeated whole-cover regeneration changed the artwork.',
 'Repair: earliest photographic source used to recover coherent skin, roots, stems and leaf detail.',
 'Next work is paused. Build separate layout layers before any further typography, badge or colour edits.']):
 c.drawString(11*mm,(39-i*5)*mm,line)
c.showPage();c.save();buffer.seek(0)
reader=PdfReader(buffer);writer=PdfWriter()
expected={hashlib.sha256(Image.open(p).convert('RGB').tobytes()).hexdigest() for _,p in images}
embedded=set()
for page in reader.pages:
 for ref in page['/Resources'].get('/XObject',{}).values():
  obj=ref.get_object()
  if obj.get('/Subtype')=='/Image':
   assert obj['/Width']==1100 and obj['/Height']==1430
   raw=obj.get_data();digest=hashlib.sha256(raw).hexdigest();assert digest in expected
   embedded.add(digest);obj[NameObject('/Interpolate')]=BooleanObject(True)
 writer.add_page(page)
assert embedded==expected
writer.add_metadata({'/Title':'The Vegetable Guru — photographic restoration review','/Author':'John Lennon'})
with out.open('wb') as f:writer.write(f)
assert len(PdfReader(out,strict=True).pages)==2
checks={'date':'2026-11-16','pdf':str(out.relative_to(R)),'pages':2,'bytes':out.stat().st_size,'sha256':sha(out),'all_three_embedded_RGB_sources_exact':True,'interpolation_enabled':True,'source_dimensions_px':[1100,1430],'effective_dpi_at_185mm':round(1100/(185/25.4),1),'detail_windows':boxes,'source_hashes':{str(p.relative_to(R)):sha(p) for _,p in images},'visual_review':'Full repair image and three enlarged details inspected; PDF visual review pending.'}
(B/'CHECKS.json').write_text(json.dumps(checks,indent=2)+'\n')
print(json.dumps({'pdf':str(out),'bytes':out.stat().st_size,'lossless_source_checks':True,'pages':2}))
