"""Version 5 proportion refinement: subtitle, author and garlic."""
from pathlib import Path
import json,shutil,hashlib
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from pypdf import PdfReader
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
OUT=ROOT/'docs/publication/cover-versions/version-5'
spec=json.loads((HERE/'GENERATION.json').read_text());source=ROOT/spec['output']
image=OUT/'Version-5.png';shutil.copyfile(source,image)
front=OUT/'Version-5.pdf';review=OUT/'Version-5-review.pdf'
c=canvas.Canvas(str(front),pagesize=(185*mm,240*mm),pageCompression=1)
c.setTitle('The Vegetable Guru - Version 5: proportion refinement');c.setAuthor('Prepared for John Lennon')
c.drawImage(str(image),0,0,185*mm,240*mm);c.showPage();c.save();shutil.copyfile(front,review)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
record={'version':5,'revision':'proportion-refinement','date':'2026-11-16','status':'Refined Version 5 awaiting feedback','front':str(front.relative_to(ROOT)),'review':str(review.relative_to(ROOT)),'generation':str((HERE/'GENERATION.json').relative_to(ROOT)),'dimensions_mm':[185,240],'image_px':list(Image.open(image).size),'request':'Reduce subtitle by approximately 10%; lift author approximately 3 mm; move garlic approximately 3 mm left and down.','design':'Quieter subtitle, author slightly raised and garlic inset slightly from the top-right edges. Existing upper-title composition retained.','intentional_changes':'Focused generated cover edit; exact source pixel identity is not claimed. Subtitle, author, lower tomatoes and sticker retained visually.','previous_revision':'references/upper-title-before-proportions','files':{str(p.relative_to(ROOT)):{'sha256':sha(p),'bytes':p.stat().st_size} for p in [source,image,front,review]}}
(HERE/'LAYOUT.json').write_text(json.dumps(record,indent=2,ensure_ascii=False)+'\n')
(OUT/'VERSION.json').write_text(json.dumps(record,indent=2,ensure_ascii=False)+'\n')
assert len(PdfReader(review).pages)==1
print(json.dumps({'review':str(review),'bytes':review.stat().st_size,'image_px':record['image_px']}))
