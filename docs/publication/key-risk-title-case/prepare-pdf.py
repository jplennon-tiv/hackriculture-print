"""Locate only the native Key risks headings on saved vegetable opening pages."""
from pathlib import Path
import hashlib,json,logging
import pdfplumber
ROOT=Path(__file__).resolve().parents[3];D=Path(__file__).parent
logging.getLogger('pdfminer').setLevel(logging.ERROR)
assert not (D/'PDF-CHECKS.json').exists(),'Completed correction is frozen'
rows=json.loads((ROOT/'docs/publication/whole-book-order-preview/PAGE-MAP.json').read_text());out=[];inputs={}
for r in rows:
 if r.get('kind')!='vegetable' or r['folio']%2:continue
 path=ROOT/r['source'];inputs.setdefault(r['source'],hashlib.sha256(path.read_bytes()).hexdigest())
 with pdfplumber.open(path) as pdf:
  page=pdf.pages[r['sourcePage']-1];heads=page.search('Key risks');assert len(heads)==1,r
  chars=[c for c in page.chars if c['top']>heads[0]['bottom'] and 'LilitaOne' in c['fontname']]
  lines=[]
  for c in chars:
   if not lines or abs(c['top']-lines[-1][0]['top'])>.5 or c['x0']<lines[-1][-1]['x0']-1 or c['x0']-lines[-1][-1]['x1']>10:lines.append([])
   lines[-1].append(c)
  groups=[]
  for line in lines:
   if not groups or abs(line[0]['x0']-groups[-1][0][0]['x0'])>1:groups.append([])
   groups[-1].append(line)
  labels=[]
  for group in groups:
   label={'old':' '.join(''.join(c['text'] for c in line).strip() for line in group),'lines':[]}
   for line in group:
    label['lines'].append({'old':''.join(c['text'] for c in line),'x':line[0]['matrix'][4],'y':line[0]['matrix'][5],'size':line[0]['size'],'rect':[min(c['x0'] for c in line),min(c['top'] for c in line),max(c['x1'] for c in line),max(c['bottom'] for c in line)],'font':line[0]['fontname'],'colour':line[0]['non_stroking_color']})
   labels.append(label)
  assert 1<=len(labels)<=4,(r,labels)
  out.append({k:r[k] for k in ['key','folio','source','sourcePage']}|{'labels':labels})
  print(r['key'],[l['old'] for l in labels],flush=True)
assert len(out)==44
(D/'PDF-PLAN.json').write_text(json.dumps({'inputs':inputs,'pages':out},indent=2)+'\n')
