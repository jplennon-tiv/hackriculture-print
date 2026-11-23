from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
DOC=Path(__file__).resolve().parent;SRC=DOC/'colour-work/actual-cmyk';OUT=DOC/'colour-contacts';OUT.mkdir(exist_ok=True)
for start in range(1,175,16):
 sheet=Image.new('RGB',(1080,1460),'#e5e5e5');d=ImageDraw.Draw(sheet)
 for j,n in enumerate(range(start,min(start+16,175))):
  im=Image.open(SRC/f'page-{n:03}.png').convert('RGB');im.thumbnail((258,332));x=8+(j%4)*270;y=26+(j//4)*364;sheet.paste(im,(x,y));d.text((x,y-18),f'Folio {n}',fill='black')
 path=OUT/f'contact-{start:03}.jpg';sheet.save(path,quality=92);print(path)
