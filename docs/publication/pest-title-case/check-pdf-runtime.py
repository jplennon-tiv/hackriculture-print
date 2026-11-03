"""Verify labels in actual both-unit compact PDFs, accounting for table reading order."""
from pathlib import Path
import json,pdfplumber,re,logging
logging.getLogger('pdfminer').setLevel(logging.ERROR)
d=Path(__file__).parent;runtime=json.loads((d/'RUNTIME-CHECKS.json').read_text());normal=lambda s:re.sub(r'\s+','',s)
for r in runtime['results']:
 with pdfplumber.open(r['pdf']) as pdf:
  assert len(pdf.pages)==r['pages']
  text=' '.join(page.filter(lambda c:c.get('object_type')=='char' and 'Black' in c.get('fontname','')).extract_text() or '' for page in pdf.pages)
  for label in r['labels']:assert normal(label) in normal(text),(r['key'],label)
  # Raw Chromium trim has sub-mm rounding. These checks are not supplier normalisation.
  sizes=[[page.width*25.4/72,page.height*25.4/72] for page in pdf.pages]
  assert all(abs(w-185)<.25 and abs(h-240)<.25 for w,h in sizes)
 r['physicalPdfLabelsVerified']=True;r['physicalPageSizesMm']=sizes
runtime['scope']='Both-unit runtime proofs only; current main-book pages reuse the separately verified native derivatives. Raw trim rendering can produce three pages here; accepted two-page book bodies are not replaced by these tests.'
(d/'RUNTIME-CHECKS.json').write_text(json.dumps(runtime,indent=2)+'\n')
print('Four actual compact PDFs verified: all labels, page counts and raw trim.')
