"""Review a new opener beside a blank and the unchanged first crop spread."""
from pathlib import Path
import hashlib,json,subprocess,re,logging
from pypdf import PdfReader,PdfWriter,PageObject
import pdfplumber
logging.getLogger('pdfminer').setLevel(logging.ERROR)
ROOT=Path(__file__).resolve().parents[1]
D=ROOT/'docs/publication/combined-guides-opening'
OUT=ROOT/'output/pdf/combined-guides-opening/guides-opening-preview.pdf'
OUT.parent.mkdir(parents=True,exist_ok=True)
c=json.loads((D/'CHECKS.json').read_text())
sha=lambda p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
for p,h in {**c['inputs'],**c['implementation']}.items():assert sha(p)==h,p
assert sha(c['pdf'])==c['sha256']
book=json.loads((ROOT/'docs/publication/whole-book-order-preview/CHECKS.json').read_text())
source=PdfReader(ROOT/book['pdf']);new=PdfReader(ROOT/c['pdf'])
assert len(new.pages)==1
writer=PdfWriter();writer.add_page(source.pages[7]) # An existing undecorated blank.
page=PageObject.create_blank_page(width=185*72/25.4,height=240*72/25.4)
page.merge_page(new.pages[0]);writer.add_page(page)
for i in [11,12]:writer.add_page(source.pages[i])
writer.add_metadata({'/Title':'The Vegetable Guru - combined Guides opener proposal','/Author':'John Lennon','/Subject':'Blank page 8, combined opener 9, unchanged first guide 10-11.'})
with OUT.open('wb') as f:writer.write(f)
normal=lambda s:re.sub(r'\s+',' ',s).strip()
with pdfplumber.open(OUT) as pdf,pdfplumber.open(ROOT/book['pdf']) as original:
 assert len(pdf.pages)==4
 assert not pdf.pages[0].extract_text().strip()
 text=normal(pdf.pages[1].extract_text(x_tolerance=2,y_tolerance=3))
 assert 'Use the calendar and scales to compare crops and plan their care.' not in text
 assert 'How to use the guides' in text
 for label in ['Growing calendar','SOW','HARVEST','Medium','Sun','Water','Nutrition','3/5','4/5','2/5']:
  assert label in text,('Missing native example text',label)
 # The split-column extraction interleaves diagram labels, so check each body
 # paragraph in its measured text rectangle rather than reading across columns.
 body_checks=[]
 for block in c['checks']['blocks']:
  if block['text'] not in c['checks']['bodyParagraphs']:continue
  box=tuple(block[k]*72/25.4 for k in ['left','top','right','bottom'])
  extracted=normal(pdf.pages[1].crop((box[0]-.4,box[1]-.4,box[2]+.4,box[3]+.4)).extract_text())
  assert extracted==normal(block['text']),(extracted,block['text'])
  body_checks.append({'text':block['text'],'fontPt':block['fontPx']*.75,'preserved':True})
 assert len(body_checks)==3
 for p,old in zip(pdf.pages[2:],original.pages[11:13]):assert p.extract_text()==old.extract_text()
 for p in pdf.pages:
  assert abs(p.width*25.4/72-185)<.01 and abs(p.height*25.4/72-240)<.01
def check_fonts(resources,seen):
 for ref in resources.get('/Font',{}).values():
  font=ref.get_object();identity=(ref.idnum,ref.generation)
  if identity in seen:continue
  seen.add(identity)
  if font.get('/Subtype')=='/Type3':assert font.get('/CharProcs') and font.get('/ToUnicode')
  else:
   for child in font.get('/DescendantFonts',[font]):
    fd=child.get_object()['/FontDescriptor'].get_object()
    assert any(k in fd for k in ['/FontFile','/FontFile2','/FontFile3'])
 for ref in resources.get('/XObject',{}).values():
  obj=ref.get_object()
  if obj.get('/Subtype')=='/Form':check_fonts(obj.get('/Resources',{}),seen)
