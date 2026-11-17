"""Build the first photo-derived stock catalogue, checks and portable source bundle.
Run with the project's primary Python runtime (Pillow, reportlab, pypdf, numpy).
Never modifies illustration pixels. All asset/source copies remain byte-exact.
"""
from pathlib import Path
import hashlib, io, json, shutil, zipfile
from PIL import Image
import numpy as np
from reportlab.pdfgen import canvas
from reportlab import rl_config
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from pypdf import PdfReader, PdfWriter
from pypdf.generic import NameObject, BooleanObject

rl_config.useA85 = 0

B = Path(__file__).resolve().parent
ROOT = B.parents[3]
CREAM = '#fbf8ed'
GREEN = '#173e2d'
ORANGE = '#b84f20'
W,H = 841.8898,595.2756
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
sources = json.loads((B/'SOURCES.json').read_text())
used = {s['id']:s for s in sources if s.get('status') != 'alternate_not_used'}
generation = json.loads((B/'recipes/all-generations.json').read_text())
results = {r['id'].replace('-v2',''):r for r in generation['results']}
specs = {r['id']:r for r in generation['recipes']}
info = [
 ('01-pepper-harvest','Pepper harvest','Compact harvest group',
  'Six fruits selected from the photograph; varied lobes, colours and angles retained. Background and surplus fruit omitted.',
  'A colourful contents header or end-of-section illustration.'),
 ('02-peas-on-plant','Peas on the plant','Tall plant detail',
  'Three closed pods and their branching plant selected from the central video frame. Netting and supports omitted; foliage simplified.',
  'A narrow title-page or margin illustration.'),
 ('03-onions','Onion harvest','Upright harvest group',
  'Three bulbs selected from the drying harvest. Bulbs, bent tops and roots simplified; the rack and other onions omitted.',
  'A title-page companion or taller section detail.'),
 ('04-cabbage','Cabbage in leaf','Single leafy plant',
  'Folded leaves derived from the original video frame. Bottles, fleece and soil omitted; leaf veins simplified and obscured tips completed.',
  'A compact corner image or leafy section opener.'),
 ('05-potatoes','Freshly dug potatoes','Low harvest group',
  'Six unequal tubers selected and regrouped from the foreground harvest. Soil and fork omitted; small skin marks kept simple.',
  'A low header, footer or small harvest spot.'),
 ('06-carrots-and-beetroot','Carrot and beetroot','Two-vegetable group',
  'The unusual horizontal carrot and beetroot arrangement retained. Soil omitted; cropped foliage completed as a modest connected fringe.',
  'A wide header or end-of-page illustration.'),
 ('07-garlic-pair','Elephant garlic pair','Compact bulb pair',
  'The opened and intact bulbs retain the photo diagonal. Wood omitted; wrappers and roots translated into broad drawing shapes.',
  'A small title-page detail or corner illustration.'),
 ('08-chilli-plant','Chilli plant in a pot','Tall container plant',
  'The taller right-hand plant selected. Fruit, branching and pot simplified; the other plant, labels and greenhouse omitted.',
  'A vertical growing-techniques or container-growing illustration.'),
]
selection = json.loads((B/'SELECTION.json').read_text()) if (B/'SELECTION.json').exists() else None
selection_status = {a['id']:a['status'] for a in selection['items']} if selection else {}
assets=[]
(B/'style-references').mkdir(exist_ok=True)
style_records={}
for spec in generation['recipes']:
 for source in spec['refs'][1:]:
  p=Path(source)
  dst=B/'style-references'/p.name
  if not dst.exists(): shutil.copyfile(p,dst)
  assert sha(dst)==sha(p)
  style_records[p.name]={'original_path':str(p.relative_to(ROOT)),'retained_path':str(dst.relative_to(B)),'sha256':sha(dst)}
for ident,title,kind,changes,slot in info:
 p=B/'assets'/(ident+'.png'); im=Image.open(p).convert('RGBA'); alpha=np.asarray(im.getchannel('A'))
 r=results[ident]; spec=specs[r['id']]
 source=used[ident]; source_path=ROOT/source['retained_path']
 assert sha(source_path)==source['sha256']
 assert sha(p)==sha(r['generated_original'])
 bbox=im.getchannel('A').point(lambda v:255 if v>128 else 0).getbbox()
 edge=int(max(alpha[0,:].max(),alpha[-1,:].max(),alpha[:,0].max(),alpha[:,-1].max()))
 record={'id':ident,'title':title,'kind':kind,'asset_path':'assets/'+p.name,
  'sha256':sha(p),'generated_original':r['generated_original'],'source_id':source['source_id'],
  'source_path':str(source_path.relative_to(B)),'source_sha256':source['sha256'],
  'prompt':spec['prompt'],'direct_style_references':[style_records[Path(v).name] for v in spec['refs'][1:]],
  'dimensions_px':list(im.size),'mode':im.mode,'alpha_range':[int(alpha.min()),int(alpha.max())],
  'edge_alpha_max':edge,'solid_bbox_alpha_gt_128':bbox,'complete_solid_silhouette':bool(bbox and bbox[0]>0 and bbox[1]>0 and bbox[2]<im.width and bbox[3]<im.height),
  'max_canvas_mm_at_300dpi':[round(x/300*25.4,1) for x in im.size],
  'intentional_changes':changes,'proposed_use':slot,'status':selection_status.get(ident,'candidate_for_John_review'),'installed_in_book':False}
 assets.append(record)
