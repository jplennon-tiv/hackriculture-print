from pathlib import Path
import json,hashlib
from pypdf import PdfReader,PdfWriter
root=Path(__file__).resolve().parents[2]
doc=root/'docs/vegetable-ai-pilot'
records=[json.loads((doc/f'overnight-{i:02}-restore.json').read_text()) for i in range(1,11)]
index=[]
for units in ['metric','imperial']:
    writer=PdfWriter()
    for r in records:
        checks=json.loads((doc/f"{r['label']}-checks.json").read_text())
        for key in r['selected']:
            pdf=root/f"tmp/pdfs/{r['label']}/{key}-{units}.pdf"
            c=next(c for c in checks if c['key']==key and c['units']==units)
            assert hashlib.sha256(pdf.read_bytes()).hexdigest()==c['pdf_sha256']
            reader=PdfReader(pdf)
            assert len(reader.pages)==c['pages']==2
            v=json.loads((root.parent/f'hackriculture-data/vegetables/{key}/{key}.json').read_text())
            assert c['layout_checksum']==v['ai_print_layout']['output_checksum']
            first=len(writer.pages)+1
            writer.append(reader,outline_item=v['name'])
            if units=='metric': index.append({'crop':key,'name':v['name'],'pages':[first,first+1],'batch':r['label'],'pests':len(r['selected'][key])})
    assert len(writer.pages)==58
    target=root/f'output/pdf/vegetables-overnight-{units}-review.pdf'
    writer.add_metadata({'/Title':f'Vegetable review drafts — {units} — 22 September 2026','/Subject':'29 review drafts; see OVERNIGHT-COMPLETION.md for exceptions. Not approved for publication.'})
    writer.write(target)
    assert len(PdfReader(target).pages)==58
    print(target,58,hashlib.sha256(target.read_bytes()).hexdigest())
(doc/'OVERNIGHT-INDEX.json').write_text(json.dumps(index,indent=2)+'\n')
