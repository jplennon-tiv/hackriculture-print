from pathlib import Path
import numpy as np,json,hashlib,math
from pypdf import PdfReader
from pypdf.generic import ContentStream
R=Path.cwd();D=R/'docs/publication/bookvault-second-proof-2026-11-22/colour';source=R/'output/pdf/bookvault-second-proof-2026-11-22/interior/Vegetable-Guru-Interior-Production-Preparation.pdf';r=PdfReader(source)
def box(m,x,y,w,h):
 v=m@np.array([[x,x+w,x+w,x],[y,y,y+h,y+h],[1,1,1,1]]);return [float(v[0].min()),float(v[1].min()),float(v[0].max()),float(v[1].max())]
def inter(a,b):return [max(a[0],b[0]),max(a[1],b[1]),min(a[2],b[2]),min(a[3],b[3])]
records=[]
for f,targetName in [(154,'/X7'),(155,None),(168,None)]:
 page=r.pages[f-1];ctm=np.eye(3);clip=list(map(float,page.mediabox));stack=[];path=[];pending=False;imgs=[]
 for vals,op in ContentStream(page.get_contents(),r).operations:
  if op==b'q':stack.append((ctm.copy(),clip.copy()))
  elif op==b'Q':ctm,clip=stack.pop()
  elif op==b'cm':
   a,b,c,d,e,g=map(float,vals);ctm=ctm@np.array([[a,c,e],[b,d,g],[0,0,1]])
  elif op==b're':path.append(box(ctm,*map(float,vals)))
  elif op in (b'W',b'W*'):pending=True
  elif op in (b'n',b'f',b'f*',b'S',b's',b'B',b'B*'):
   if pending:
    for pp in path:clip=inter(clip,pp)
   pending=False;path=[]
  elif op==b'Do':
   ob=page['/Resources']['/XObject'][vals[0]].get_object()
   if hasattr(ob,'get') and ob.get('/Subtype')=='/Image':imgs.append({'resourceName':str(vals[0]),'intrinsicSize':[ob.get('/Width'),ob.get('/Height')],'unclippedMediaBoundsPt':box(ctm,0,0,1,1),'visibleMediaBoundsPt':inter(clip,box(ctm,0,0,1,1))})
 if f==154:selected=[x for x in imgs if x['resourceName']=='/X7'][0]
 elif f==155:selected=[x for x in imgs if x['intrinsicSize']==[1075,782]][0]
 else:selected=[x for x in imgs if x['intrinsicSize']==[1600,1067]][0]
 selected['folio']=f;selected['visibleTrimBoundsPt']=[selected['visibleMediaBoundsPt'][i]-float(page.trimbox[i%2]) for i in range(4)]
 l,b,rr,t=selected['visibleMediaBoundsPt'];height=float(page.mediabox.height);scale=600/72
 selected['pixelCentreBox600dpiPillow']=[math.ceil(l*scale-.5),math.ceil((height-t)*scale-.5),math.ceil(rr*scale-.5),math.ceil((height-b)*scale-.5)]
 selected['sourceMediaHeightPt']=height;records.append(selected)
result={'source':str(source.relative_to(R)),'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'targetProfile':'docs/publication/bookvault-print-ready/assets/ISOcoated_v2_300_eci.icc','renderingIntent':1,'flags':8192,'flagName':'BLACKPOINTCOMPENSATION','method':'From the same retained sRGB art raster as baseline: apply LittleCMS sRGB→target CMYK relative colourimetric plus BPC only inside the three stated visible photograph rectangles. No CMYK→RGB→CMYK round-trip. All CMYK samples outside the three rectangles and all vector/native type must remain byte-identical to baseline.','coordinateSystem':'PDF points; [left,bottom,right,top], in prepared media coordinates. Trim coordinates also supplied. Raster boxes are [left,top,rightExclusive,bottomExclusive] using pixel-centre inclusion at exactly 600 dpi; use actual renderer mapping if its edge rounding differs.','regions':records}
(D/'SELECTIVE-PHOTO-BPC.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps(result,indent=2))
