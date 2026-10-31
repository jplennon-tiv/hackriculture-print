"""Verify and render the three contents experiments without changing the book."""
from pathlib import Path
from collections import Counter
import json,hashlib,logging,subprocess
import pdfplumber
from pypdf import PdfReader,PdfWriter
from pypdf.generic import RectangleObject
from PIL import Image,ImageDraw,ImageFont
logging.getLogger('pdfminer').setLevel(logging.ERROR)
ROOT=Path(__file__).resolve().parents[1]
D=ROOT/'docs/publication/contents-colour-study'
OUT=ROOT/'output/pdf/contents-colour-study/contents-colour-options.pdf'
check=json.loads((D/'CHECKS.json').read_text())
sha=lambda p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
norm=lambda text:Counter(c for c in text if not c.isspace())
for p,h in check['inputs'].items():assert sha(p)==h,p
writer=PdfWriter();checked=[];readers=[]
for result in check['results']:
    with pdfplumber.open(ROOT/result['pdf']) as pdf:
        assert len(pdf.pages)==2
        for page,sheet in zip(pdf.pages,result['sheets']):
            expected=norm(''.join(b['text'] for b in sheet['blocks']))
            actual=norm(page.extract_text())
            assert actual==expected,(result['id'],result['unit'],sheet['folio'],actual-expected,expected-actual)
            assert len(page.images)==len(sheet['images'])
            checked.append({'variant':result['letter'],'unit':result['unit'],'folio':sheet['folio'],'allPdfTextVerified':True,'imagesVerified':len(page.images)})
    reader=PdfReader(ROOT/result['pdf']);readers.append(reader)
    if result['unit']=='imperial':
        start=len(writer.pages)
        for source in reader.pages:
            page=writer.add_page(source)
            for key in ['mediabox','cropbox','trimbox']:setattr(page,key,RectangleObject([0,0,185*72/25.4,240*72/25.4]))
        writer.add_outline_item(result['letter']+' · '+result['name'],start)
        writer.set_page_label(start,start+1,prefix=result['letter']+' · ',start=4,style='/D')
writer.add_metadata({'/Title':'The Vegetable Guru - contents colour options A, B and C','/Author':'John Lennon','/Subject':'Separate six-page comparison. A pages 1–2; B pages 3–4; C pages 5–6. No option installed.'})
writer.write(OUT)
with pdfplumber.open(OUT) as final:
    for i,result in enumerate(r for r in check['results'] if r['unit']=='imperial'):
        for offset,sheet in enumerate(result['sheets']):
            page=final.pages[i*2+offset]
            expected=norm(''.join(b['text'] for b in sheet['blocks']))
            assert norm(page.extract_text())==expected,('Final text omitted',result['letter'],offset)
            assert min(c['top'] for c in page.chars)>=5*72/25.4
            assert max(c['bottom'] for c in page.chars)<=235*72/25.4
            assert all(img['top']>=0 and img['bottom']<=page.height for img in page.images)
subprocess.run(['pdftoppm','-r','150','-png','-cropbox',str(OUT),str(D/'page')],check=True)
for letter,start in [('a',1),('b',3),('c',5)]:
    left=Image.open(D/f'page-{start}.png').convert('RGB');right=Image.open(D/f'page-{start+1}.png').convert('RGB')
    spread=Image.new('RGB',(left.width+right.width,left.height),'#fff8e9');spread.paste(left,(0,0));spread.paste(right,(left.width,0));spread.save(D/f'{letter}-spread.jpg',quality=92)
width=650;heading=52
pages=[Image.open(D/f'page-{n}.png').convert('RGB') for n in [1,3,5]]
height=round(pages[0].height*width/pages[0].width)
contact=Image.new('RGB',(3*width,height+heading),'#d9dfcf');draw=ImageDraw.Draw(contact);font=ImageFont.load_default(size=22)
for i,(im,label) in enumerate(zip(pages,['A · Coloured crop names','B · Categories in brackets','C · Pale category stripes'])):
    contact.paste(im.resize((width,height),Image.Resampling.LANCZOS),(i*width,heading));draw.text((i*width+18,15),label,font=font,fill='#173e2c')
contact.save(D/'comparison.jpg',quality=93)
check.update(pdf=str(OUT.relative_to(ROOT)),sha256=sha(OUT.relative_to(ROOT)),pdfPages=6,pdfChecks=checked,all83DestinationsRetained=True,originalCropOrderRetained=True,trimMm=[185,240])
check['implementation']={p:sha(p) for p in ['scripts/build-contents-colour-study.mjs','scripts/review-contents-colour-study.py','docs/publication/contents-colour-study/study.css']}
(D/'CHECKS.json').write_text(json.dumps(check,indent=2)+'\n')
(D/'REVIEW.html').write_text('''<!doctype html><html lang="en-GB"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Contents colour experiments</title><style>body{margin:0;background:#d9dfcf;color:#173e2c;font:17px/1.5 system-ui}main{max-width:1500px;margin:auto;padding:26px}h1{font-size:32px;margin-bottom:10px}button,a{color:#064d32}nav{display:flex;gap:12px;flex-wrap:wrap;margin:20px 0}button{background:#fff8e9;padding:12px 18px;font:700 16px system-ui;border:1px solid #173e2c;border-radius:4px;cursor:pointer}button[aria-pressed=true]{background:#173e2c;color:#fff8e9}.spread{display:grid;grid-template-columns:1fr 1fr;gap:5px}.spread img{width:100%;height:auto;box-shadow:0 2px 12px #173e2c20}p{max-width:1000px}.all{width:100%;margin-top:20px}</style><main><h1>Three ways to add category colour</h1><p>Separate proposals for the alphabetical contents. All retain the current titles, references, illustrations and 10.5 pt crop names. The facing Troubles/Techniques page is unchanged. None has been added to the main book.</p><p><a href="../../../output/pdf/contents-colour-study/contents-colour-options.pdf">Open the six-page PDF</a> · A: pages 1–2 · B: 3–4 · C: 5–6</p><nav><button data-v="a" aria-pressed="true">A · Coloured names</button><button data-v="b" aria-pressed="false">B · Bracketed categories</button><button data-v="c" aria-pressed="false">C · Pale stripes</button></nav><p id="note"></p><div class="spread"><img id="left" src="page-1.png" alt="Vegetable contents option A"><img id="right" src="page-2.png" alt="Unchanged facing contents page"></div><details><summary>Compare all three vegetable lists</summary><img class="all" src="comparison.jpg" alt="Options A, B and C side by side"></details></main><script>const choices={a:{page:1,note:'A uses each category’s existing heading colour for the crop name and page number. The names are slightly heavier for legibility.'},b:{page:3,note:'B keeps the crop names in the current green and adds the full category name in smaller coloured brackets. This is the most explicit option.'},c:{page:5,note:'C uses the existing pale category colour behind each row, with a narrow darker stripe at its left edge. The crop names stay in the current green.'}};function show(v){const d=choices[v];document.getElementById('left').src='page-'+d.page+'.png';document.getElementById('left').alt='Vegetable contents option '+v.toUpperCase();document.getElementById('right').src='page-'+(d.page+1)+'.png';document.getElementById('note').textContent=d.note;document.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.v===v)));}document.querySelectorAll('button').forEach(b=>b.onclick=()=>show(b.dataset.v));show('a');</script></html>''')
print(json.dumps({'pages':6,'verifiedPdfPagesBothUnits':len(checked),'output':str(OUT.relative_to(ROOT))}))
