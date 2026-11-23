from pathlib import Path
from collections import Counter
import hashlib,json,io
from pypdf import PdfReader
from PIL import ImageCms
ROOT=Path.cwd();D=ROOT/'docs/publication/bookvault-second-proof-2026-11-22/colour'
profile=ROOT/'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc'
icc=ImageCms.getOpenProfile(str(profile)); result={'profile':{'path':str(profile.relative_to(ROOT)),'sha256':hashlib.sha256(profile.read_bytes()).hexdigest(),'bytes':profile.stat().st_size,'description':ImageCms.getProfileDescription(icc).strip(),'info':ImageCms.getProfileInfo(icc).strip(),'copyright':ImageCms.getProfileCopyright(icc).strip(),'colourSpace':str(icc.profile.xcolor_space),'connectionSpace':str(icc.profile.connection_space),'iccVersion':icc.profile.version},'sources':[]}
paths=[('current-interior','output/pdf/bookvault-second-proof-2026-11-22/interior/Vegetable-Guru-Interior-Production-Preparation.pdf'),('approved-cover','output/pdf/cover-print-resolution-review/Vegetable-Guru-Corrected-Cover-Wrap-Proof.pdf'),('accepted-first-proof','output/pdf/bookvault-print-ready/the-vegetable-guru-interior.pdf')]
def obj(x):return x.get_object() if hasattr(x,'get_object') else x
def digest(data):return hashlib.sha256(data).hexdigest()
for label,path in paths:
 p=ROOT/path;r=PdfReader(p);seen=set();spaces=Counter();imstats=Counter();iccs={};pages=[]
 def space(v):
  v=obj(v)
  if isinstance(v,list) and str(v[0])=='/ICCBased':
   ob=obj(v[1]);raw=ob.get_data();sha=digest(raw)
   try:desc=ImageCms.getProfileDescription(ImageCms.ImageCmsProfile(io.BytesIO(raw))).strip()
   except Exception:desc='unreadable ICC metadata'
   iccs[sha]={'N':ob.get('/N'),'description':desc,'bytes':len(raw)}
   return '/ICCBased/'+str(ob.get('/N'))+'/'+sha[:12]
  return str(v)
 def walk(res,counts):
  if not res:return
  res=obj(res)
  for name,ref in obj(res.get('/XObject',{})).items():
   ob=obj(ref)
   if not hasattr(ob,'get'):counts['nullOrNonDictionaryXObjects']+=1;continue
   ident=getattr(ref,'idnum',id(ob))
   if ident in seen:continue
   seen.add(ident)
   if ob.get('/Subtype')=='/Image':
    cs=space(ob.get('/ColorSpace'));spaces[cs]+=1;counts['images']+=1
    imstats['softMasks']+=int('/SMask' in ob);counts['softMasks']+=int('/SMask' in ob)
    imstats['explicitMasks']+=int('/Mask' in ob);imstats['imageMasks']+=int(bool(ob.get('/ImageMask')))
    imstats['opaqueImages']+=int('/SMask' not in ob and '/Mask' not in ob and not ob.get('/ImageMask'))
   elif ob.get('/Subtype')=='/Form':
    counts['transparencyGroups']+=int(obj(ob.get('/Group',{})).get('/S')=='/Transparency');walk(ob.get('/Resources',res),counts)
  for name,ref in obj(res.get('/ColorSpace',{})).items():space(ref)
  for name,ref in obj(res.get('/ExtGState',{})).items():
   g=obj(ref);counts['nonOpaqueAlpha']+=int(float(g.get('/ca',1))!=1 or float(g.get('/CA',1))!=1);counts['softMaskStates']+=int(str(g.get('/SMask','/None'))!='/None');counts['nonNormalBlend']+=int(str(g.get('/BM','/Normal')) not in ('/Normal','/Compatible'))
 for i,pag in enumerate(r.pages,1):
  counts=Counter();walk(pag.get('/Resources'),counts);counts['pageTransparencyGroup']=int(obj(pag.get('/Group',{})).get('/S')=='/Transparency');pages.append({'page':i,**dict(counts)})
 intents=[]
 for oi in obj(r.trailer['/Root'].get('/OutputIntents',[])):
  ob=obj(oi);raw=obj(ob.get('/DestOutputProfile')).get_data() if ob.get('/DestOutputProfile') else b'';intents.append({'identifier':str(ob.get('/OutputConditionIdentifier')),'profileSha256':digest(raw),'profileMatchesHistorical':raw==profile.read_bytes()})
 result['sources'].append({'label':label,'path':path,'pages':len(r.pages),'imageColourSpaces':dict(spaces),'imageStats':dict(imstats),'embeddedICCProfiles':iccs,'outputIntents':intents,'perPage':pages});print(label,dict(spaces),dict(imstats),intents,flush=True)
(D/'COLOUR-INPUT-ANALYSIS.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result['profile'],indent=2))