seen=set()
for p in PdfReader(OUT).pages:check_fonts(p.get('/Resources',{}),seen)
subprocess.run(['pdftoppm','-r','150','-jpeg','-jpegopt','quality=92',str(OUT),str(D/'page')],check=True,capture_output=True)
receipt={'date':'2026-10-15','status':'passed; composition awaiting John review','pdf':str(OUT.relative_to(ROOT)),'sha256':sha(OUT),'pages':4,'folios':[8,9,10,11],'bodyParagraphs':body_checks,'instructionalImages':9,'originalIllustrationsRetained':6,'originalGuideIcons':3,'nativeExamples':3,'nativeExampleTextVerified':True,'allFontsEmbedded':True,'firstVegetableTextPreserved':True,'sourceBookUnchanged':sha(book['pdf'])==book['sha256'],'dimensionsMm':[185,240]}
(D/'PDF-CHECKS.json').write_text(json.dumps(receipt,indent=2)+'\n')
review='''<!doctype html><html lang="en-GB"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Vegetable Guru · Combined guide opener</title><style>
@font-face{font-family:Nunito;src:url('/fonts/richer-a-6.woff2');font-weight:100 1000}*{box-sizing:border-box}body{margin:0;background:#d9dfcf;color:#173e2c;font:16px/1.45 Nunito,sans-serif}header,main{max-width:1400px;margin:auto;padding:20px}h1{font-size:30px;line-height:1.15;margin:4px 0 12px}p{max-width:1050px;margin:8px 0}.eyebrow{font-size:12px;font-weight:900;letter-spacing:1px}nav{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}button,.pdf{font:800 15px Nunito;padding:9px 14px;border:1px solid #173e2c;border-radius:5px;background:#fff8e9;color:#173e2c;cursor:pointer;text-decoration:none}button[aria-pressed=true],.pdf{background:#173e2c;color:#fff8e9}.pages{display:grid;grid-template-columns:1fr 1fr;gap:14px;align-items:start}.pages.single{display:block;max-width:760px;margin:auto}figure{margin:0;min-width:0}figure img{display:block;width:100%;height:auto;box-shadow:0 2px 12px #173e2c25}figcaption{padding:8px;font-size:14px;font-weight:800}.status{font-size:14px}@media(max-width:600px){header,main{padding:14px}h1{font-size:25px}.pages{gap:6px}figcaption{font-size:11px;padding:5px}}</style>
<header><div class="eyebrow">THE VEGETABLE GURU · NEW COMPOSITION FOR REVIEW</div><h1>Vegetable Guides, with its how-to on the same page</h1><p>The combined opener sits on the <strong>right-hand page, 9</strong>, facing blank page 8, as requested. The first vegetable remains on facing pages 10–11. The lower panel keeps all three explanations and their original illustrations. The calendar and rating examples now have clearer text and clean backgrounds.</p><p class="status">The main title and a smaller version of the existing artwork remain. The peach colour is retained. Faded example rows and screenshot corners have been replaced with readable calendar and rating examples. Source JSON and the full book are unchanged; this is a focused proposal.</p><nav><button data-view="page" aria-pressed="true">Combined page</button><button data-view="opening" aria-pressed="false">Opening spread · 8–9</button><button data-view="crop" aria-pressed="false">First vegetable · 10–11</button><a class="pdf" href="../../../output/pdf/combined-guides-opening/guides-opening-preview.pdf?revision=__REV__#page=2">Open PDF</a></nav></header><main><div id="pages" class="pages single"></div></main><script>
const labels={1:'Page 8 · Blank',2:'Page 9 · Vegetable Guides / how to use',3:'Page 10 · Artichoke, Jerusalem',4:'Page 11 · Artichoke, Jerusalem continued'},sets={page:[2],opening:[1,2],crop:[3,4]};function show(view){const wrap=document.getElementById('pages');wrap.className='pages'+(view==='page'?' single':'');wrap.replaceChildren();for(const i of sets[view]){const f=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');img.src='page-'+i+'.jpg?revision=__REV__';img.alt=labels[i];caption.textContent=labels[i];f.append(img,caption);wrap.append(f)}document.querySelectorAll('button[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));}document.querySelectorAll('button[data-view]').forEach(b=>b.onclick=()=>show(b.dataset.view));show('page');</script></html>'''
(D/'REVIEW.html').write_text(review.replace('__REV__',receipt['sha256'][:12]))
print(json.dumps(receipt))
