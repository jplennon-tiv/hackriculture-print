from pathlib import Path
import json,sys
from pypdf import PdfReader,PdfWriter
root=Path(__file__).resolve().parents[2]
label=sys.argv[1]
record=json.loads((root/f'docs/vegetable-ai-pilot/{label}-restore.json').read_text())
keys=list(record['selected'])
checks=json.loads((root/f'docs/vegetable-ai-pilot/{label}-checks.json').read_text())
for units in ['metric','imperial']:
    writer=PdfWriter()
    for key in keys:
        reader=PdfReader(root/f'tmp/pdfs/{label}/{key}-{units}.pdf')
        check=next(c for c in checks if c['key']==key and c['units']==units)
        assert len(reader.pages)==check['pages']
        writer.append(reader,outline_item=key.replace('_',' ').title())
    target=root/f'output/pdf/vegetables-{label}-{units}-review.pdf'
    writer.write(target)
    print(target,len(PdfReader(target).pages))
