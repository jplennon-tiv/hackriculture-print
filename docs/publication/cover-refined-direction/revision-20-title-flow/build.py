"""Version 5 title-flow study and direct comparison with the quieter source."""
from pathlib import Path
import json,hashlib,shutil
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from pypdf import PdfReader,PdfWriter,Transformation

HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
OUT=ROOT/'docs/publication/cover-versions/version-5';OUT.mkdir(parents=True,exist_ok=True)
source=ROOT/json.loads((HERE/'GENERATION.json').read_text())['output']
image=OUT/'Version-5.png'
if not image.exists():shutil.copyfile(source,image)
old=ROOT/'docs/publication/cover-versions/version-4/references/quieter-two-group/Version-4.pdf'
front=OUT/'Version-5.pdf';review=OUT/'Version-5-review.pdf'
c=canvas.Canvas(str(front),pagesize=(185*mm,240*mm),pageCompression=1)
c.setTitle('The Vegetable Guru - Version 5 title arrangement');c.setAuthor('Prepared for John Lennon')
c.drawImage(str(image),0,0,185*mm,240*mm);c.showPage();c.save()
base=HERE/'Comparison-base.pdf'
c=canvas.Canvas(str(base),pagesize=(400*mm,270*mm),pageCompression=1)
c.setFillColorRGB(.96,.95,.91);c.rect(0,0,400*mm,270*mm,fill=1,stroke=0)
c.setFillColorRGB(.09,.24,.17);c.setFont('Helvetica-Bold',12)
c.drawString(10*mm,258*mm,'Quieter source - retained')
c.drawString(205*mm,258*mm,'Version 5 - title and images arranged together')
c.setFont('Helvetica',8)
c.drawString(10*mm,252*mm,'Earlier small flower and garlic layout')
c.drawString(205*mm,252*mm,'Higher title, flowers beside The, garlic beside Guru')
c.showPage();c.save()
comparison=PdfReader(base).pages[0]
for path,x in [(old,10),(front,205)]:
 comparison.merge_transformed_page(PdfReader(path).pages[0],Transformation().translate(x*mm,8*mm))
w=PdfWriter();w.append(str(front));w.add_page(comparison)
w.add_metadata({'/Title':'The Vegetable Guru - Version 5 with quieter source comparison','/Author':'Prepared for John Lennon'})
with review.open('wb') as f:w.write(f)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
record={'version':5,'date':'2026-11-16','status':'Experimental title arrangement awaiting John’s feedback','front':str(front.relative_to(ROOT)),'review':str(review.relative_to(ROOT)),'source_quieter_front':str(old.relative_to(ROOT)),'generation':str((HERE/'GENERATION.json').relative_to(ROOT)),'dimensions_mm':[185,240],'image_px':list(Image.open(image).size),'design':'Title moved upwards; small flowers nest beside The, garlic pair fills the space beside left-shifted Guru. Cream, green lettering, two-line subtitle, author, tomatoes and tilted sticker continue.','intentional_changes':'Whole-cover generated layout study; positions, letterforms and illustration detail may vary from exact source pixels. Exact source photographs, original drawings and all prior PDFs retained.','files':{str(p.relative_to(ROOT)):{'sha256':sha(p),'bytes':p.stat().st_size} for p in [source,image,front,review,old]}}
(HERE/'LAYOUT.json').write_text(json.dumps(record,indent=2,ensure_ascii=False)+'\n')
(OUT/'VERSION.json').write_text(json.dumps(record,indent=2,ensure_ascii=False)+'\n')
assert len(PdfReader(front).pages)==1 and len(PdfReader(review).pages)==2
print(json.dumps({'review':str(review),'bytes':review.stat().st_size,'image_px':record['image_px']}))
