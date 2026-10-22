"""Read-only verification of the current complete PDF and recorded destinations."""
from pathlib import Path
import hashlib,json
from collections import Counter
from pypdf import PdfReader
R=Path(__file__).resolve().parents[1];D=R/'docs/publication/whole-book-order-preview'
j=lambda p:json.loads(p.read_text())
c=j(D/'CHECKS.json');proof=j(D/'integration-2026-10-18/INTEGRATION-CHECKS.json')
assert hashlib.sha256((R/c['pdf']).read_bytes()).hexdigest()==c['sha256']==proof['pdfSha256']
r=PdfReader(R/c['pdf']);assert len(r.pages)==c['pdfPages']==172
ids={p.indirect_reference.idnum:i for i,p in enumerate(r.pages)};actual=[]
for i,p in enumerate(r.pages):
 for ref in p.get('/Annots',[]):
  a=ref.get_object();assert '/A' not in a;actual.append((i-1,ids[a['/Dest'][0].idnum]-1))
assert Counter(actual)==Counter((l['folio'],l['target']) for l in proof['allLinks'])
assert c['blankFolios']==[3,6,8,98,168]
print(json.dumps({'status':'passed','pdfPages':len(r.pages),'internalLinks':len(actual),'checks':'integration-2026-10-18/INTEGRATION-CHECKS.json'}))
