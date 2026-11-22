"""Create a smaller browsing derivative; native text and page geometry retained.

The exact-art native master remains separate. Eligible RGB image streams
are JPEG-encoded here, capped at 1200 pixels for browsing. The source
pixel dimensions and exact native art remain in the separate full-size master.
"""
from pathlib import Path
import json,hashlib,io
from pypdf import PdfReader,PdfWriter
from pypdf.generic import EncodedStreamObject,DecodedStreamObject,NameObject,NumberObject
from PIL import Image
R=Path(__file__).resolve().parents[1];D=R/'docs/publication/whole-book-order-preview/integration-2026-11-22'
manifest=json.loads((D/'SOURCES.json').read_text());checks=json.loads((D/'NATIVE-CHECKS.json').read_text())
source=R/checks['candidate'];out=R/manifest['readingCopy'];out.parent.mkdir(parents=True,exist_ok=True)
reader=PdfReader(source);writer=PdfWriter(clone_from=reader);changed=[];cache={}
for i,obj in list(enumerate(writer._objects)):
 if not hasattr(obj,'get') or obj.get('/Subtype')!='/Image':continue
 if obj.get('/BitsPerComponent')!=8 or '/Mask' in obj:continue
 space=obj.get('/ColorSpace');space=space.get_object() if hasattr(space,'get_object') else space;rgb=space=='/DeviceRGB'
 if isinstance(space,list) and space[0]=='/ICCBased':rgb=space[1].get_object().get('/N')==3
 if not rgb:continue
 w,h=int(obj['/Width']),int(obj['/Height'])
 if w*h<30000:continue
 data=obj.get_data()
 if '/DCTDecode' in str(obj.get('/Filter')):
  im=Image.open(io.BytesIO(data)).convert('RGB');data=im.tobytes()
 else:
  if len(data)!=w*h*3:continue
  im=Image.frombytes('RGB',(w,h),data)
 key=hashlib.sha256(data).hexdigest()
 nw,nh=w,h
 if max(w,h)>1200:
  ratio=1200/max(w,h);nw,nh=round(w*ratio),round(h*ratio);im=im.resize((nw,nh),Image.Resampling.LANCZOS)
 if key not in cache:
  b=io.BytesIO();im.save(b,format='JPEG',quality=87,subsampling=0,optimize=True);cache[key]=b.getvalue()
 compressed=cache[key]
 if len(compressed)>=len(obj._data) and (nw,nh)==(w,h):continue
 replacement=EncodedStreamObject()
 for k,v in obj.items():
  if k not in ['/Length','/Filter','/DecodeParms']:replacement[k]=v
 replacement[NameObject('/Width')]=NumberObject(nw);replacement[NameObject('/Height')]=NumberObject(nh)
 if (nw,nh)!=(w,h) and '/SMask' in obj:
  oldmask=obj['/SMask'];assert oldmask['/BitsPerComponent']==8
  mask=Image.frombytes('L',(w,h),oldmask.get_data()).resize((nw,nh),Image.Resampling.LANCZOS)
  newmask=DecodedStreamObject();newmask.set_data(mask.tobytes());newmask=newmask.flate_encode()
  for k,v in oldmask.items():
   if k not in ['/Length','/Filter','/DecodeParms','/Width','/Height']:newmask[k]=v
  newmask[NameObject('/Width')]=NumberObject(nw);newmask[NameObject('/Height')]=NumberObject(nh)
  replacement[NameObject('/SMask')]=writer._add_object(newmask)
 replacement[NameObject('/Filter')]=NameObject('/DCTDecode');replacement._data=compressed;replacement.indirect_reference=obj.indirect_reference
 writer._objects[i]=replacement
 changed.append({'object':i+1,'nativePixels':[w,h],'reviewPixels':[nw,nh],'nativeEncodedBytes':len(obj._data),'reviewEncodedBytes':len(compressed),'decodedSourceSHA256':key})
 if len(changed)%100==0:print(f'Prepared {len(changed)} browsing image streams.',flush=True)
writer.compress_identical_objects(remove_duplicates=True,remove_unreferenced=True)
writer.write(out)
final=PdfReader(out);assert len(final.pages)==180
for i,(a,b) in enumerate(zip(reader.pages,final.pages)):
 assert a.extract_text()==b.extract_text(),('Review text changed',i)
 assert a.get_contents().get_data()==b.get_contents().get_data(),('Page geometry changed',i)
 assert len(a.get('/Annots',[]))==len(b.get('/Annots',[])),('Links changed',i)
def sha(p):
 with p.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
receipt={'date':'2026-11-22','source':str(source.relative_to(R)),'sourceSHA256':checks['sha256'],'readingCopy':str(out.relative_to(R)),'sha256':sha(out),'bytes':out.stat().st_size,'pages':180,'nativeTextAndPageGeometryExact':True,'imagesDownsampled':sum(x['nativePixels']!=x['reviewPixels'] for x in changed),'imageEncoding':'JPEG quality 87, 4:4:4, 1200-pixel cap for browsing derivative only; full-resolution native master unchanged','changedImageStreams':changed,'status':'Encoding and structural checks passed; visual comparison pending'}
(D/'READING-COPY.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({k:v for k,v in receipt.items() if k!='changedImageStreams'}),flush=True)
