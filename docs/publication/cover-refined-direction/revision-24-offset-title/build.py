"""Version 4a offset-title revision with unchanged Version 4 reference."""
from pathlib import Path
import json,hashlib,shutil
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from pypdf import PdfReader,PdfWriter,Transformation
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
OUT=ROOT/'docs/publication/cover-versions/version-4a';OUT.mkdir(parents=True,exist_ok=True)
source=ROOT/json.loads((HERE/'GENERATION.json').read_text())['output']
image=OUT/'Version-4a.png';shutil.copyfile(source,image)
old=ROOT/'docs/publication/cover-versions/version-4/Version-4.pdf'
front=OUT/'Version-4a.pdf';review=OUT/'Version-4a-review.pdf'
c=canvas.Canvas(str(front),pagesize=(185*mm,240*mm),pageCompression=1)
c.setTitle('The Vegetable Guru - Version 4a');c.setAuthor('Prepared for John Lennon')
c.drawImage(str(image),0,0,185*mm,240*mm);c.showPage();c.save()
base=HERE/'Comparison-base.pdf'
c=canvas.Canvas(str(base),pagesize=(400*mm,270*mm),pageCompression=1)
c.setFillColorRGB(.96,.95,.91);c.rect(0,0,400*mm,270*mm,fill=1,stroke=0)
c.setFillColorRGB(.09,.24,.17);c.setFont('Helvetica-Bold',12)
c.drawString(10*mm,258*mm,'Version 4 - retained reference')
c.drawString(205*mm,258*mm,'Version 4a - offset title and courgettes')
c.setFont('Helvetica',8)
c.drawString(10*mm,252*mm,'Original saved cover, unchanged')
c.drawString(205*mm,252*mm,'Smaller courgettes right; title up and left; no sprout')
c.showPage();c.save()
comparison=PdfReader(base).pages[0]
for path,x in [(old,10),(front,205)]:comparison.merge_transformed_page(PdfReader(path).pages[0],Transformation().translate(x*mm,8*mm))
w=PdfWriter();w.append(str(front));w.add_page(comparison)
w.add_metadata({'/Title':'The Vegetable Guru - Version 4a and Version 4 comparison','/Author':'Prepared for John Lennon','/SourceAttribution':'Courgette composition originally adapted from Thomas Parker / Pexels under Pexels License. https://www.pexels.com/photo/fresh-zucchini-growing-in-a-lush-garden-patch-37521727/ | https://www.pexels.com/license/'})
with review.open('wb') as f:w.write(f)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
record={'version':'4a','date':'2026-11-16','status':'Offset Version 4a proposal awaiting feedback','front':str(front.relative_to(ROOT)),'review':str(review.relative_to(ROOT)),'source_version_4':str(old.relative_to(ROOT)),'generation':str((HERE/'GENERATION.json').relative_to(ROOT)),'dimensions_mm':[185,240],'image_px':list(Image.open(image).size),'design':'Smaller courgette group at upper right; main title up and left with decorative sprout removed; lower elements visually retained.','requested_targets':{'upper_art_scale_relative_to_previous':0.83,'title_up_page_fraction':0.07,'title_left_page_fraction':0.07,'remove_title_sprout':True},'precision':'Generated composition study; dimensions and source-pixel preservation are approximate, not production geometry.','files':{str(p.relative_to(ROOT)):{'sha256':sha(p),'bytes':p.stat().st_size} for p in [source,image,front,review,old]}}
(HERE/'LAYOUT.json').write_text(json.dumps(record,indent=2,ensure_ascii=False)+'\n')
(OUT/'VERSION.json').write_text(json.dumps(record,indent=2,ensure_ascii=False)+'\n')
assert len(PdfReader(front).pages)==1 and len(PdfReader(review).pages)==2
print(json.dumps({'review':str(review),'bytes':review.stat().st_size,'image_px':record['image_px']}))
