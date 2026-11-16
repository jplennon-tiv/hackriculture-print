"""Requested Version 3 cream-background and natural upper-edge revision."""
from pathlib import Path
import json, hashlib, shutil
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from pypdf import PdfReader

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[3]
OUT = ROOT / 'docs/publication/cover-versions/version-3'
source = ROOT / json.loads((HERE/'GENERATION.json').read_text())['output']
image = OUT/'Version-3.png'; shutil.copyfile(source, image)
pdf = OUT/'Version-3.pdf'
c = canvas.Canvas(str(pdf), pagesize=(185*mm, 240*mm), pageCompression=1)
c.setTitle('The Vegetable Guru - Version 3: cream backgrounds')
c.setAuthor('Prepared for John Lennon')
c.drawImage(str(image), 0, 0, 185*mm, 240*mm)
c.showPage(); c.save()
assert len(PdfReader(pdf).pages) == 1
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
record = {'version': 3, 'date': '2026-11-16', 'status': 'Saved Version 3 updated at John’s request; not production approval', 'request': 'Remove the light green picture backgrounds and let the upper illustration flow into the page instead of stopping in a line.', 'pdf': str(pdf.relative_to(ROOT)), 'image': str(image.relative_to(ROOT)), 'sha256': sha(pdf), 'bytes': pdf.stat().st_size, 'dimensions_mm': [185, 240], 'image_px': list(Image.open(image).size), 'layout': str((HERE/'LAYOUT.json').relative_to(ROOT)), 'generation': str((HERE/'GENERATION.json').relative_to(ROOT)), 'previous_version': 'docs/publication/cover-versions/version-3/references/pale-green-background/Version-3.pdf', 'design': 'Continuous cream behind upper flowers and lower tomatoes; irregular complete petal/leaf contours dip into page. Title, sprout, subtitle, author, tomato composition and tilted foreground sticker retained visually.', 'precision': 'Generated visual edit, not a pixel-exact reconstruction of lettering or plant artwork.', 'back_changed': False, 'main_book_changed': False, 'other_numbered_fronts_changed': False, 'files': {str(p.relative_to(ROOT)): {'sha256': sha(p), 'bytes': p.stat().st_size} for p in [source,image,pdf]}}
for p in [OUT/'VERSION.json', HERE/'LAYOUT.json']:
    p.write_text(json.dumps(record, indent=2, ensure_ascii=False)+'\n')
print(json.dumps({'pdf': str(pdf), 'bytes': pdf.stat().st_size, 'image_px': record['image_px']}))
