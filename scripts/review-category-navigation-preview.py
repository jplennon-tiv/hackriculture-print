"""Graft proposed category labels onto four saved native guide pages."""
from pathlib import Path
from collections import Counter
import ast, hashlib, html, json, logging, subprocess
from pypdf import PdfReader, PdfWriter, PageObject
from pypdf.generic import ContentStream, RectangleObject
import pdfplumber
from PIL import Image
logging.getLogger('pdfminer').setLevel(logging.ERROR)
ROOT=Path(__file__).resolve().parents[1]
D=ROOT/'docs/publication/category-navigation-preview'
TMP=ROOT/'tmp/pdfs/category-navigation-preview'
OUT=ROOT/'output/pdf/category-navigation-preview/category-navigation-preview.pdf'
MM=72/25.4; H=240*MM
check=json.loads((D/'CHECKS.json').read_text())
sha=lambda p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
for p,h in check['inputs'].items(): assert sha(p)==h,p
tree=ast.parse((ROOT/'scripts/assemble-whole-book-preview.py').read_text())
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='mult'],type_ignores=[]),'matrix','exec'))

def remove_label(obj,pdf,practical,cm=None):
    """Remove only complete category/title text objects; retain all artwork."""
    cm=list(cm or [1,0,0,1,0,0]);stack=[];tm=[1,0,0,1,0,0]
    stream=obj.get_contents() if isinstance(obj,PageObject) else ContentStream(obj,pdf)
    output=[];block=None;points=[];removed=0;res=obj.get('/Resources',{})
    for args,op in stream.operations:
        if op==b'BT':block=[];points=[];tm=[1,0,0,1,0,0]
        (block if block is not None else output).append((args,op))
        if op==b'q':stack.append(cm[:])
        elif op==b'Q':cm=stack.pop()
        elif op==b'cm':cm=mult(list(map(float,args)),cm)
        elif op==b'Tm':tm=list(map(float,args))
        elif op in [b'Td',b'TD']:tm=mult([1,0,0,1,float(args[0]),float(args[1])],tm)
        elif op in [b'Tj',b'TJ']:points.append(mult(tm,cm)[4:])
        elif op==b'ET':
            limit=20 if practical else 9.6
            xmax=155 if practical else 60
            if points and all(4*MM<x<xmax*MM and H-limit*MM<y<H-3*MM for x,y in points):removed+=1
            else:output.extend(block)
            block=None
        elif op==b'Do':
            form=res['/XObject'][args[0]].get_object()
            if form.get('/Subtype')=='/Form':removed+=remove_label(form,pdf,practical,mult(list(map(float,form.get('/Matrix',[1,0,0,1,0,0]))),cm))
    assert block is None and not stack
    if removed:
        stream.operations=output
        if isinstance(obj,PageObject):obj.replace_contents(stream)
        else:obj.set_data(stream.get_data())
    return removed

source=PdfReader(ROOT/'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf')
writer=PdfWriter();reader=PdfReader(TMP/'opening.pdf')
opening=reader.pages[0]
for box in ['mediabox','cropbox','trimbox']:setattr(opening,box,RectangleObject([0,0,185*MM,H]))
writer.add_page(opening)
writer.add_outline_item('Category colour key · page 9',0)
clones=[];label_readers=[];removed=[]
for row in check['guideSamples']:
    clone=PdfWriter();clones.append(clone)
    page=clone.add_page(source.pages[row['folio']+1]);page.pop('/Annots',None)
    count=remove_label(page,clone,bool(row['folio']%2));assert count>0,row
    labels=PdfReader(TMP/f"label-{row['folio']}.pdf");label_readers.append(labels)
    page.merge_page(labels.pages[0]);writer.add_page(page)
    removed.append({'folio':row['folio'],'removedNativeTextObjects':count})
    if row['folio']%2==0:writer.add_outline_item(row['title']+' · '+row['group'],len(writer.pages)-1)
writer.add_metadata({'/Title':'The Vegetable Guru - category navigation preview','/Author':'John Lennon','/Subject':'Proposal only: colour key and two example spreads. Main book unchanged.'})
writer.write(OUT)

