from pathlib import Path
from pypdf import PdfReader
from pypdf.generic import ContentStream
from PIL import ImageCms
import hashlib,io,json
R=Path.cwd();D=R/'docs/publication/bookvault-second-proof-2026-11-22/colour';r=PdfReader(R/'output/pdf/bookvault-second-proof-2026-11-22/interior/Vegetable-Guru-Interior-Production-Preparation.pdf')
def obj(x):return x.get_object() if hasattr(x,'get_object') else x
records=[]
def inspect(cs,p,kind,name):
 cs=obj(cs)
 if isinstance(cs,list) and str(cs[0])=='/ICCBased':
  profile=obj(cs[1]).get_data();icc=ImageCms.ImageCmsProfile(io.BytesIO(profile));desc=ImageCms.getProfileDescription(icc).strip();sha=hashlib.sha256(profile).hexdigest()
  records.append({'folio':p,'kind':kind,'name':str(name),'profile':desc,'sha256':sha})
  path=D/'source-profiles'/f'{sha}.icc';path.parent.mkdir(exist_ok=True)
  if not path.exists():path.write_bytes(profile)
def walk(stream,res,p,stack):
 if stream is None:return
 res=obj(res);spaces=obj(res.get('/ColorSpace',{}))
 for key in ('/DefaultRGB','/DefaultGray','/DefaultCMYK'):
  if key in spaces:inspect(spaces[key],p,'default',key)
 for vals,op in ContentStream(stream,r).operations:
  if op in (b'cs',b'CS'):
   cs=spaces.get(vals[0],vals[0]);inspect(cs,p,'paint',vals[0])
  if op==b'Do':
   ref=res['/XObject'][vals[0]];x=obj(ref);ident=getattr(ref,'idnum',id(x))
   if not hasattr(x,'get'):continue
   if x.get('/Subtype')=='/Image':inspect(x.get('/ColorSpace'),p,'image',vals[0])
   elif x.get('/Subtype')=='/Form' and ident not in stack:walk(x,x.get('/Resources',res),p,stack|{ident})
for i,p in enumerate(r.pages,1):walk(p.get_contents(),p['/Resources'],i,set())
(D/'ACTIVE-SOURCE-PROFILES.json').write_text(json.dumps(records,indent=2)+'\n')
from collections import defaultdict
summary=defaultdict(set)
for x in records:summary[(x['profile'],x['kind'])].add(x['folio'])
for (profile,kind),folios in summary.items():print(profile,kind,sorted(folios))
