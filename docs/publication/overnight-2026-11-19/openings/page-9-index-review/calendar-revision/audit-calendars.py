import json,hashlib,re
from pathlib import Path
from html.parser import HTMLParser
class Node:
 def __init__(self,t,a):self.tag=t;self.a=dict(a);self.children=[]
 def text(self):return ''.join(x if isinstance(x,str) else x.text() for x in self.children)
 def all(self,p):return ([self] if p(self) else [])+sum([c.all(p) for c in self.children if isinstance(c,Node)],[])
 def cls(self,c):return c in self.a.get('class','').split()
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.root=Node('root',[]);self.stack=[self.root]
 def handle_starttag(self,t,a):
  n=Node(t,a);self.stack[-1].children.append(n)
  if t not in ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']:self.stack.append(n)
 def handle_endtag(self,t):
  for i in range(len(self.stack)-1,0,-1):
   if self.stack[i].tag==t:self.stack=self.stack[:i];break
 def handle_data(self,d):self.stack[-1].children.append(d)
def hashes(d):
 if not isinstance(d,dict):return {}
 out={k:v for k,v in d.items() if isinstance(v,str) and re.fullmatch('[a-f0-9]{64}',v) and ('/' in k or '.' in k)}
 for v in d.values():
  if isinstance(v,dict):out.update(hashes(v))
 return out
cand={}
for root in ['docs/publication/sowing-rollout/revisions','docs/publication/sowing-planting-mockups','docs/publication/variety-additions']:
 for ap in Path(root).rglob('APPROVAL.json'):
  a=json.loads(ap.read_text());hh=hashes(a)
  for f,h in hh.items():
   if not f.endswith('-imperial.html') or not Path(f).exists():continue
   key=Path(f).name.removesuffix('-imperial.html'); pdfs=[p for p in hh if p.endswith('/'+key+'-imperial.pdf') and Path(p).exists()]
   if not pdfs:continue
   priority=400 if '/variety-additions/' in f else 300 if any('/'+x+'/' in f for x in ['pea_intro','artichoke_jerusalem_varieties','garlic_yield','florence_fennel_yield']) else 200 if '/sowing-rollout/revisions/' in f else 100
   rank=(a.get('date',''),priority)
   if key not in cand or rank>cand[key]['rank']:cand[key]={'key':key,'approval':str(ap),'date':a.get('date'),'html':f,'htmlSHA256':h,'pdf':pdfs[0],'pdfSHA256':hh[pdfs[0]],'rank':rank}
records=[]
for key,c in sorted(cand.items()):
 for field in ['html','pdf']:
  actual=hashlib.sha256(Path(c[field]).read_bytes()).hexdigest();assert actual==c[field+'SHA256'],(key,field)
 p=Parser();p.feed(Path(c['html']).read_text());cc=p.root.all(lambda n:n.cls('calendar'))
 if len(cc)!=1:print('Calendar count',key,len(cc));continue
 cal=cc[0];rows=[]
 for n in cal.all(lambda n:n.cls('month-row')):
  bs=n.all(lambda n:n.tag=='b');label=bs[0].text().strip() if bs else ''
  if not label:continue
  cells=n.all(lambda n:n.tag=='span');rows.append({'label':label,'class':n.a.get('class'),'months':[cell.a.get('class','') for cell in cells]})
 notes=[' '.join(n.text().split()) for n in cal.all(lambda n:n.tag=='p')]
 c.pop('rank');c['rows']=rows;c['notes']=notes;c['calendarText']=' '.join(cal.text().split());records.append(c)
work=Path('docs/publication/overnight-2026-11-19/openings/page-9-index-review/calendar-revision');(work/'CALENDAR-AUDIT.json').write_text(json.dumps({'date':'2026-11-22','scope':'Read-only latest approved guide calendar review; no guide regeneration or edits','records':records},indent=2)+'\n')
from collections import Counter
print('Records',len(records));print('Row labels',dict(Counter(r['label'] for c in records for r in c['rows'])))
for c in records:print(c['key'],c['date'],Path(c['html']).parent.name,' | '.join(r['label'] for r in c['rows']),' :: ', '; '.join(c['notes']))
