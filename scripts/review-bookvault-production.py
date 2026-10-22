"""Render actual production PDFs, compare geometry-sensitive ink masks and build review."""
from pathlib import Path
import concurrent.futures,subprocess,json,math,html,hashlib,argparse
import numpy as np
from PIL import Image,ImageDraw,ImageFilter
ROOT=Path(__file__).resolve().parents[1];DOC=ROOT/'docs/publication/bookvault-print-ready';TMP=ROOT/'tmp/pdfs/bookvault-print-ready';OUT=ROOT/'output/pdf/bookvault-print-ready';BIN='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'
(DOC/'pages').mkdir(exist_ok=True);(TMP/'reference').mkdir(exist_ok=True)
source=TMP/'interior-rgb.pdf';final=OUT/'the-vegetable-guru-interior.pdf'
def render(item):
 file,prefix,first,last=item
 subprocess.run([BIN,'-f',str(first),'-l',str(last),'-r','120','-jpeg','-jpegopt','quality=93',str(file),str(prefix)],check=True,stderr=subprocess.DEVNULL)
 return str(prefix),first,last
parser=argparse.ArgumentParser();parser.add_argument('--folios',default='all');args=parser.parse_args()
spans=[(f,f+41) for f in range(1,169,42)] if args.folios=='all' else [(int(f),int(f)) for f in args.folios.split(',')]
jobs=[]
for first,last in spans:
 jobs.extend([(final,DOC/'pages/page',first,last),(source,TMP/'reference/page',first,last)])
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
 for done in pool.map(render,jobs):print('Rendered',done,flush=True)
comparisons=[]
for i in range(1,169):
 a=Image.open(TMP/f'reference/page-{i:03}.jpg').convert('RGB');b=Image.open(DOC/f'pages/page-{i:03}.jpg').convert('RGB');assert a.size==b.size
 x=np.asarray(a);y=np.asarray(b)
 # Compare dark marks with a one-pixel tolerance for colour conversion and raster
 # antialiasing. This flags layout changes; it is not a colour-accuracy measure.
 ma=(x.max(axis=2)<120);mb=(y.max(axis=2)<120)
 da=np.asarray(Image.fromarray(ma.astype('uint8')*255).filter(ImageFilter.MaxFilter(3)))>0
 db=np.asarray(Image.fromarray(mb.astype('uint8')*255).filter(ImageFilter.MaxFilter(3)))>0
 extra=mb & ~da;lost=ma & ~db
 comparisons.append({'folio':i,'newDarkInkFraction':float(extra.mean()),'lostDarkInkFraction':float(lost.mean()),'meanRGBDifference':float(np.abs(x.astype('int16')-y.astype('int16')).mean())})
 if (extra|lost).mean()>.001:
  diff=np.asarray(b).copy();diff[extra]=[255,0,0];diff[lost]=[0,50,255];Image.fromarray(diff).save(TMP/f'compare-{i:03}.png')
 a.close();b.close()
