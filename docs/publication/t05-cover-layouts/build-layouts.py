"""Three separate front-cover proposals using T05 and exact local font outlines."""
from pathlib import Path
import hashlib, io, json, runpy
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

R=Path(__file__).resolve().parent
ROOT=R.parents[2]
VectorFont=runpy.run_path(str(R/'font-outlines.py'))['VectorFont']
fonts={
 'Lilita':VectorFont(ROOT/'public/fonts/richer-a-1.woff2'),
 'Nunito600':VectorFont(ROOT/'public/fonts/richer-a-6.woff2',600),
 'Nunito800':VectorFont(ROOT/'public/fonts/richer-a-6.woff2',800),
 'Georgia':VectorFont('/System/Library/Fonts/Supplemental/Georgia.ttf'),
}
photo_path=ROOT/'docs/publication/cover-photo-search/tomato-harvest-study/frames/T05_05m16s042_4K.png'
photo=Image.open(photo_path).convert('RGB')
assert photo.size==(3840,2160)
photo_bytes=io.BytesIO();photo.save(photo_bytes,format='JPEG',quality=96,subsampling=0);photo_bytes.seek(0)
photo_reader=ImageReader(photo_bytes)
MM=72/25.4;CW,CH=185*MM,240*MM
PAPER,INK,FOREST='#fff8e9','#173e2c','#064d32'
captions={
 'A':('Cream masthead','Closest to the interior','Lilita One above a broad photograph. Familiar, clear and friendly; the most conservative change.'),
 'B':('Forest frame','Calmer editorial direction','A serif title and inset photograph on forest green. My first choice for a more composed cover.'),
 'C':('Photograph first','A more personal introduction','The larger portrait leads, with the title below. Warm and direct; the title has less dominance at thumbnail size.'),
}
metadata={'date':'2026-11-11','status':'three unapproved front-cover layout proposals','preferred_source':'T05, chosen by John for cover trials','trim_mm':[185,240],'source':str(photo_path.relative_to(ROOT)),'source_sha256':hashlib.sha256(photo_path.read_bytes()).hexdigest(),'copy':{'title':'The Vegetable Guru','subtitle':'Your at-a-glance growing companion','author':'John Lennon'},'photo_treatment':'Original T05 pixels, clipped and scaled within PDF panels. No retouching, generative changes or upscaling. PDF embeds a high-quality JPEG derivative; original PNG retained.','type_treatment':'Resolution-independent vector outlines from local Lilita One and Nunito Sans at 600/800; Georgia regular is a new cover-only proposal. Exact letters remain editable in the Python source. Font files and vector glyphs are read locally; no remote font dependency.','layouts':{}}
c=canvas.Canvas(str(R/'Cover-layouts-review.pdf'),pagesize=(842,595),pageCompression=1)
c.setTitle('The Vegetable Guru - T05 front-cover layout trials')
c.setAuthor('Cover layout proposals for John Lennon')
current=None
def rect(x,y,w,h,colour):
 c.setFillColor(HexColor(colour));c.rect(x*MM,(240-y-h)*MM,w*MM,h*MM,fill=1,stroke=0)
def label(text,face,size,baseline,x=None,colour=INK,tracking=0,available=165):
 f=fonts[face];width=f.width(text,size,tracking)
 assert width<=available*MM,(current,text,width/MM,available)
 if x is None:x=(CW-width)/2/MM
 assert x>=6 and x*MM+width<=CW-6*MM,(current,text,'unsafe horizontal bounds')
 c.setFillColor(HexColor(colour));f.draw(c,text,x*MM,(240-baseline)*MM,size,tracking)
 metadata['layouts'][current]['text'].append(dict(text=text,font=face,point_size=size,x_mm=round(x,3),baseline_from_top_mm=baseline,width_mm=round(width/MM,3)))
def framed_photo(x,y,w,h):
 crop_h=1800;crop_w=crop_h*w/h;cx=2020;cy=0
 crop_x=cx-crop_w/2;assert crop_x>=0 and crop_x+crop_w<=3840
 scale=h*MM/crop_h
 c.saveState();p=c.beginPath();p.rect(x*MM,(240-y-h)*MM,w*MM,h*MM);c.clipPath(p,stroke=0,fill=0)
 c.drawImage(photo_reader,x*MM-crop_x*scale,(240-y)*MM-(2160-cy)*scale,3840*scale,2160*scale)
 c.restoreState()
 metadata['layouts'][current]['photo']={'panel_mm':[x,y,w,h],'source_crop_xyxy':[round(crop_x,3),cy,round(crop_x+crop_w,3),cy+crop_h],'effective_ppi':round(crop_h/(h/25.4),1)}

