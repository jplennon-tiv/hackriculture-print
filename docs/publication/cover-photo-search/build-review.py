from pathlib import Path
from PIL import Image,ImageOps,ImageDraw,ImageFont
import json,hashlib,html
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
R=Path('/Users/johnlennon/Documents/web_site/hackriculture-print/docs/publication/cover-photo-search')
photos={r['id']:r for r in json.loads((R/'PHOTO-SCOUT.json').read_text())};videos={r['id']:r for r in json.loads((R/'VIDEO-PROBE.json').read_text())};node=json.loads((R/'NODE-INVENTORY.json').read_text());new={r['id']:r for r in node['records']}
# Image choices remain editorial proposals. Originals are never overwritten.
choices=[
('L029','Peas, just picked','front trial','A clear foreground harvest, with the living crop behind it. The strongest link between growing and eating.','Mostly green; very close peas are soft. The top is textured, so a separate cream title area would be safer than lettering directly on the foliage.',None),
('L037','Elephant garlic on wood','front trial','Quiet colour, tactile skins and simple arrangement. The most restrained still-life direction.','The nearest bulb is soft and the image can read as a cookery book. A vertical crop must preserve both bulbs; test a framed landscape treatment first.',None),
('L575','Picking salad leaves','front trial','Hands, fresh leaves and the colander make the activity immediately understandable.','Hard sun, pale paving and deep shadow occupy much of the image. Prefer an image panel; a full-height portrait crop would lose useful context.',8.0),
('L573','Showing the salad harvest','author / back trial','An engaging grower-with-harvest scene, with eyes open at this exact frame.','Mid-speech expression, bright sun and greenhouse bars. Stronger for the back or supporting literature than an uncluttered front.',125.0),
('N06727','A tray of red chillies','front reserve','Strong red/green contrast and an abundant, repeatable pattern. Newly found on NODE NAME.','One crop dominates; the baking tray suggests the kitchen. Could work as a tightly framed photographic panel, with quiet typography outside it.',None),
('N07251','Carrot and beetroot in the soil','small panel trial','Two unmistakable vegetables, soil still attached, with growing foliage behind. The most direct new harvest composition.','Only 1600 x 1200 pixels. Good for a smaller panel; unsuitable as a finely detailed full-height cover at this trim without accepting low resolution.',None),
('L033','Tomatoes on the vine','support / reserve','Recognisable fruit and a clear sense of growth; red fruit behind green adds depth.','Foreground fruit is not ripe, and greenhouse structure competes. Focal detail is softer than the pixel count suggests.',None),
('L031','Courgette and flower','support / reserve','A bright yellow focal point against green foliage; clearly a growing plant.','Strong sunshine clips some detail; surrounding stems and damaged leaves are busy. A single crop does not convey the breadth of the book.',None),
('N04068','Spade beside brassicas','support / reserve','An inherently vertical gardening image, with a simple recognisable tool.','Bright sky, hedge and worn leaves compete. Better as a contextual detail than the main promise of a vegetable guide.',None),
('N07297','Stringing onions','historical support','An authentic practical scene with stored produce and a naturally vertical composition.','Older image (file EXIF: 2013), only 1200 x 1600. Useful for personal history or a small supporting portrait, subject to John confirming its use.',None),
('L561','Seated in the greenhouse','author reserve','Calmer posture with crops on either side; a useful contemporary author-image alternative.','Some squinting, hard highlights and a dark tub behind the head. Needs a deliberate crop.',71.098),
('L111','At the plot with a spade','author reserve','A full-length photograph with a relaxed pose; higher-resolution source for a possible author treatment.','Face is shaded and houses dominate the background. A closer crop would be more useful than the entire scene.',None)]
short=[]
for id,title,role,strength,limit,t in choices:
 src=(photos|new|videos)[id];prev=f'candidates/{id}.jpg' if t is None else f'candidates/{id}-{t:08.3f}.jpg'
 rec={'id':id,'title':title,'role_proposed':role,'status':'unapproved source candidate','source_path':src['path'],'source_width':src['width'],'source_height':src['height'],'preview':prev,'strength':strength,'limitation':limit}
 if t is not None:rec.update(seconds=t,extracted_still=f'stills/{id}-{t:08.3f}.png')
 else:
  im=Image.open(src['path']);rec['exif_date']=str(im.getexif().get(306,''));rec['source_sha256']=hashlib.sha256(Path(src['path']).read_bytes()).hexdigest()
 rec['preview_sha256']=hashlib.sha256((R/prev).read_bytes()).hexdigest()
 if 'fingerprint' in src:rec.update(inventory_fingerprint=src['fingerprint'],fingerprint_method=src['fingerprint_method'])
 rec['nominal_full_trim_ppi']=round(min(src['width']/(185/25.4),src['height']/(240/25.4)))
 short.append(rec)
