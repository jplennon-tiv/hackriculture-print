from PIL import Image
from pathlib import Path
import numpy as np,json
rows=[]
for p in Path('public/images/key-risk-icons/silhouette-v5').glob('*.png'):
 im=Image.open(p).convert('RGBA');a=np.asarray(im);bounds=im.getchannel('A').getbbox();pale=int(((a[:,:,3]>180)&(a[:,:,:3].min(axis=2)>160)).sum());assert pale==0,(p.name,pale)
 assert a[:,:,3].min()==0 and a[:,:,3].max()>240,p.name
 # Ignore near-invisible alpha noise (also present in the two approved originals).
 visible_bounds=Image.fromarray((a[:,:,3]>8).astype('uint8')*255).getbbox()
 assert min(visible_bounds[0],visible_bounds[1],im.width-visible_bounds[2],im.height-visible_bounds[3])>8,(p.name,visible_bounds)
 edge_max=int(max(a[0,:,3].max(),a[-1,:,3].max(),a[:,0,3].max(),a[:,-1,3].max()));assert edge_max<=1,(p.name,edge_max)
 rows.append({'file':str(p),'size':im.size,'bounds':bounds,'visible_bounds_alpha_above_8':visible_bounds,'edge_alpha_max':edge_max,'opaque_pale_pixels':pale,'transparent_background':True})
assert len(rows)==31,len(rows)
Path('docs/icon-pilot/SILHOUETTE-ALPHA-CHECKS.json').write_text(json.dumps(rows,indent=2)+'\n');print('31 alpha and clear-margin checks passed')
