from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps
import json, math, sys

manifest=Path(sys.argv[1])
destination=Path(sys.argv[2]);destination.mkdir(parents=True,exist_ok=True)
items=json.loads(manifest.read_text())
frames=[]
for item in items:
 for f in item.get('frames',[]):
  if 'file' in f:frames.append(dict(f,id=item['id'],shoot=item['shoot'],source=item['path']))
font=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',16)
small=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',13)
for batch in range(math.ceil(len(frames)/20)):
 selected=frames[batch*20:(batch+1)*20]
 canvas=Image.new('RGB',(1360,1180),'#f7f4eb');d=ImageDraw.Draw(canvas)
 for j,f in enumerate(selected):
  x=10+(j%4)*338;y=12+(j//4)*234
  im=Image.open(f['file']).convert('RGB');im.thumbnail((328,185))
  canvas.paste(im,(x+(328-im.width)//2,y))
  t=f.get('actualSeconds',f['requestedSeconds']);label=f"{f['id']}  {int(t//60):02d}:{t%60:06.3f}"
  d.text((x,y+187),label,font=font,fill='#173e2c')
  d.text((x,y+208),f['shoot'][:43],font=small,fill='#333333')
 filename=f'scout-{batch+1:02d}.jpg'
 canvas.save(destination/filename,quality=88)
 for f in selected:f['sheet']=filename
(destination/'INDEX.json').write_text(json.dumps(frames,indent=2)+'\n')
print(f'{len(frames)} frames in {math.ceil(len(frames)/20)} sheets')