(R/'SHORTLIST.json').write_text(json.dumps({'date':'2026-11-11','note':'Native images/stills; no retouching, generative changes or upscaling. Review JPEGs are reduced copies. Full-trim PPI assumes a fill crop at 185 x 240 mm, excludes bleed, and does not establish optical quality or composition.','candidates':short},indent=2)+'\n');s={r['id']:r for r in short}
pdfmetrics.registerFont(TTFont('Review','/System/Library/Fonts/Supplemental/Arial.ttf'));pdfmetrics.registerFont(TTFont('ReviewBold','/System/Library/Fonts/Supplemental/Arial Bold.ttf'))
W,H=842,595;ink='#173e2c';paper='#fff8e9';muted='#526158';accent='#a44007';c=canvas.Canvas(str(R/'Cover-photo-review.pdf'),pagesize=(W,H));c.setTitle('The Vegetable Guru - photographic source review');c.setAuthor('Cover research for John Lennon')
def para(txt,x,y,w,size=10,bold=False,color=ink):
 st=ParagraphStyle('p',fontName='ReviewBold' if bold else 'Review',fontSize=size,leading=size*1.34,textColor=HexColor(color));p=Paragraph(txt,st);_,h=p.wrap(w,1000);p.drawOn(c,x,y-h);return y-h

def start(n,title,sub):
 c.setFillColor(HexColor(paper));c.rect(0,0,W,H,fill=1,stroke=0);para('THE VEGETABLE GURU  /  PHOTOGRAPHIC SOURCE REVIEW',30,H-22,780,9,True,accent);para(title,30,H-46,780,24,True);para(sub,30,H-82,780,10,False,muted);c.setStrokeColor(HexColor('#d4d6bf'));c.line(30,30,W-30,30);para('11 November 2026 · Research candidates, not approved cover artwork',30,23,700,8,False,muted);para(str(n),W-50,23,20,8,False,muted)

def img(id,x,y,w,h):
 path=R/s[id]['preview'];im=Image.open(path);rw,rh=im.size;scale=min(w/rw,h/rh);dw,dh=rw*scale,rh*scale;c.drawImage(str(path),x+(w-dw)/2,y-h+(h-dh)/2,dw,dh,mask='auto')

def pair(n,title,sub,ids):
 start(n,title,sub)
 for k,id in enumerate(ids):
  r=s[id];x=30+k*400;img(id,x,480,382,253);y=para(id+'  '+r['title'],x,212,382,14,True);y=para(r['strength'],x,y-9,382,10);y=para('<b>Watch:</b> '+r['limitation'],x,y-8,382,10);meta=f"{r['source_width']} × {r['source_height']} px"
  if 'seconds' in r:meta+=f" · clip {int(r['seconds']//60)}:{r['seconds']%60:06.3f}"
  elif r.get('exif_date'):meta+=' · EXIF '+r['exif_date'][:10].replace(':','-')
  y=para(meta,x,y-9,382,9,True,accent);para(html.escape(Path(r['source_path']).name),x,y-4,382,8,False,muted)
 c.showPage()
