"""Render a title-only comparison from actual local fonts; no cover artwork edits."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import hashlib,json

ROOT=Path(__file__).resolve().parents[4]
OUT=Path(__file__).resolve().parent
W,H=2480,3508
INK='#173e2c'; PAPER='#fff8e9'; MUTED='#607064'; RULE='#d4d6bf'
TITLE='The Vegetable Guru'
specs=[
 ('A','Charter Bold','/System/Library/Fonts/Supplemental/Charter.ttc',3,None,'Sturdy serif'),
 ('B','Baskerville SemiBold','/System/Library/Fonts/Supplemental/Baskerville.ttc',4,None,'Finer serif'),
 ('C','Georgia Bold','/System/Library/Fonts/Supplemental/Georgia Bold.ttf',0,None,'Broad serif'),
 ('D','Optima Bold','/System/Library/Fonts/Optima.ttc',1,None,'Flared sans serif'),
 ('E','Avenir Next Demi Bold','/System/Library/Fonts/Avenir Next.ttc',2,None,'Clean sans serif'),
 ('F','Helvetica Neue Medium','/System/Library/Fonts/HelveticaNeue.ttc',10,None,'Neutral sans serif'),
 ('G','Nunito Sans ExtraBold',str(ROOT/'public/fonts/richer-a-6.woff2'),0,800,'Interior supporting family'),
 ('H','Lilita One',str(ROOT/'public/fonts/richer-a-1.woff2'),0,None,'Interior heading family'),
]
def font(path,size,index=0,weight=None):
 f=ImageFont.truetype(path,size,index=index)
 if weight is not None:f.set_variation_by_axes([weight])
 return f
ui='/System/Library/Fonts/Supplemental/Arial.ttf'
uib='/System/Library/Fonts/Supplemental/Arial Bold.ttf'
im=Image.new('RGB',(W,H),PAPER);d=ImageDraw.Draw(im)
d.text((170,100),'TITLE LETTERING',font=font(uib,43),fill=MUTED)
d.text((170,171),'Eight fonts, the same title',font=font(uib,70),fill=INK)
d.text((170,265),'Actual font files. Comparable capital heights. No horizontal stretching.',font=font(ui,37),fill=MUTED)
records=[]
for n,(ident,label,path,index,weight,note) in enumerate(specs):
 top=390+n*357
 d.text((170,top),ident+'  /  '+label,font=font(uib,42),fill=INK)
 note_font=font(ui,34)
 d.text((W-170-d.textlength(note,font=note_font),top+5),note,font=note_font,fill=MUTED)
 probe=font(path,128,index,weight); box=probe.getbbox('H')
 px=round(128*89/(box[3]-box[1]))
 f=font(path,px,index,weight)
 b=d.textbbox((0,0),TITLE,font=f)
 x=170-b[0]; y=top+86-b[1]
 assert b[2]-b[0] <= W-340,(label,b)
 assert b[3]-b[1]<180,(label,b)
 d.text((x,y),TITLE,font=f,fill=INK)
 d.line((170,top+285,W-170,top+285),fill=RULE,width=2)
 records.append({'id':ident,'label':label,'font_file':path,'face_index':index,'weight_axis':weight,'reported_font_name':f.getname(),'render_size_px':px,'capital_height_px':f.getbbox('H')[3]-f.getbbox('H')[1],'title_bbox_px':[x+b[0],y+b[1],x+b[2],y+b[3]],'font_sha256':hashlib.sha256(Path(path).read_bytes()).hexdigest()})
d.text((170,3335),'The lighter-sage cover colour remains selected. Each future cover uses one typeface throughout.',font=font(ui,32),fill=MUTED)
out=OUT/'Title-font-comparison.png'
im.save(out,dpi=(300,300))
manifest={'date':'2026-11-11','status':'Title-only font proposals; no font selected','feedback':'John prefers 07B to 07A but finds it reminiscent of the 1970s. He requests more variations and permits a written title list rather than full covers.','title':TITLE,'output':str(out.relative_to(ROOT)),'size_px':list(im.size),'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'method':'Pillow/FreeType actual local fonts, comparable H-capital heights; regular shaping, no width distortion or synthetic font recreation. Raster specimen at 300 dpi.','cover_controls':'06B lighter sage remains fixed. One typeface throughout each future cover. Existing artwork untouched.','variants':records}
(OUT/'FONTS.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'output':str(out),'size_px':im.size,'fonts':[{'id':r['id'],'label':r['label'],'cap_height_px':r['capital_height_px']} for r in records]}))

