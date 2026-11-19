import cv2 as cv, numpy as np, json, os
from pathlib import Path
cv.setNumThreads(2);cv.setRNGSeed(5)
import argparse
parser=argparse.ArgumentParser(description="Register the archived 1200-pixel frames on the measured paving datum.")
parser.add_argument('destination',type=Path,help='Output directory for the reconstructed mosaic and matrices')
d=parser.parse_args().destination
d.mkdir(parents=True,exist_ok=True)
inputs=Path(__file__).resolve().parent/'registration-inputs'
ims={t:cv.imread(str(inputs/f'{t}.jpg')) for t in range(112,134)}
ims['anchor']=cv.imread(str(inputs/'anchor-A04.jpg'))
sift=cv.SIFT_create(nfeatures=7500)
feats={k:sift.detectAndCompute(cv.cvtColor(v,cv.COLOR_BGR2GRAY),None) for k,v in ims.items()}
def matching(a,b):
 ka,fa=feats[a];kb,fb=feats[b]
 pairs=cv.BFMatcher().knnMatch(fa,fb,k=2)
 good=[(ka[m.queryIdx].pt,kb[m.trainIdx].pt) for m,n in pairs if m.distance<.72*n.distance]
 # Ignore the elevated roof, trees and beds on neighbouring plots.
 good=[g for g in good if 115<g[0][0]<1085 and 115<g[1][0]<1085 and not (isinstance(a,int) and a<=121 and g[0][0]>650 and (a<=118 or g[0][1]>260)) and not (isinstance(b,int) and b<=121 and g[1][0]>650 and (b<=118 or g[1][1]>260))]
 pa,pb=np.float32(good).transpose(1,0,2)
 H,mask=cv.findHomography(pa,pb,cv.USAC_MAGSAC,2.0,maxIters=4000)
 assert int(mask.sum())>40,(a,b,len(good))
 return H,int(mask.sum())
# Target is a shed-up grid, 50 pixels per Map 02 scene unit, datum unchanged.
# Repeated intersections of the 45 cm slab grid in A04 (image scaled to 1200 x 675).
pix=[[712,116],[792,121],[874,127],[954,130],[710,195],[787,201],[870,205],[950,210],[705,276],[782,281],[864,285],[945,290]]
coords=[(180+50*(4-i)*.45/.46,(35-(21.25+(row+1)*.45/.46))*50) for row in range(3) for i in range(4)]
base,_=cv.findHomography(np.float32(pix),np.float32(coords),0)
m={};stats={}
m[119],stats[119]=matching(119,'anchor');m[119]=base@m[119]
for t in [*range(118,111,-1),*range(120,134)]:
 b=t+(1 if t<119 else -1)
 h,stats[t]=matching(t,b);m[t]=m[b]@h
size=(1150,2300)
plate=np.zeros((size[1],size[0],3),np.uint8)+228;quality=np.zeros(plate.shape[:2],np.float32)
yy,xx=np.indices((675,1200));weight=np.float32(np.minimum.reduce([xx+1,1200-xx,(yy+1)*1.2,(675-yy)*1.2]))
for t in sorted(m):
 mat=m[t];im=cv.warpPerspective(ims[t],mat,size);score=cv.warpPerspective(weight,mat,size);use=score>quality;plate[use]=im[use];quality[use]=score[use]
cv.imwrite(str(d/'ground-mosaic.jpg'),plate)
print(stats)
(d/'image-to-ground.json').write_text(json.dumps({str(k):h.tolist() for k,h in m.items()}))