(DOC/'RASTER-COMPARISON.json').write_text(json.dumps({'sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'pdfSha256':hashlib.sha256(final.read_bytes()).hexdigest(),'method':'120 dpi before/after actual PDF rasters; dark-ink comparison with one-pixel tolerance. Colour difference is expected after FOGRA39 conversion; flagged pages require visual review.','pages':comparisons},indent=2)+'\n')
print('Largest dark-ink changes:',sorted(comparisons,key=lambda x:x['newDarkInkFraction']+x['lostDarkInkFraction'],reverse=True)[:12],flush=True)
# Trim-sized reader crops. Production PDF still contains bleed on every page.
for i in range(1,169):
 im=Image.open(DOC/f'pages/page-{i:03}.jpg');b=3/191*im.width
 im.crop((round(b),round(b),round(im.width-b),round(im.height-b))).save(DOC/f'pages/trim-{i:03}.jpg',quality=90)
for start in range(1,169,16):
 canvas=Image.new('RGB',(1200,4*415),'#d9dfcf');draw=ImageDraw.Draw(canvas)
 for j,f in enumerate(range(start,min(start+16,169))):
  im=Image.open(DOC/f'pages/trim-{f:03}.jpg');im.thumbnail((288,380));x=(j%4)*300+6;y=(j//4)*415+25;canvas.paste(im,(x,y));draw.text((x,y-19),str(f),fill='#173e2c')
 canvas.save(DOC/f'contact-{start:03}.jpg',quality=88)
cover=Image.open(DOC/'cover-wrap.png');w,h=cover.size
for name,l,r in [('front',200,385),('back',3,188)]:cover.crop((round(w*l/388),round(h*3/246),round(w*r/388),round(h*243/246))).save(DOC/f'cover-{name}.jpg',quality=95)
# Four source/adaptation panels give honest visual context.
paths=[ROOT/'docs/publication/vegetable-guru-grid-variations/assets/G2-centre-title.png',DOC/'cover-front.jpg',ROOT/'docs/publication/whole-book-order-preview/pages/page-172.jpg',DOC/'cover-back.jpg']
comparison=Image.new('RGB',(1600,570),'#d9dfcf');draw=ImageDraw.Draw(comparison)
for i,(p,label) in enumerate(zip(paths,['Selected G2 front','Production front proposal','B5 with approved copy','Production back proposal'])):
 im=Image.open(p).convert('RGB');im.thumbnail((390,520));comparison.paste(im,(i*400+(400-im.width)//2,35));draw.text((i*400+10,10),label,fill='#173e2c')
comparison.save(DOC/'cover-comparison.jpg',quality=94)
page_map=json.loads((ROOT/'docs/publication/whole-book-order-preview/PAGE-MAP.json').read_text())[2:-2]
assert len(page_map)==168
rows=json.dumps([{'folio':i+1,'label':p['label']} for i,p in enumerate(page_map)])
template=r'''<!doctype html><html lang="en-GB"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Vegetable Guru · Bookvault print review</title><style>
@font-face{font-family:Nunito;src:url('/fonts/richer-a-6.woff2');font-weight:100 1000}*{box-sizing:border-box}body{margin:0;background:#e8ecdf;color:#173e2c;font:17px/1.5 Nunito,sans-serif}header,main,footer{max-width:1400px;margin:auto;padding:30px}h1{font-size:44px;line-height:1.1;margin:10px 0 20px}h2{font-size:28px}p{max-width:1000px}button,a.button,select,input{font:inherit;color:inherit;background:#fff9e9;border:1px solid #8ca17d;border-radius:7px;padding:10px 15px}a{color:#15523b}a.button{display:inline-block;text-decoration:none}.controls{display:flex;gap:10px;align-items:center;flex-wrap:wrap;position:sticky;top:0;padding:15px;background:#e8ecdf;z-index:2}.wrap{width:100%;height:auto;display:block;box-shadow:0 5px 20px #173e2c22}.note{padding:18px 24px;background:#fff9e9;border-left:5px solid #ed8a35}.spread{display:grid;grid-template-columns:1fr 1fr;gap:7px;align-items:start}.spread figure{margin:0}.spread img{width:100%;box-shadow:0 2px 8px #173e2c22}.spread figcaption{font-size:14px;padding:6px}details{margin:25px 0}.small{font-size:14px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.grid img{width:100%}input{width:85px}@media(max-width:650px){header,main,footer{padding:18px}h1{font-size:33px}.controls{position:static;padding:10px 0}.spread figcaption{font-size:11px}.grid{grid-template-columns:repeat(2,1fr)}}
</style><header><div>THE VEGETABLE GURU · PRINT REVIEW · 19 OCTOBER 2026</div><h1>First proof ordered</h1><p>168 interior pages at 185 × 240 mm, prepared for Bookvault’s 150 gsm coated paper and perfect binding. Separate interior and cover files include 3 mm bleed; the cover has a 12 mm spine.</p><p><a class="button" href="/output/pdf/bookvault-print-ready/the-vegetable-guru-interior.pdf" target="_blank">Open interior PDF</a> <a class="button" href="/output/pdf/bookvault-print-ready/the-vegetable-guru-cover.pdf" target="_blank">Open cover PDF</a> <a class="button" href="#interior">Review the interior</a></p><div class="note"><strong>Ordered files — awaiting the printed copy.</strong> The interior keeps the current copy, page order and text sizes. All five intentional blank pages now share the warm cream background. John Lennon appears on the front cover and spine. The production cover follows G2/B5 but uses native lettering, original vegetable artwork and real book fragments. Those adaptations need your review. Publication metadata and the barcode panel remain placeholders; £17.50 is still a working cover price. Both files have passed Bookvault’s checks and the supplier proof is approved for the first physical copy. John has ordered the first copy and reported payment: Bookvault order BV3012332, £12.58 including Royal Mail First Class. The order status was Created when checked on 19 October.</div></header><main><h2>The complete cover wrap</h2><p class="small">Back · spine · front. This image includes the outer bleed; the PDF contains the exact trim boxes. Screen colour is an indication—the physical proof will settle colour and paper appearance.</p><a href="cover-wrap.png" target="_blank"><img class="wrap" src="cover-wrap.png?revision=author-cream-2026-10-19" alt="Production cover wrap, back spine and front"></a><details><summary>Compare the cover with the selected concepts</summary><p>Native lettering changes the title shapes; the reused high-resolution illustrations change the vegetable crops, including the onion. Generated sample-page lettering is replaced with actual book content. The selected originals remain intact.</p><a href="cover-comparison.jpg" target="_blank"><img class="wrap" src="cover-comparison.jpg?revision=author-cream-2026-10-19" alt="Selected cover concepts alongside production adaptations"></a></details><h2 id="interior">The complete interior</h2><p class="small">These images were rendered from the production PDF and cropped to the finished page size for reading. Use the arrow keys to turn pages, or enter a page number.</p><div class="controls"><button id="prev">← Previous</button><button id="next">Next →</button><span id="position"></span><form id="go"><label>Page <input id="folio" type="number" min="1" max="168" value="1"></label><button>Go</button></form><select id="jump" aria-label="Jump to section"><option value="1">Opening pages</option><option value="4">Contents</option><option value="10">Vegetable guides</option><option value="100">Vegetable Troubles</option><option value="145">Growing Techniques</option><option value="164">Index</option></select></div><div id="spread" class="spread"></div><details id="overview"><summary>See all pages</summary><div class="grid" id="grid"></div></details></main><footer><a href="README.md">Production notes and checks</a> · <a href="../whole-book-order-preview/REVIEW.html">Previous reading preview</a></footer><script>
const pages=__PAGES__;let current=1;function show(n){current=Math.max(1,Math.min(168,n));const fs=current===1?[null,1]:[current-current%2,current-current%2+1];const el=document.getElementById('spread');el.replaceChildren();for(const f of fs){const fig=document.createElement('figure');if(f&&f<=168){const a=document.createElement('a');a.href='/output/pdf/bookvault-print-ready/the-vegetable-guru-interior.pdf#page='+f;a.target='_blank';const img=document.createElement('img');img.src='pages/trim-'+String(f).padStart(3,'0')+'.jpg?revision=author-cream-2026-10-19';img.alt='Page '+f+' · '+pages[f-1].label;a.append(img);const cap=document.createElement('figcaption');cap.textContent=img.alt;fig.append(a,cap)}el.append(fig)}document.getElementById('position').textContent=current===1?'Page 1':'Pages '+fs.filter(x=>x&&x<=168).join('–');document.getElementById('prev').disabled=current===1;document.getElementById('next').disabled=current===168;history.replaceState(null,'','#page='+current)}document.getElementById('prev').onclick=()=>show(current<=2?1:current-current%2-2);document.getElementById('next').onclick=()=>show(current===1?2:current-current%2+2);document.getElementById('go').onsubmit=e=>{e.preventDefault();show(Number(document.getElementById('folio').value))};document.getElementById('jump').onchange=e=>show(Number(e.target.value));document.addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName))return;if(e.key==='ArrowRight')document.getElementById('next').click();if(e.key==='ArrowLeft')document.getElementById('prev').click()});document.getElementById('overview').addEventListener('toggle',e=>{const g=document.getElementById('grid');if(!e.target.open||g.children.length)return;pages.forEach(p=>{const b=document.createElement('button'),im=document.createElement('img');im.loading='lazy';im.src='pages/trim-'+String(p.folio).padStart(3,'0')+'.jpg?revision=author-cream-2026-10-19';im.alt=p.label;b.append(im,document.createTextNode(p.folio+' · '+p.label));b.onclick=()=>{show(p.folio);document.getElementById('interior').scrollIntoView()};g.append(b)})});const match=location.hash.match(/page=(\d+)/);show(match?Number(match[1]):1);
</script></html>'''
(DOC/'REVIEW.html').write_text(template.replace('__PAGES__',rows));print(DOC/'REVIEW.html',flush=True)
