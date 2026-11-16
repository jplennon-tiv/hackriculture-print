"""Measure the three changed groups and verify preserved source bytes."""
from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image
from pypdf import PdfReader
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[3]
OUT=ROOT/'docs/publication/cover-versions/version-5'
before=OUT/'references/upper-title-before-proportions/Version-5.png'
def bounds(path):
 a=np.array(Image.open(path).convert('RGB')).astype(int);result={}
 for name,(x1,y1,x2,y2) in {'subtitle':(150,675,950,825),'author':(200,825,900,930),'garlic':(700,0,1090,248)}.items():
  c=a[y1:y2,x1:x2]
  m=((c[:,:,0]<100)&(c[:,:,1]<150)&(c[:,:,2]<100)) if name!='garlic' else ((c[:,:,0]>c[:,:,1]+15)&(c[:,:,0]>c[:,:,2]+30))
  y,x=np.where(m);result[name]=[int(x.min()+x1),int(y.min()+y1),int(x.max()+x1+1),int(y.max()+y1+1)]
 return result
old=bounds(before);new=bounds(OUT/'Version-5.png')
def centre(b):return [(b[0]+b[2])/2,(b[1]+b[3])/2]
shift={name:[round(centre(new[name])[i]-centre(old[name])[i],2) for i in range(2)] for name in old}
scale=[round((new['subtitle'][i+2]-new['subtitle'][i])/(old['subtitle'][i+2]-old['subtitle'][i]),3) for i in range(2)]
preserved=json.loads((HERE/'PRESERVED.json').read_text())
assert all(hashlib.sha256((ROOT/path).read_bytes()).hexdigest()==value for path,value in preserved.items())
review=OUT/'Version-5-review.pdf';pages=[[round(float(p.mediabox.width)*25.4/72,3),round(float(p.mediabox.height)*25.4/72,3)] for p in PdfReader(review).pages]
assert pages==[[185,240]]
record={'date':'2026-11-16','pages_mm':pages,'preserved_files':preserved,'requested_targets':{'subtitle_scale':0.9,'author_up_mm':3,'garlic_left_down_mm':[3,3]},'pixel_measurements':{'before':old,'after':new,'subtitle_width_height_scale':scale,'centre_shift_xy':shift,'method':'Thresholded dark-green text and warm garlic pigment bounds; generated contours make these approximate.'},'visual_review':'Pending final rendered PDF inspection.','status':'Generated layout proposal; dimensions are approximate, not an exact production reconstruction.'}
(HERE/'CHECKS.json').write_text(json.dumps(record,indent=2)+'\n')
print(json.dumps({'subtitle_scale':scale,'centre_shifts':shift,'pages_mm':pages}))