start(1,'A useful shortlist; no automatic winner','The best archive leads suggest a photograph in a deliberate layout, with room reserved for the title.')
lead=['L029','L037','L575','N07251','N06727','L573']
for i,id in enumerate(lead):
 x=30+(i%3)*265;y=472-(i//3)*192;img(id,x,y,250,153);para(id+'  '+s[id]['title'],x,y-159,250,10,True)
para('My first comparison: peas for a harvest-led front; garlic for a quieter still life; a harvesting scene for a more personal book. The new root-crop photograph is a strong small-panel alternative.',30,78,780,11)
c.showPage()
pair(2,'Two different photographic directions','Both are high-resolution photographs, but neither should be judged by pixel count alone.',['L029','L037'])
pair(3,'The strongest local action sequence','Original 4K frames retained separately; these images have not been retouched.',['L575','L573'])
pair(4,'What the newly connected drive added','The chilli tray has resolution to spare. The root-crop image needs a smaller placement.',['N06727','N07251'])
start(5,'Useful supporting images','These broaden the options for back-cover or supporting literature use; they are not selected replacements.')
for i,id in enumerate(['L033','L031','N04068','N07297']):
 x=30+(i%2)*400;y=480-(i//2)*216;img(id,x,y,185,180);tx=x+197;r=s[id];yy=para(id+'  '+r['title'],tx,y,184,12,True);yy=para(r['strength'],tx,yy-8,184,9);yy=para(r['limitation'],tx,yy-7,184,9);para(f"{r['source_width']} × {r['source_height']} px",tx,yy-7,184,9,True,accent)
c.showPage()
start(6,'Online lead, coverage and next decision','This is a broad first pass with targeted follow-up, not a claim that every minute or photograph has been viewed.')
y=para('Best YouTube lead: picking tomatoes at about 4:44',30,475,490,16,True)
y=para('The passata video shows John kneeling among tomato plants, with a bowl of ripe fruit. It combines a person, a recognisable crop and an actual harvest more successfully than the sampled wide allotment views.',30,y-12,490,11)
y=para('<link href="https://www.youtube.com/watch?v=sIUbl3cKZsQ&amp;t=284s" color="#a44007">Open the tomato-harvesting moment on YouTube</link>',30,y-10,490,11,True)
y=para('This was inspected in browser playback, not downloaded as a print-ready still. Locate the original or obtain the best available export before comparing print detail. The 5:51 kitchen scene is a secondary harvest reference.',30,y-12,490,10)
y=para('What has been covered',30,y-22,490,16,True)
for txt in ['Original two drives: 917 media files inventoried, grouped into 600 sources; 137 images reviewed and 776 frames sampled from 186 clips (15.2 hours of source footage, not 15.2 hours watched).','NODE NAME: 7,432 image files inventoried. 607 spaced samples plus 414 targeted positions; 985 distinct positions, with one unreadable image. This can miss isolated photographs between samples.','YouTube: selected moments in 11 videos reviewed. No matching named local shoot was identified for this targeted online set; unlabelled clips may still overlap. Remaining priorities are recorded in ONLINE-REVIEW.json.']:
 y=para(txt,30,y-10,490,10)
x=555;yy=para('What I would test next',x,475,255,16,True)
for txt in ['Keep the existing title and subtitle while comparing image treatments, so the photograph and typography can be judged fairly.','Use a cream title field with one strong photograph. This respects the interior palette and avoids fighting busy foliage with lettering.','Compare peas, the quiet garlic still life and an active harvesting image at the actual front-panel size. Include the root-crop photo as a smaller panel.','If none feels sufficiently polished, a short planned photo session is more promising than forcing a marginal archive frame.']:
 yy=para(txt,x,yy-13,255,10)
yy=para('Resolution context',x,yy-22,255,13,True)
yy=para('A full 185 × 240 mm panel at 300 ppi needs about 2185 × 2835 px before bleed. A landscape 4K frame cropped to fill that portrait is about 229 ppi; a 1080p frame is about 114 ppi. Smaller photo panels preserve more detail.',x,yy-9,255,10)
para('All paths, dimensions, timestamps and candidate notes: SHORTLIST.json. Search method, limitations and review files: README.md. Approved artwork, copy and the assembled book remain unchanged.',30,65,780,9,False,muted)
c.showPage();c.save()
# Six-image summary, preserving each frame rather than cropping away caveats.
out=Image.new('RGB',(1500,1050),paper);d=ImageDraw.Draw(out);font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',21);bold=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf',30)
d.text((24,20),'The Vegetable Guru · photographic shortlist',font=bold,fill=ink);d.text((24,65),'Source candidates for discussion — no cover image selected',font=font,fill=muted)
for i,id in enumerate(lead):
 im=Image.open(R/s[id]['preview']);im.thumbnail((470,380));x=20+(i%3)*500;y=112+(i//3)*450;out.paste(im,(x+(470-im.width)//2,y+(380-im.height)//2));d.text((x,y+390),id+' · '+s[id]['title'],font=font,fill=ink)
out.save(R/'Photo-shortlist.jpg',quality=93)
# Portable gallery: only shortlisted gardening images, never unrelated archive photographs.
cards=[]
for r in short:
 t=f" · {r['seconds']:.3f}s" if 'seconds' in r else ''
 cards.append(f'<article><a href="{r["preview"]}"><img src="{r["preview"]}" alt="{html.escape(r["title"])}"></a><h2>{r["id"]} — {html.escape(r["title"])}</h2><p>{html.escape(r["strength"])}</p><p><strong>Limitation:</strong> {html.escape(r["limitation"])}</p><p>{r["source_width"]} × {r["source_height"]} px{t}</p><details><summary>Original source</summary><p class="path">{html.escape(r["source_path"])}</p></details></article>')
(R/'REVIEW.html').write_text('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Vegetable Guru photo shortlist</title><style>body{font:17px/1.5 system-ui,sans-serif;background:#fff8e9;color:#173e2c;margin:30px auto;max-width:1300px;padding:0 20px}h1{line-height:1.15}a{color:#a44007}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:30px}article{padding:20px;background:white}img{width:100%;height:280px;object-fit:contain}h2{font-size:21px}.path{overflow-wrap:anywhere;font-size:13px}summary{cursor:pointer}</style><h1>The Vegetable Guru: photographic sources</h1><p>11 November 2026 · Unapproved candidates. Images are unretouched review copies. Click an image to inspect it separately.</p><p><a href="Cover-photo-review.pdf">Read the six-page assessment</a> · <a href="SHORTLIST.json">Exact candidate sources</a> · <a href="https://www.youtube.com/watch?v=sIUbl3cKZsQ&t=284s">Best online lead: picking tomatoes at 4:44</a></p><div class="grid">'+''.join(cards)+'</div></html>')
print('Created PDF, shortlist JPG, gallery and metadata; candidates:',len(short))
