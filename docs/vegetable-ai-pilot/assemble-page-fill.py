from pathlib import Path
import json,hashlib
from pypdf import PdfReader,PdfWriter
root=Path(__file__).resolve().parents[2]
index=json.loads((root/'docs/vegetable-ai-pilot/OVERNIGHT-INDEX.json').read_text())
checks=json.loads((root/'docs/vegetable-ai-pilot/PAGE-FILL-CHECKS.json').read_text())
packs=[]
for units in ['metric','imperial']:
    writer=PdfWriter()
    for row in index:
        c=next(c for c in checks if c['key']==row['crop'] and c['units']==units)
        pdf=root/c['path']
        assert hashlib.sha256(pdf.read_bytes()).hexdigest()==c['pdf_sha256']
        reader=PdfReader(pdf)
        assert len(reader.pages)==2
        writer.append(reader,outline_item=row['name'])
    target=root/f'output/pdf/vegetables-page-fill-{units}-review.pdf'
    writer.add_metadata({'/Title':f'Fuller vegetable review proofs - {units} - 22 September 2026','/Subject':'Revised drafts; same 29-crop page index as overnight packs.'})
    writer.write(target)
    assert len(PdfReader(target).pages)==58
    packs.append({'file':str(target.relative_to(root)),'pages':58,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
    print(target)
(root/'docs/vegetable-ai-pilot/PAGE-FILL-PACKS.json').write_text(json.dumps(packs,indent=2)+'\n')
