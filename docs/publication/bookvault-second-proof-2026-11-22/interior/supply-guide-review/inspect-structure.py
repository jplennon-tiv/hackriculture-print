from pathlib import Path
from collections import Counter
import json
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[5]
DOC=Path(__file__).resolve().parent
files={
 'accepted_first_interior':'output/pdf/bookvault-print-ready/the-vegetable-guru-interior.pdf',
 'corrected_failed_interior':'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-Corrected-Headers.pdf',
 'failed_pdfx3_interior':'output/pdf/header-placement-review-2026-11-23/Vegetable-Guru-Interior-PDFX3.pdf'}
results={}
for label,path in files.items():
 p=ROOT/path;r=PdfReader(p);images={};fonts={};forms=set();seen=set();features=Counter()
 def walk(obj):
  if hasattr(obj,'idnum'):
   key=(obj.idnum,obj.generation)
   if key in seen:return
   seen.add(key);obj=obj.get_object()
  if isinstance(obj,dict):
   for k in ('/OCProperties','/OC','/SMask','/AcroForm','/EmbeddedFiles','/JavaScript'):
    if k in obj:features[k]+=1
   if obj.get('/Type')=='/Font':
    key=obj.indirect_reference.idnum if getattr(obj,'indirect_reference',None) else id(obj)
    fonts[key]=str(obj.get('/Subtype'))
   if obj.get('/Subtype')=='/Image':
    key=obj.indirect_reference.idnum if getattr(obj,'indirect_reference',None) else id(obj)
    cs=str(obj.get('/ColorSpace'));channels=4 if cs=='/DeviceCMYK' else (3 if cs=='/DeviceRGB' else 1)
    images[key]={'width':int(obj['/Width']),'height':int(obj['/Height']),'bits':int(obj.get('/BitsPerComponent',1)),'space':cs,'encodedBytes':len(obj._data),'decodedBytesEstimated':int(obj['/Width'])*int(obj['/Height'])*channels*int(obj.get('/BitsPerComponent',1))//8}
   for k,v in obj.items():
    if k!='/Parent':walk(v)
  elif isinstance(obj,list):
   for v in obj:walk(v)
 walk(r.trailer['/Root'])
 boxes={tuple(round(float(x)*25.4/72,4) for x in page.mediabox) for page in r.pages}
 trims={tuple(round(float(x)*25.4/72,4) for x in page.trimbox) for page in r.pages}
 big=sorted(images.values(),key=lambda v:v['encodedBytes'],reverse=True)
 result={'path':path,'bytes':p.stat().st_size,'header':r.pdf_header,'pages':len(r.pages),'encrypted':r.is_encrypted,'mediaBoxesMm':sorted(boxes),'trimBoxesMm':sorted(trims),'pageRotations':dict(Counter(page.get('/Rotate',0) for page in r.pages)),'fontTypes':dict(Counter(fonts.values())),'features':dict(features),'imageCount':len(images),'encodedImageBytes':sum(x['encodedBytes'] for x in images.values()),'decodedImageBytesEstimated':sum(x['decodedBytesEstimated'] for x in images.values()),'largestImage':max(images.values(),key=lambda v:v['decodedBytesEstimated']),'largestEncodedImages':big[:5],'imageDimensions':dict(Counter(f"{i['width']}x{i['height']}" for i in images.values()))}
 results[label]=result
 print(label,json.dumps({k:v for k,v in result.items() if k not in ('largestEncodedImages','imageDimensions')},indent=2),flush=True)
(DOC/'STRUCTURE-COMPARISON.json').write_text(json.dumps(results,indent=2)+'\n')
