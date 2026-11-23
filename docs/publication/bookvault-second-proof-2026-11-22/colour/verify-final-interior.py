from pathlib import Path
import json,hashlib,gc
import numpy as np
from pypdf import PdfReader,overwrite_configuration
overwrite_configuration(maximum_declared_stream_length=400_000_000,zlib_maximum_output_length=400_000_000,stream_decoding_work_maximum_length=800_000_000)
R=Path.cwd();D=R/'docs/publication/bookvault-second-proof-2026-11-22/colour';f=R/'output/pdf/bookvault-second-proof-2026-11-22/interior/Vegetable-Guru-Interior-Colour-Managed.pdf';r=PdfReader(f);assert len(r.pages)==174
icc=r.trailer['/Root']['/OutputIntents'][0].get_object()['/DestOutputProfile'].get_object().get_data();target=R/'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc';assert icc==target.read_bytes()
samples=json.loads((D/'ACTUAL-SHADOW-SAMPLE-CHECKS.json').read_text());expected={p['folio']:p['actualArtSha256'] for p in samples['pages']};images=[];photoChecks=[];background=[]
for i,page in enumerate(r.pages,1):
 obs=[x.get_object() for x in page['/Resources'].get('/XObject',{}).values() if x.get_object().get('/Subtype')=='/Image'];assert len(obs)==1,(i,len(obs));ob=obs[0];assert str(ob['/ColorSpace'])=='/DeviceCMYK' and '/SMask' not in ob and '/Mask' not in ob,(i,str(ob.get('/ColorSpace')));images.append({'folio':i,'pixels':[int(ob['/Width']),int(ob['/Height'])]})
 if i in expected or i in [1,2,3,4,5,6,7,34,56,96,97,145,146,154,168,174]:
  data=ob.get_data();a=np.frombuffer(data,np.uint8).reshape((int(ob['/Height']),int(ob['/Width']),4))
  if i in expected:
   sha=hashlib.sha256(data).hexdigest();assert sha==expected[i];photoChecks.append({'folio':i,'actualArtSha256':sha,'matchesIndependentlyVerifiedSelectiveSample':True})
  rec={'folio':i,'topLeftInsetCmyk':list(map(int,a[100,100]))}
  if i in [4,6,96,174]:rec['uniformFullMediaCream']=bool(np.all(a==[0,7,29,0]));assert rec['uniformFullMediaCream']
  background.append(rec);del a,data;ob.decoded_self=None;gc.collect()
result={'file':str(f.relative_to(R)),'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size,'folios':174,'profileSha256':hashlib.sha256(icc).hexdigest(),'profileByteIdenticalToAcceptedFirstProof':True,'all174PageArtworkOpaqueCmyk':True,'photoPatches':photoChecks,'creamChecks':background,'imagePixels':images,'scope':'Independent production colour structure, blank/palette and photo-pixel checks. Native font/glyph and all-page visibility checks are separately recorded by the interior agent; actual final visual coverage is recorded in PRODUCTION-VISUAL-REVIEW.json.'};(D/'FINAL-INTERIOR-COLOUR-CHECKS.json').write_text(json.dumps(result,indent=2)+'\n');print({k:v for k,v in result.items() if k!='imagePixels'})
