"""Graft proposed native headers onto saved book pages; preserve every body block."""
from pathlib import Path
import json,hashlib,logging,subprocess,copy,html
from collections import Counter
from pypdf import PdfReader,PdfWriter,PageObject
from pypdf.generic import ContentStream,RectangleObject
import pdfplumber
logging.getLogger('pdfminer').setLevel(logging.ERROR)
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'docs/publication/vegetable-header-review';TMP=ROOT/'tmp/pdfs/vegetable-header-review';OUT=ROOT/'output/pdf/vegetable-header-review/header-mockups.pdf'
check=json.loads((D/'CHECKS.json').read_text());rows=[r for r in check['results'] if r['unit']=='imperial']
sha=lambda p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
for p,h in check['inputs'].items():assert sha(p)==h,p
MM=72/25.4;W=185*MM;H=240*MM;CUT=33.5*MM
source=PdfReader(ROOT/check['fullBook']['path']);writer=PdfWriter();baseline=PdfWriter()
def mult(a,b):return [a[0]*b[0]+a[1]*b[2],a[0]*b[1]+a[1]*b[3],a[2]*b[0]+a[3]*b[2],a[2]*b[1]+a[3]*b[3],a[4]*b[0]+a[5]*b[2]+b[4],a[4]*b[1]+a[5]*b[3]+b[5]]
def remove_header_text(obj,pdf,cm=None):
 cm=list(cm or [1,0,0,1,0,0]);stack=[];tm=[1,0,0,1,0,0];stream=obj.get_contents() if isinstance(obj,PageObject) else ContentStream(obj,pdf)
 output=[];block=None;ys=[];removed=0;res=obj.get('/Resources',{})
 for args,op in stream.operations:
  if op==b'BT':block=[];ys=[];tm=[1,0,0,1,0,0]
  (block if block is not None else output).append((args,op))
  if op==b'q':stack.append(cm[:])
  elif op==b'Q':cm=stack.pop()
  elif op==b'cm':cm=mult(list(map(float,args)),cm)
  elif op==b'Tm':tm=list(map(float,args))
  elif op in [b'Td',b'TD']:tm=mult([1,0,0,1,float(args[0]),float(args[1])],tm)
  elif op in [b'Tj',b'TJ']:ys.append(mult(tm,cm)[5])
  elif op==b'ET':
   if ys and min(ys)>H-CUT:removed+=1
   else:output.extend(block)
   block=None
  elif op==b'Do':
   form=res['/XObject'][args[0]].get_object()
   if form.get('/Subtype')=='/Form':removed+=remove_header_text(form,pdf,mult(list(map(float,form.get('/Matrix',[1,0,0,1,0,0]))),cm))
 assert block is None and not stack
 if removed:
  stream.operations=output
  if isinstance(obj,PageObject):obj.replace_contents(stream)
  else:obj.set_data(stream.get_data())
 return removed
removed=[];readers=[]
for r in rows:
 original=source.pages[r['folio']+1];baseline.add_page(original)
 # Clone independently before touching a page's shared Form streams.
 clone=PdfWriter();body=clone.add_page(original);assert remove_header_text(body,clone)>0
 body.cropbox=RectangleObject([0,0,W,H-CUT]);body.pop('/Annots',None)
 page=PageObject.create_blank_page(width=W,height=H);page.merge_page(body)
 header=PdfReader(ROOT/r['afterHeader']);readers.append(header)
 h=header.pages[0];h.cropbox=RectangleObject([0,H-CUT,W,H]);page.merge_page(h)
 writer.add_page(page)
 writer.add_outline_item(r['title'].rstrip('.'),len(writer.pages)-1)
writer.add_metadata({'/Title':'The Vegetable Guru — proposed header widgets','/Author':'John Lennon','/Subject':'Four header-only mockups; original book body pages and type preserved.'})
writer.write(OUT);baseline.write(TMP/'before-pages.pdf')
normal=lambda s:Counter(c for c in s if not c.isspace())
pdf_checks=[]
with pdfplumber.open(OUT) as final,pdfplumber.open(TMP/'before-pages.pdf') as before:
 for i,r in enumerate(rows):
  old=before.pages[i];new=final.pages[i]
  assert not [c for c in old.chars if c['top']<CUT<c['bottom']],('Header boundary cuts text',r['slug'])
  box=(0,CUT,W,H)
  assert old.crop(box).extract_text()==new.crop(box).extract_text(),('Body changed',r['slug'])
  headerbox=(0,0,W,CUT)
  assert normal(old.crop(headerbox).extract_text() or '')==normal(new.crop(headerbox).extract_text() or ''),('Header words changed',r['slug'])
  with pdfplumber.open(ROOT/r['beforeHeader']) as regenerated:
   # Original header should match the current book, allowing Chromium trim rounding.
   assert normal(old.crop(headerbox).extract_text() or '')==normal(regenerated.pages[0].crop((0,0,regenerated.pages[0].width,CUT)).extract_text() or '')
  pdf_checks.append({'key':r['key'],'folio':r['folio'],'bodyTextIdentical':True,'headerWordsIdentical':True,'pageMm':[185,240]})