manifest={'collection':'Photo-derived book illustrations — first collection','created':'2026-11-16',
 'scope':'Eight independent transparent illustrations. Existing book pages and approved illustrations unchanged.',
 'source_ownership':'Selected from John Lennon’s local photo/video collection; no external online images used.',
 'sampling':'1373 visible Photos records indexed read-only; 364 summer-day samples prepared, contact sheets 1–7 (210 samples) visually reviewed, plus the first 30 indexed garden archive thumbnails and retained source-search stills. Not a complete photo/video review.',
 'style':'Direct approved richer-a hero references; each generation starts from the real photograph, not a successive full-page redraw.',
 'review':'Assistant inspected source photographs, first pair against approved heroes at large/small sizes, and all eight on cream and dark green. This is technical/design review, not John’s approval.',
 'interpretation':'Photo-derived compositions are selected and simplified, not exact botanical tracings. Newly completed hidden/cropped elements are recorded per item.',
 'alpha_note':'PNG alpha is retained verbatim. Some generated files contain negligible alpha=1 values at their outer borders; solid subjects are contained. Cream/dark-green composites were visually inspected.',
 'rejected_attempts':[{'id':'05-potatoes-v1','path':'generated_images/exec-50608d7a-f7b7-447c-b2c6-15207eb04e7a.png','sha256':sha(ROOT/'generated_images/exec-50608d7a-f7b7-447c-b2c6-15207eb04e7a.png'),'reason':'Bud marks resembled literal eyes; replaced from the original photo with simple skin dashes. Not in the usable-asset bundle.'}],
 'assets':assets}
if selection:
 manifest['selection_record']='SELECTION.json'
 manifest['review']='John accepted 01–04, 07 and 08; 05/06 set aside as too arranged. Page placement remains pending. See SELECTION.json.'
 for asset in assets: asset['selection_record']='SELECTION.json'
(B/'ARTWORK.json').write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+'\n')

style=ParagraphStyle('body',fontName='Helvetica',fontSize=10,leading=14,textColor=HexColor(GREEN))
small=ParagraphStyle('small',parent=style,fontSize=8.7,leading=12)
def para(c,text,x,top,width,sty=style):
 p=Paragraph(text,sty);pw,ph=p.wrap(width,1000);p.drawOn(c,x,top-ph);return ph
def fit(c,path,x,y,w,h):
 im=Image.open(path)
 # Photo thumbnails in the review PDF only; original sources remain untouched.
 source_preview = Path(path).parent.name == 'sources'
 if source_preview: im.thumbnail((1600,1200))
 scale=min(w/im.width,h/im.height)
 iw,ih=im.width*scale,im.height*scale
 if source_preview:
  preview = io.BytesIO(); im.convert('RGB').save(preview,format='JPEG',quality=88); preview.seek(0)
  reader = ImageReader(preview)
 else: reader = ImageReader(im)
 c.drawImage(reader,x+(w-iw)/2,y+(h-ih)/2,width=iw,height=ih,mask='auto')
def base(c,title,subtitle,page):
 c.setFillColor(HexColor(CREAM));c.rect(0,0,W,H,fill=1,stroke=0)
 c.setFillColor(HexColor(GREEN));c.setFont('Helvetica-Bold',24);c.drawString(34,H-42,title)
 c.setFont('Helvetica',10);c.drawString(35,H-61,subtitle)
 c.setStrokeColor(HexColor('#cbd4bd'));c.line(34,29,W-34,29)
 c.setFont('Helvetica',8);c.drawString(34,16,'THE VEGETABLE GURU  •  PHOTO-DERIVED ARTWORK  •  FIRST COLLECTION')
 c.drawRightString(W-34,16,str(page))
