"""Remove only the repeated sequence from saved native Troubles pages, with exact checks."""
from pathlib import Path
from collections import Counter
import ast,hashlib,json,logging,re,subprocess
import pdfplumber
from pypdf import PdfReader,PdfWriter,PageObject
from pypdf.generic import ContentStream,RectangleObject
from PIL import Image,ImageChops,ImageDraw
logging.getLogger('pdfminer').setLevel(logging.ERROR)
ROOT=Path(__file__).resolve().parents[1];D=ROOT/'docs/publication/troubles-header-refinement'
OUT=ROOT/'output/pdf/troubles-header-refinement/troubles-revised.pdf';MM=72/25.4;H=240*MM
check=json.loads((D/'CHECKS.json').read_text())
sha=lambda p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
norm=lambda s:Counter(c for c in s if not c.isspace())
for p,h in check['inputs'].items():assert sha(p)==h,p
tree=ast.parse((ROOT/'scripts/assemble-whole-book-preview.py').read_text())
exec(compile(ast.Module(body=[n for n in tree.body if isinstance(n,ast.FunctionDef) and n.name=='mult'],type_ignores=[]),'matrix','exec'))

def remove_text_box(obj,pdf,rect,cm=None):
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
            if points and all(rect[0]-1<=x<=rect[2]+1 and H-rect[3]-1<=y<=H-rect[1]+1 for x,y in points):removed+=1
            else:output.extend(block)
            block=None
        elif op==b'Do':
            form=res['/XObject'][args[0]].get_object()
            if form.get('/Subtype')=='/Form':removed+=remove_text_box(form,pdf,rect,mult(list(map(float,form.get('/Matrix',[1,0,0,1,0,0]))),cm))
    assert block is None and not stack
    if removed:
        stream.operations=output
        if isinstance(obj,PageObject):obj.replace_contents(stream)
        else:obj.set_data(stream.get_data())
    return removed

source='output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'
reader=PdfReader(ROOT/source);writer=PdfWriter();clones=[];removed=[]
opener=PdfReader(ROOT/check['opener']['pdf']).pages[0]
for box in ['mediabox','cropbox','trimbox']:setattr(opener,box,RectangleObject([0,0,185*MM,H]))
writer.add_page(opener);writer.add_outline_item('Vegetable Troubles · explanation',0)
pattern=r'Recognise\s*→\s*Act\s*→\s*Prevent'
with pdfplumber.open(ROOT/source) as pdf:
    for folio in range(100,145):
        before=pdf.pages[folio+1];hits=before.search(pattern);assert len(hits)==1,folio
        hit=hits[0];rect=[hit[k] for k in ['x0','top','x1','bottom']]
        clone=PdfWriter();clones.append(clone);page=clone.add_page(reader.pages[folio+1]);page.pop('/Annots',None)
        count=remove_text_box(page,clone,rect);assert count>0,folio
        writer.add_page(page);removed.append({'folio':folio,'rect':rect,'removedTextObjects':count,'text':hit['text']})
writer.set_page_label(0,45,style='/D',start=99);writer.page_layout='/TwoPageRight'
writer.add_metadata({'/Title':'The Vegetable Guru - quieter Troubles headers','/Author':'John Lennon','/Subject':'Section review, folios 99–144. Repeated page-level sequence removed; small advice labels retained; opener explanation proposed.'})
writer.write(OUT)
signature=lambda c:(c['text'],round(c['x0'],3),round(c['top'],3),round(c['size'],3),str(c.get('non_stroking_color')))
checks=[]
with pdfplumber.open(OUT) as after,pdfplumber.open(ROOT/source) as before:
    assert len(after.pages)==46
    expected=''.join(b['text'] for b in check['opener']['blocks'])
    assert norm(after.pages[0].extract_text())==norm(expected),'Opener text'
    assert len(after.pages[0].images)==3
    for i,row in enumerate(removed,1):
        old=before.pages[row['folio']+1];new=after.pages[i];hit=old.search(pattern)[0]
        # Search omits whitespace characters; remove the complete line's spaces too.
        deleted=Counter(signature(c) for c in old.chars if hit['x0']-.01<=c['x0']<=hit['x1']+.01 and hit['top']-.01<=c['top']<=hit['bottom']+.01)
        assert Counter(signature(c) for c in old.chars)-deleted==Counter(signature(c) for c in new.chars),('Unexpected glyph change',row['folio'])
        assert not new.search(pattern)
        image_sig=lambda p:[(im['x0'],im['top'],im['x1'],im['bottom'],im['srcsize']) for im in p.images]
        assert image_sig(old)==image_sig(new),('Artwork changed',row['folio'])
        checks.append({'folio':row['folio'],'onlyHeaderRemoved':True,'remainingGlyphPositionsSizesColoursPreserved':True,'imagesPreserved':len(new.images)})
        old.close();new.close()
# Render representative opening, ordinary and legend-bearing pages; numerical preservation covers all 45.
folios=[99,100,101,106,107,126,144]
for folio in folios:
    n=folio-98
    subprocess.run(['pdftoppm','-f',str(n),'-l',str(n),'-singlefile','-r','150','-png',str(OUT),str(D/f'folio-{folio}')],check=True)
for folios,name in [([100,101],'bean-and-pea-spread'),([106,107],'brassica-spread')]:
    ims=[Image.open(D/f'folio-{f}.png').convert('RGB') for f in folios]
    spread=Image.new('RGB',(sum(im.width for im in ims),ims[0].height),'#fff8e9');spread.paste(ims[0],(0,0));spread.paste(ims[1],(ims[0].width,0));spread.save(D/f'{name}.jpg',quality=92)
check.update(pdf=str(OUT.relative_to(ROOT)),sha256=sha(OUT.relative_to(ROOT)),pdfPages=46,folios=[99,144],removed=removed,pdfChecks=checks,renderedFolios=[99,100,101,106,107,126,144],trimMm=[185,240])
check['implementation']={p:sha(p) for p in ['scripts/build-troubles-header-preview.mjs','scripts/review-troubles-header-preview.py','src/print/book/renderCompact.ts']}
(D/'CHECKS.json').write_text(json.dumps(check,indent=2)+'\n')
for p,h in check['inputs'].items():assert sha(p)==h,p
print(json.dumps({'pdfPages':46,'guidePagesVerified':len(checks),'headersRemoved':len(removed),'output':str(OUT.relative_to(ROOT))}))
