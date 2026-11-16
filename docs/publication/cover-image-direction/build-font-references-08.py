"""Exact one-family font references for the three requested full-cover image edits."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json,hashlib
OUT=Path(__file__).resolve().parent
ROOT=OUT.parents[2]
prior=json.loads((OUT/'font-list/FONTS.json').read_text())
rows=[]
for ident in ['H','A','E']:
 s=next(x for x in prior['variants'] if x['id']==ident)
 assert hashlib.sha256(Path(s['font_file']).read_bytes()).hexdigest()==s['font_sha256']
 def face(size):
  f=ImageFont.truetype(s['font_file'],size,index=s['face_index'])
  if s['weight_axis'] is not None:f.set_variation_by_axes([s['weight_axis']])
  return f
 im=Image.new('RGB',(1600,1350),'white')
 d=ImageDraw.Draw(im)
 for text,size,y in [('The',130,80),('Vegetable',210,270),('Guru',250,540),('Your at-a-glance',92,860),('growing companion',92,1000),('John Lennon',106,1160)]:
  f=face(size);b=d.textbbox((0,0),text,font=f)
  while b[2]-b[0]>1440:
   size-=1;f=face(size);b=d.textbbox((0,0),text,font=f)
  d.text((80-b[0],y-b[1]),text,font=f,fill='#173e2c')
 path=OUT/'font-references'/f'{ident}-actual-font.png'
 path.parent.mkdir(parents=True,exist_ok=True)
 im.save(path)
 rows.append({'id':ident,'font_label':s['label'],'path':str(path.relative_to(ROOT)),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'font_file':s['font_file'],'face_index':s['face_index'],'font_sha256':s['font_sha256']})
(OUT/'FONT-REFERENCES-08.json').write_text(json.dumps({'date':'2026-11-11','role':'Authoritative type shapes only; cover composition and colour come from 06B','references':rows},indent=2)+'\n')
print(json.dumps(rows))

