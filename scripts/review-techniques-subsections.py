"""Render both-unit section proofs and verify the restored paper at both edges."""
from pathlib import Path
import subprocess,json,hashlib
from PIL import Image
R=Path(__file__).resolve().parents[1];D=R/'docs/publication/techniques-subsections'
m=json.loads((D/'MANIFEST.json').read_text());results=[]
for r in m['results']:
 u=r['units'];assert hashlib.sha256((R/r['pdf']).read_bytes()).hexdigest()==r['sha256']
 subprocess.run(['/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm','-r','110','-jpeg','-jpegopt','quality=90',str(R/r['pdf']),str(D/u)],check=True)
 for n in range(1,19):
  im=Image.open(D/f'{u}-{n:02}.jpg').convert('RGB')
  for x in [2,im.width-3]:
   for y in [int(im.height*.15),im.height//2,int(im.height*.85)]:
    assert max(abs(a-b) for a,b in zip(im.getpixel((x,y)),(255,248,233)))<=3,(u,n,x,y,im.getpixel((x,y)))
 for first in range(1,19,2):
  images=[Image.open(D/f'{u}-{n:02}.jpg').convert('RGB') for n in [first,first+1]]
  ims=[im.resize((650,round(im.height*650/im.width))) for im in images]
  canvas=Image.new('RGB',(1314,ims[0].height),'#d9dfcf');canvas.paste(ims[0],(0,0));canvas.paste(ims[1],(664,0));canvas.save(D/f'{u}-spread-{145+first}-{146+first}.jpg',quality=90)
 results.append({'units':u,'sha256':r['sha256'],'actualPdfPages':18,'paperEdgesChecked':True,'bodyAndHeaderChecks':'MANIFEST.json'})
(D/'PDF-CHECKS.json').write_text(json.dumps({'date':'2026-10-19','status':'passed; visual review recorded separately','results':results},indent=2)+'\n')
print('Rendered all nine facing spreads in both units; cream edges verified on every page.')
