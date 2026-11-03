"""Read native crop-table labels; leave approved advice and page geometry untouched."""
from pathlib import Path
import json,hashlib,logging
import pdfplumber
ROOT=Path(__file__).resolve().parents[3];D=Path(__file__).parent
logging.getLogger('pdfminer').setLevel(logging.ERROR)
assert not (D/'PDF-CHECKS.json').exists(),'Use a new revision after completed integration'
rows=json.loads((ROOT/'docs/publication/whole-book-order-preview/PAGE-MAP.json').read_text())
sources={};out=[]
for r in rows:
 if r.get('kind')!='vegetable' or not r['folio']%2:continue
 p=ROOT/r['source'];sources.setdefault(r['source'],hashlib.sha256(p.read_bytes()).hexdigest())
 with pdfplumber.open(p) as pdf:
  page=pdf.pages[r['sourcePage']-1];heads=page.search(r'Pests\s*&\s*diseases');assert len(heads)==1,r
  tips=page.search('Final tips');assert len(tips)==1,r
  chars=[c for c in page.chars if heads[0]['bottom']<c['top']<tips[0]['top'] and 'Black' in c['fontname'] and c['x0']<page.width/2]
  lines=[]
  for c in sorted(chars,key=lambda c:(round(c['top'],2),c['x0'])):
   if not lines or abs(c['top']-lines[-1][0]['top'])>.5:lines.append([])
   lines[-1].append(c)
  groups=[]
  for line in lines:
   # Wrapped label lines retain the row's normal leading; separate rows also have cell padding.
   if not groups or line[0]['top']-groups[-1][-1][0]['top']>line[0]['size']*1.4:groups.append([])
   groups[-1].append(line)
  labels=[]
  for group in groups:
   label={'old':' '.join(''.join(c['text'] for c in line).strip() for line in group),'lines':[]}
   for line in group:
    label['lines'].append({'old':''.join(c['text'] for c in line),'x':line[0]['matrix'][4],'y':line[0]['matrix'][5],'size':line[0]['size'],'rect':[min(c['x0'] for c in line),min(c['top'] for c in line),max(c['x1'] for c in line),max(c['bottom'] for c in line)],'font':line[0]['fontname'],'colour':line[0]['non_stroking_color']})
   labels.append(label)
  assert labels,r
  out.append({k:r[k] for k in ['key','folio','source','sourcePage']}|{'labels':labels})
  print(r['key'],[l['old'] for l in labels],flush=True)
assert len(out)==44
(D/'PDF-PLAN.json').write_text(json.dumps({'inputs':sources,'pages':out},indent=2)+'\n')