norm=lambda s:Counter(c for c in s.lower() if not c.isspace())
checks=[]
with pdfplumber.open(OUT) as final,pdfplumber.open(ROOT/'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf') as old:
    assert len(final.pages)==5
    for i,row in enumerate(check['guideSamples'],1):
        before=old.pages[row['folio']+1];after=final.pages[i]
        expected=norm(before.extract_text())
        if row['folio']%2:expected+=norm(row['group'])
        assert norm(after.extract_text())==expected,('Text changed',row['folio'])
        cutoff=(21 if row['folio']%2 else 10)*MM
        def body(p):return [(c['text'],round(c['x0'],3),round(c['top'],3),round(c['size'],3),c['non_stroking_color']) for c in p.chars if c['top']>=cutoff]
        assert body(before)==body(after),('Body glyph change',row['folio'])
        assert len(before.images)==len(after.images),('Images changed',row['folio'])
        labels=[w for w in after.extract_words() if w['top']<8*MM and w['x0']<60*MM]
        checks.append({'folio':row['folio'],'bodyGlyphsSizeColourPositionUnchanged':True,'imagesUnchanged':True,'labelWords':[(w['text'],round(w['top']/MM,2),round(w['bottom']/MM,2)) for w in labels]})
    opening=final.pages[0]
    for group in check['opening']['categoryLabels']:assert group in opening.extract_text(),group
    expected=norm(old.pages[10].extract_text())+norm('Category colours'+''.join(check['opening']['categoryLabels']))
    assert norm(opening.extract_text())==expected,'Opening text changed'
    for page in final.pages:
        assert abs(page.width/MM-185)<.01 and abs(page.height/MM-240)<.01
    for row in checks:assert all(top>=5 for _,top,bottom in row['labelWords']),row
for p,h in check['inputs'].items():assert sha(p)==h,p
subprocess.run(['pdftoppm','-r','150','-png','-cropbox',str(OUT),str(D/'page')],check=True)
for title,indices in [('carrot-spread',[2,3]),('kale-spread',[4,5])]:
    images=[Image.open(D/f'page-{n}.png').convert('RGB') for n in indices]
    spread=Image.new('RGB',(sum(im.width for im in images),images[0].height),'#fff8e9')
    x=0
    for im in images:spread.paste(im,(x,0));x+=im.width
    spread.save(D/f'{title}.jpg',quality=92)
check.update(pdf=str(OUT.relative_to(ROOT)),sha256=sha(OUT.relative_to(ROOT)),pdfPages=5,removedNativeText=removed,pdfGuideChecks=checks,trimMm=[185,240],categoryLabelPt=10,openingPdfTextPreserved=True)
check['implementation']={p:sha(p) for p in ['scripts/build-category-navigation-preview.mjs','scripts/review-category-navigation-preview.py','docs/publication/category-navigation-preview/proposal.css']}
(D/'CHECKS.json').write_text(json.dumps(check,indent=2)+'\n')
(D/'REVIEW.html').write_text('''<!doctype html><html lang="en-GB"><meta charset="utf-8"><title>Category navigation proposal</title><style>body{margin:0;padding:30px;background:#d9dfcf;color:#173e2c;font:18px/1.5 system-ui}main{max-width:1400px;margin:auto}h1{font-size:32px}img{display:block;width:100%;height:auto;margin:18px 0 40px;box-shadow:0 2px 12px #173e2c22}.single{max-width:650px}a{color:#064d32}</style><main><h1>Category names and colour key</h1><p>Separate proposal for review. The main book is unchanged. The eight existing category colours are retained; larger category names repeat on both guide pages.</p><p><a href="../../../output/pdf/category-navigation-preview/category-navigation-preview.pdf">Open the five-page PDF</a></p><h2>How to use the guides · page 9</h2><p>A smaller title and decorative illustration make space for the colour key. All existing explanations and diagrams remain at their previous reading size.</p><img class="single" src="page-1.png" alt="How to use the guides with category colour key"><h2>Carrot · pages 36–37</h2><img src="carrot-spread.jpg" alt="Carrot facing pages with Root Crops labels"><h2>Kale · pages 58–59</h2><img src="kale-spread.jpg" alt="Kale facing pages with Brassicas labels"></main></html>''')
print(json.dumps({'pages':5,'checks':checks,'pdf':str(OUT.relative_to(ROOT))}))