for variant in ['A','B','C']:
 current=variant;metadata['layouts'][variant]={'name':captions[variant][0],'text':[]}
 c.beginForm(variant,0,0,CW,CH)
 if variant=='A':
  rect(0,0,185,240,PAPER)
  label('The','Nunito800',14,15)
  label('Vegetable','Lilita',64,39)
  label('Guru','Lilita',78,65)
  label('Your at-a-glance growing companion','Nunito600',12.5,76)
  framed_photo(0,84,185,137)
  label('John Lennon','Nunito800',17,233,tracking=.65)
 elif variant=='B':
  rect(0,0,185,240,FOREST)
  label('The','Georgia',18,17,colour=PAPER)
  label('Vegetable','Georgia',52,38,colour=PAPER)
  label('Guru','Georgia',74,64,colour=PAPER)
  label('Your at-a-glance growing companion','Nunito600',12.5,77,colour=PAPER)
  rect(11.5,87.5,162,127,PAPER)
  framed_photo(12,88,161,126)
  label('John Lennon','Nunito800',17,231,colour=PAPER,tracking=.65)
 else:
  rect(0,0,185,240,PAPER)
  framed_photo(11,11,163,146)
  label('The Vegetable','Georgia',34,176,x=11,available=163)
  label('Guru','Georgia',59,199,x=11,available=163)
  label('Your at-a-glance growing companion','Nunito600',12.5,213,x=11,available=163)
  label('John Lennon','Nunito800',17,233,x=11,tracking=.65,available=163)
 c.endForm()

pdfmetrics.registerFont(TTFont('Review','/System/Library/Fonts/Supplemental/Arial.ttf'))
pdfmetrics.registerFont(TTFont('ReviewBold','/System/Library/Fonts/Supplemental/Arial Bold.ttf'))
def para(text,x,top,width,size=11,bold=False,colour=INK):
 p=Paragraph(text,ParagraphStyle('p',fontName='ReviewBold' if bold else 'Review',fontSize=size,leading=size*1.32,textColor=HexColor(colour)))
 _,h=p.wrap(width,1000);p.drawOn(c,x,top-h);return top-h
def review_page(title,sub,number):
 c.setPageSize((842,595));c.setFillColor(HexColor('#e9eddf'));c.rect(0,0,842,595,fill=1,stroke=0)
 para('THE VEGETABLE GURU  /  FRONT-COVER LAYOUT TRIALS',28,575,786,9,True)
 para(title,28,550,786,27,True)
 para(sub,28,510,786,10,False,'#526158')
 para('11 November 2026 | Proposals for review; no final cover or supplier approval',28,22,750,8,False,'#526158')
 para(str(number),798,22,16,8)
def place(variant,x,top,width):
 s=width/CW;c.saveState();c.translate(x,top-CH*s);c.scale(s,s);c.doForm(variant);c.restoreState()

review_page('One photograph, three cover directions','Same T05 frame, title, subtitle and author. Pages 2-4 are individual 185 x 240 mm front panels.',1)
for n,variant in enumerate(['A','B','C']):
 x=28+n*267;place(variant,x,478,250)
 y=para(variant+' - '+captions[variant][0],x,142,250,14,True)
 y=para(captions[variant][1],x,y-7,250,10,True,'#a44007')
 para(captions[variant][2],x,y-7,250,10)
c.showPage()
for variant in ['A','B','C']:
 c.setPageSize((CW,CH));c.bookmarkPage(variant);c.addOutlineEntry(variant+' - '+captions[variant][0],variant,0)
 c.doForm(variant);c.showPage()

review_page('Alongside the approved interior','The same cream, green and growing subject connect these fronts to the illustrated reference pages.',5)
for n,variant in enumerate(['A','B','C']):
 top=478-n*144;place(variant,28,top,92);para(variant,128,top-4,14,10,True)
interior=ROOT/'docs/publication/sowing-rollout/revisions/tomato_greenhouse/spreads/tomato_greenhouse-imperial.jpg'
im=Image.open(interior);width=650;height=width*im.height/im.width
c.drawImage(str(interior),162,478-height,width,height)
para('Approved Greenhouse Tomato working spread, pages 92-93. Reused unchanged for comparison.',162,478-height-11,650,9,False,'#526158')
c.showPage();c.save()
metadata['context_spread']={'path':str(interior.relative_to(ROOT)),'sha256':hashlib.sha256(interior.read_bytes()).hexdigest(),'status':'Approved 10 November; reused unchanged.'}
metadata['font_inputs']={str(p):hashlib.sha256(p.read_bytes()).hexdigest() for p in [ROOT/'public/fonts/richer-a-1.woff2',ROOT/'public/fonts/richer-a-6.woff2',Path('/System/Library/Fonts/Supplemental/Georgia.ttf')]}
(R/'LAYOUTS.json').write_text(json.dumps(metadata,indent=2)+'\n')
print('Created 5-page cover layout review; A/B/C front panels are 185 x 240 mm.')
print({k:v['photo']['effective_ppi'] for k,v in metadata['layouts'].items()})
