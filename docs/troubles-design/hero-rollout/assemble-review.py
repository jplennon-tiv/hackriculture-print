from pathlib import Path
from pypdf import PdfReader, PdfWriter
root = Path(__file__).resolve().parents[3]
writer = PdfWriter()
parts = sorted((root / 'tmp/pdfs/hero-review').glob('*.pdf'))
assert len(parts) == 10
for part in parts:
    reader = PdfReader(part)
    assert len(reader.pages) == 1
    writer.add_page(reader.pages[0])
out = root / 'output/pdf/troubles-hero-review-A4.pdf'
writer.write(out)
print(out)
