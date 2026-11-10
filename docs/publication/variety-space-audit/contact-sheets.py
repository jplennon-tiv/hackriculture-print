import json
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont
root=Path('docs/publication/variety-space-audit')
rows=json.loads((root/'MEASUREMENTS.json').read_text())['results']
font=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',20)
for unit in ('imperial','metric'):
 for batch in range(4):
  chosen=rows[batch*12:batch*12+12]
  sheet=Image.new('RGB',(2040,2160),'#e3e3df'); draw=ImageDraw.Draw(sheet)
  for index,row in enumerate(chosen):
   im=Image.open(row['units'][unit]['image']).convert('RGB')
   # Existing source proof is a two-page spread: take its complete left half.
   im=im.crop((0,0,im.width//2,im.height))
   im.thumbnail((490,675))
   x=(index%4)*510+10;y=(index//4)*720+36
   sheet.paste(im,(x,y))
   label=f"{row['units'][unit]['folio']}: {row['name']}"
   draw.text((x,y-29),label,fill='#222222',font=font)
  sheet.save(root/f'{unit}-{batch+1}.jpg',quality=94)
print('Created 8 contact sheets from 88 approved PDF spread images.')
