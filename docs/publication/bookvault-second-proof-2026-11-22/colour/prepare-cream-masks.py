from pathlib import Path
import json,hashlib,gc,math
import numpy as np
from PIL import Image,ImageDraw,ImageFont
import pypdfium2 as pdfium
from pypdf import PdfReader,overwrite_configuration
overwrite_configuration(maximum_declared_stream_length=400_000_000,zlib_maximum_output_length=400_000_000,stream_decoding_work_maximum_length=800_000_000)
R=Path.cwd();D=R/'docs/publication/bookvault-second-proof-2026-11-22/colour';M=D/'cream-masks';M.mkdir(exist_ok=True)
source=R/'output/pdf/bookvault-second-proof-2026-11-22/interior/Vegetable-Guru-Interior-Colour-Managed.pdf';native=R/'output/pdf/bookvault-second-proof-2026-11-22/interior/Vegetable-Guru-Interior-Production-Preparation.pdf';r=PdfReader(source);n=pdfium.PdfDocument(native);records=[]
for f in [7,97,145]:
 page=r.pages[f-1];ob=[x.get_object() for x in page['/Resources']['/XObject'].values() if x.get_object().get('/Subtype')=='/Image'][0];w,h=int(ob['/Width']),int(ob['/Height']);a=np.frombuffer(ob.get_data(),np.uint8).reshape((h,w,4));mask=np.all(a==[0,7,24,0],axis=2);initial=int(mask.sum());exclusions=[];height=float(page.mediabox.height)
 for obj in n[f-1].get_objects(max_depth=20):
  if obj.type!=pdfium.raw.FPDF_PAGEOBJ_IMAGE:continue
  iw,ih=obj.get_px_size()
  if min(iw,ih)<=32:continue # Prepared edge-continuation strip, not a photograph.
  l,b,rr,t=obj.get_bounds();box=[max(0,math.floor(l*600/72)-2),max(0,math.floor((height-t)*600/72)-2),min(w,math.ceil(rr*600/72)+2),min(h,math.ceil((height-b)*600/72)+2)]
  x0,y0,x1,y1=box;excluded=int(mask[y0:y1,x0:x1].sum());mask[y0:y1,x0:x1]=False;exclusions.append({'nativeImageBoundsPt':[l,b,rr,t],'nativeImagePixels':[iw,ih],'excludedRasterBoxWith2pxGuard':box,'flatColourPixelsExcluded':excluded})
 path=M/f'background-{f:03}.png';Image.fromarray((mask*255).astype('uint8'),'L').convert('1').save(path)
 # Source photos, native glyphs and non-background art are excluded. The only
 # selected samples are the exact mis-profiled flat cream in the artwork plane.
 selected=a[mask];assert len(selected)>10000000 and np.all(selected==[0,7,24,0]);bounds=np.argwhere(mask);bbox=[int(bounds[:,1].min()),int(bounds[:,0].min()),int(bounds[:,1].max()+1),int(bounds[:,0].max()+1)]
 im=Image.open(D/'production/detail'/f'folio-{f:03}.png').convert('RGB');m=Image.fromarray((mask*255).astype('uint8'),'L').resize(im.size,Image.Resampling.NEAREST);tint=Image.new('RGB',im.size,'#e1a4cf');overlay=Image.composite(Image.blend(im,tint,.4),im,m);overlay.thumbnail((650,850),Image.Resampling.LANCZOS);overlay.save(M/f'mask-review-{f:03}.jpg',quality=93,subsampling=0)
 rec={'folio':f,'sourceArtSha256':hashlib.sha256(a.tobytes()).hexdigest(),'mask':str(path.relative_to(R)),'maskSha256':hashlib.sha256(path.read_bytes()).hexdigest(),'sourceSize':[w,h],'oldCmyk':[0,7,24,0],'newCmyk':[0,7,29,0],'exactFlatTintPixelsBeforeExclusion':initial,'selectedBackgroundPixels':int(mask.sum()),'selectedBoundsPixels':bbox,'photoExclusions':exclusions,'cornerCmyk':{'outerTopLeft':list(map(int,a[0,0])),'trimInset':list(map(int,a[100,100]))},'nativeTextPlaneUntouched':True};records.append(rec);print(f,rec['selectedBackgroundPixels'],len(exclusions),sum(x['flatColourPixelsExcluded'] for x in exclusions),flush=True)
 del a,mask,selected,bounds;ob.decoded_self=None;gc.collect()
result={'source':str(source.relative_to(R)),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'method':'Exact flat CMYK[0,7,24,0] pixels in opaque artwork only, excluding every actual photo placement plus2pixel guard from original native image bounds. Native glyph plane stays byte-identical; every nonselected artwork sample stays byte-identical. Source images/profiles and all composition remain intact. Masks are1-bit PNGs matching the existing600dpi page image dimensions.','regions':records};(D/'CREAM-BACKGROUND-CORRECTION.json').write_text(json.dumps(result,indent=2)+'\n')
