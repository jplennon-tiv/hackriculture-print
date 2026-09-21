from pathlib import Path
from pypdf import PdfReader, PdfWriter
import subprocess

root = Path(__file__).resolve().parents[2]
scratch = root / 'tmp/pdfs/vegetable-batch-03'
output = root / 'output/pdf/vegetable-batch-03-review.pdf'
output.parent.mkdir(parents=True, exist_ok=True)
writer = PdfWriter()
for crop in ('broccoli', 'brussels_sprouts', 'cabbage'):
    for units in ('metric', 'imperial'):
        reader = PdfReader(scratch / f'{crop}-{units}.pdf')
        assert len(reader.pages) == 2, (crop, units, len(reader.pages))
        text = '\n'.join(p.extract_text() for p in reader.pages)
        assert 'FINALTIPS' in ''.join(reader.pages[1].extract_text().split())
        assert not any(word in text.lower() for word in ('permethrin', 'heptenophos', 'mancozeb', 'lindane'))
        (scratch / f'{crop}-{units}.txt').write_text(text)
        if units == 'metric':
            writer.append(reader, outline_item=crop.replace('_', ' ').title())
writer.write(output)
assert len(PdfReader(output).pages) == 6
subprocess.run(['/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm', '-scale-to', '1450', '-png', str(output), str(scratch / 'review')], check=True)
print(output)