pdf=B/'Photo-Derived-Illustrations-01.pdf'
raw=B/'review/catalogue-raw.pdf'
c=canvas.Canvas(str(raw),pagesize=(W,H),pageCompression=1)
c.setTitle('The Vegetable Guru — Photo-derived illustrations, collection 01')
c.setAuthor('John Lennon')
base(c,'From your garden to the book','Eight separate illustrations based on your photographs and video stills · 16 November 2026',1)
cw=(W-68)/4;rh=235
for i,a in enumerate(assets):
 x=34+(i%4)*cw;y=H-80-(i//4+1)*rh
 fit(c,B/a['asset_path'],x+8,y+36,cw-16,rh-48)
 c.setFillColor(HexColor(GREEN));c.setFont('Helvetica-Bold',10);c.drawString(x+10,y+20,f"{i+1:02d}  {a['title']}")
 c.setFont('Helvetica',8);c.drawString(x+10,y+7,a['kind'])
c.showPage()
for page,start in enumerate(range(0,8,2),2):
 base(c,'The photograph and the drawing','Original source on the left · transparent illustration in the centre · possible uses on the right',page)
 for row,a in enumerate(assets[start:start+2]):
  top=H-94-row*235
  c.setFillColor(HexColor(GREEN));c.setFont('Helvetica-Bold',15);c.drawString(34,top,a['title'])
  fit(c,B/a['source_path'],34,top-184,240,169)
  fit(c,B/a['asset_path'],290,top-193,280,181)
  y=top-17
  y-=para(c,a['intentional_changes'],594,y,210,small)+12
  y-=para(c,'<b>Possible use</b><br/>'+a['proposed_use'],594,y,210,small)+12
  ww,hh=a['max_canvas_mm_at_300dpi']
  para(c,f"<b>Native file</b><br/>{a['dimensions_px'][0]} × {a['dimensions_px'][1]} px<br/>Up to {ww:g} × {hh:g} mm at 300 dpi (full canvas).",594,y,210,small)
  s=used[a['id']]
  note=s.get('captured','')[:10] if s.get('captured') else ('Video at '+str(s['timestamp_seconds'])+' s' if 'timestamp_seconds' in s else 'Original photograph')
  c.setFillColor(HexColor('#5a6658'));c.setFont('Helvetica',8);c.drawString(34,top-199,s['source_id']+'  •  '+note)
 c.showPage()
base(c,'Keeping the book’s drawing style','Approved hero references alongside the first photo-derived samples',6)
comparisons=[('Approved pea hero',ROOT/'public/images/heroes/richer-a/pea.png'),('New pea drawing',B/'assets/02-peas-on-plant.png'),('Approved beetroot hero',ROOT/'public/images/heroes/richer-a/beetroot.png'),('New pepper harvest',B/'assets/01-pepper-harvest.png')]
for i,(label,p) in enumerate(comparisons):
 x=34+i*cw;fit(c,p,x+10,225,cw-20,270);c.setFont('Helvetica-Bold',10);c.setFillColor(HexColor(GREEN));c.drawCentredString(x+cw/2,210,label)
para(c,'<b>Shared treatment</b><br/>Broad colour and shadow shapes, simplified foliage and clear pale highlights. Natural variation comes from your photographs; the drawing treatment comes from the approved book illustrations.',34,180,365)
para(c,'<b>Using the files</b><br/>The eight PNGs have transparent backgrounds and are ready to place. Keep their aspect ratios and allow space around the leaves and roots. Use the native sizes listed beside each drawing; do not enlarge small details unnecessarily.',440,180,365)
para(c,('<b>Selection saved</b><br/>01–04, 07 and 08 accepted; 05/06 set aside. Page placements pending. See SELECTION.json.' if selection else '<b>For review</b><br/>These are new artwork candidates. Page positions are suggestions, and no existing book page has been replaced.'),34,91,365,small)
para(c,'<b>Recreation material</b><br/>The download includes the selected original photos/stills, exact style references, full prompts, checksums and this catalogue.',440,91,365,small)
c.showPage();c.save()
print('PDF pages drawn; verifying embedded artwork pixels.',flush=True)
r=PdfReader(str(raw));w=PdfWriter()
image_hashes=set();image_filters=set();count=0
for pg in r.pages:
 for ref in pg['/Resources'].get('/XObject',{}).values():
  ob=ref.get_object()
  if ob.get('/Subtype')=='/Image':
   ob[NameObject('/Interpolate')]=BooleanObject(True)
   if ob.get('/SMask'):ob['/SMask'].get_object()[NameObject('/Interpolate')]=BooleanObject(True)
   image_hashes.add(hashlib.sha256(ob.get_data()).hexdigest());image_filters.add(str(ob.get('/Filter')));count+=1
 w.add_page(pg)
w.add_metadata({'/Title':'The Vegetable Guru — Photo-derived illustrations 01','/Author':'John Lennon','/Subject':'Source photographs and proposed book artwork'})
with pdf.open('wb') as f:w.write(f)
pixel_checks={}
for a in assets:
 im=Image.open(B/a['asset_path']).convert('RGBA')
 rgbhash=hashlib.sha256(im.convert('RGB').tobytes()).hexdigest()
 pixel_checks[a['id']]=rgbhash in image_hashes
assert all(pixel_checks.values()),pixel_checks
checks={'date':'2026-11-16','pdf_pages':len(r.pages),'all_asset_rgb_pixels_embedded_exactly':pixel_checks,
 'asset_sha256_matches_generated_original':True,'source_sha256_matches_retained_copy':True,
 'all_solid_silhouettes_contained':all(a['complete_solid_silhouette'] for a in assets),
 'all_pngs_transparent_rgba':all(a['mode']=='RGBA' and a['alpha_range'][0]==0 for a in assets),
 'pdf_interpolation_enabled':True,'pdf_sha256':sha(pdf),'image_filters':sorted(image_filters),'visual_pdf_review':'pending'}
(B/'CHECKS.json').write_text(json.dumps(checks,indent=2)+'\n')
raw.unlink()
print(json.dumps({'pdf':str(pdf),'bytes':pdf.stat().st_size,'pages':len(r.pages),'pixel_checks':pixel_checks},indent=2))

