"""Render the corrected PDF and collect all Key risks strips for visual review."""
from pathlib import Path
import json,subprocess,pdfplumber,logging
from PIL import Image,ImageDraw
logging.getLogger('pdfminer').setLevel(logging.ERROR)
D=Path(__file__).parent;plan=json.loads((D/'PDF-CHECKS.json').read_text());tmp=Path('tmp/pdfs/key-risk-title-case');tmp.mkdir(exist_ok=True)
subprocess.run(['pdftoppm','-r','130','-jpeg','-jpegopt','quality=90',plan['pdf'],str(tmp/'corrected')],check=True)
with pdfplumber.open(plan['pdf']) as pdf:
 tiles=[]
 for i,r in enumerate(plan['pages']):
  page=pdf.pages[i];head=page.search('Key risks')[0];im=Image.open(tmp/f'corrected-{i+1:02}.jpg');scale=im.width/page.width
  strip=im.crop((15*scale,(head['top']-3)*scale,(page.width-15)*scale,(page.height-37)*scale))
  strip.thumbnail((720,250));tile=Image.new('RGB',(740,280),'#fff8e9');tile.paste(strip,(10,26));ImageDraw.Draw(tile).text((10,8),f"{r['key']} / {r['folio']}",fill='#173e2c');tiles.append(tile)
  if r['key'] in ['broccoli','spinach','florence_fennel']:im.save(D/(r['key']+'.jpg'))
 for n in range(4):
  subset=tiles[n*12:(n+1)*12];contact=Image.new('RGB',(740*2,280*((len(subset)+1)//2)),'#ddd')
  for j,im in enumerate(subset):contact.paste(im,((j%2)*740,(j//2)*280))
  contact.save(D/f'risks-{n+1}.jpg',quality=90)
print('All 44 Key risks strips rendered.')
