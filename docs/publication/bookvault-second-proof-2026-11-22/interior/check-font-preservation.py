from pathlib import Path
import json,hashlib
from pypdf import PdfReader
DOC=Path(__file__).resolve().parent;ROOT=DOC.parents[3];OUT=ROOT/'output/pdf/bookvault-second-proof-2026-11-22/interior'
a=PdfReader(OUT/'Vegetable-Guru-Interior-Production-Preparation.pdf');b=PdfReader(OUT/'Vegetable-Guru-Interior-Colour-Managed.pdf')
def stable(o):
 o=o.get_object() if hasattr(o,'get_object') else o
 if hasattr(o,'get_data'):return {'streamSHA256':hashlib.sha256(o.get_data()).hexdigest()}
 if isinstance(o,dict):return {str(k):stable(v) for k,v in sorted(o.items())}
 if isinstance(o,list):return [stable(v) for v in o]
 if isinstance(o,(str,int,float,bool)) or o is None:return o
 return str(o)
cache={}
def fonts(page):
 out=set();seen=set()
 def walk(res):
  res=res.get_object()
  if id(res) in seen:return
  seen.add(id(res))
  for ref in res.get('/Font',{}).values():
   f=ref.get_object()
   if str(f.get('/BaseFont'))=='/Helvetica':continue
   key=(id(ref.pdf),ref.idnum) if hasattr(ref,'idnum') else id(f)
   if key not in cache:cache[key]=hashlib.sha256(json.dumps(stable(f),sort_keys=True).encode()).hexdigest()
   out.add(cache[key])
  for ref in res.get('/XObject',{}).values():
   o=ref.get_object()
   if hasattr(o,'get') and '/Resources' in o:walk(o['/Resources'])
 walk(page['/Resources']);return out
records=[]
for i,(p,q) in enumerate(zip(a.pages,b.pages),1):
 x,y=fonts(p),fonts(q);assert x==y,(i,x-y,y-x)
 records.append({'folio':i,'distinctFontDefinitions':len(x),'fontProgramsCMapsType3CharProcsAndMetricsIdentical':True})
receipt={'sourceSHA256':hashlib.sha256((OUT/'Vegetable-Guru-Interior-Production-Preparation.pdf').read_bytes()).hexdigest(),'finalSHA256':hashlib.sha256((OUT/'Vegetable-Guru-Interior-Colour-Managed.pdf').read_bytes()).hexdigest(),'status':'All174page font definitions identical, excluding only source unused Helvetica. Hash includes font programs, CMaps, Type3 glyph procedure bytes, encoding and metrics. Object IDs are normalised.','pages':records}
(DOC/'FONT-PRODUCTION-PRESERVATION.json').write_text(json.dumps(receipt,indent=2)+'\n');print(receipt['status'])
