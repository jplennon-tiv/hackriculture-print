from pathlib import Path
from pypdf import PdfReader, PdfWriter
import subprocess
import sys

root = Path(__file__).resolve().parents[2]
batch = '--batch-01' in sys.argv
batch02 = '--batch-02' in sys.argv
label = 'batch-02' if batch02 else 'batch-01' if batch else 'ai-pilot'
scratch = root / f'tmp/pdfs/vegetable-{label}'
output = root / f'output/pdf/vegetable-{label}-review.pdf'
output.parent.mkdir(parents=True, exist_ok=True)
writer = PdfWriter()
for crop in (('bean_broad', 'bean_french', 'bean_runner') if batch02 else ('beetroot', 'carrot', 'lettuce') if batch else ('asparagus', 'radish', 'celery')):
    for units in ('metric', 'imperial'):
        reader = PdfReader(scratch / f'{crop}-{units}.pdf')
        assert len(reader.pages) == 2, (crop, units, len(reader.pages))
        assert 'FINALTIPS' in ''.join(reader.pages[1].extract_text().split()), (crop, units)
        if units == 'metric':
            writer.append(reader, outline_item=crop.title())
writer.write(output)
assert len(PdfReader(output).pages) == 6
subprocess.run(['/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm', '-scale-to', '1450', '-png', str(output), str(scratch / 'review')], check=True)
print(output)