for kind,file in [('before',TMP/'before-pages.pdf'),('after',OUT)]:
 subprocess.run(['pdftoppm','-r','120','-jpeg','-jpegopt','quality=90',str(file),str(D/kind)],check=True,capture_output=True)
 # High-resolution header strips are rendered directly from each actual PDF.
 subprocess.run(['pdftoppm','-r','170','-x','0','-y','0','-W','1240','-H','250','-png',str(file),str(D/(kind+'-header'))],check=True,capture_output=True)
for p,h in check['inputs'].items():assert sha(p)==h,p
receipt={'date':'2026-10-15','status':'passed; visual review separate','pdf':str(OUT.relative_to(ROOT)),'sha256':sha(OUT),'pages':4,'headerBoundaryMm':33.5,'checks':pdf_checks,'bookUnchanged':True,'sourceInputsUnchanged':True}
(D/'PDF-CHECKS.json').write_text(json.dumps(receipt,indent=2)+'\n')
items=[]
for i,r in enumerate(rows,1):
 label=r['title'].rstrip('.');shift=r['collisionShiftPx'];note=f"Moved {shift:.0f} px right of the normal position to leave 20 px after the title." if shift>.1 else "Normal position: widget ends 20 px before the shaded circle."
 items.append(f'<section id="{r["slug"]}"><h2>{html.escape(label)}</h2><p class="note">{note} Difficulty badge now matches the page.</p><div class="pair"><figure><figcaption>Current</figcaption><img src="before-header-{i}.png" alt="Current {html.escape(label)} header"></figure><figure><figcaption>Proposed</figcaption><img src="after-header-{i}.png" alt="Proposed {html.escape(label)} header"></figure></div><details><summary>See the whole page</summary><div class="pair full"><figure><figcaption>Current · book page {r["folio"]}</figcaption><img loading="lazy" src="before-{i}.jpg" alt="Current full page"></figure><figure><figcaption>Proposed · book page {r["folio"]}</figcaption><img loading="lazy" src="after-{i}.jpg" alt="Proposed full page"></figure></div></details></section>')
page='''<!doctype html><html lang="en-GB"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Vegetable Guru · Header mockups</title><style>
@font-face{font-family:Nunito;src:url('/fonts/richer-a-6.woff2');font-weight:100 1000}*{box-sizing:border-box}body{margin:0;background:#d9dfcf;color:#173e2c;font:17px/1.5 Nunito,sans-serif}header,main{max-width:1560px;margin:auto;padding:26px}header{padding-bottom:6px}h1{font-size:36px;line-height:1.1;margin:8px 0 14px}h2{font-size:24px;margin:0}.intro{max-width:1000px}.eyebrow{font-size:13px;font-weight:900;letter-spacing:1px}section{background:#ffffff80;border-radius:10px;padding:20px;margin-bottom:24px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:18px}figure{margin:0;min-width:0}figcaption{font-size:14px;font-weight:900;margin-bottom:7px}img{display:block;width:100%;height:auto}summary{cursor:pointer;font-weight:800;margin-top:14px}.full{margin-top:14px}.note{font-size:14px;margin:5px 0 14px}a{color:#064d32}.button{display:inline-block;background:#173e2c;color:#fff8e9;padding:10px 16px;border-radius:5px;text-decoration:none}nav{display:flex;gap:18px;flex-wrap:wrap;margin:12px 0}.status{font-size:14px}@media(max-width:760px){header,main{padding:16px}section{padding:14px}.pair{grid-template-columns:1fr}h1{font-size:29px}}</style>
<header><div class="eyebrow">THE VEGETABLE GURU · FOUR HEADER MOCKUPS</div><h1>Seasons anchored to the circle. Room for longer titles.</h1><p class="intro">The seasons block normally ends 20 layout pixels before the shaded circle. When a longer title would crowd it, the block moves right just enough to leave 20 pixels after the title. Preview zoom scales these pixel gaps. Each difficulty oval uses the same background colour as its page.</p><p><a class="button" href="../../../output/pdf/vegetable-header-review/header-mockups.pdf">Open the four proposed pages</a></p><p class="status">For review · all wording, body text sizes, artwork and page content retained. The full book and source JSON are unchanged.</p><nav>__NAV__</nav></header><main>__ITEMS__</main></html>'''
page=page.replace('__ITEMS__',''.join(items)).replace('__NAV__',''.join(f'<a href="#{r["slug"]}">{html.escape(r["title"].rstrip("."))}</a>' for r in rows))
(D/'REVIEW.html').write_text(page)
print(json.dumps(receipt))
