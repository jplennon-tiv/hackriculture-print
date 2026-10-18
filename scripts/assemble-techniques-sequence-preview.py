"""Assemble the authorised section-order trial from protected existing proofs."""
from pathlib import Path
import ast
import hashlib
import io
import json
import logging
import re
import subprocess

import pdfplumber
from PIL import Image, ImageDraw
from pypdf import PdfReader, PdfWriter, PageObject, Transformation
from pypdf.annotations import Link
from pypdf.generic import ContentStream, RectangleObject
from reportlab.pdfgen import canvas

ROOT = Path(__file__).resolve().parents[1]
DIR = ROOT / 'docs/publication/techniques-sequence'
OUT = ROOT / 'output/pdf/techniques-sequence/growing-techniques-order-preview.pdf'
MM = 72 / 25.4
W, H = 185 * MM, 240 * MM
logging.getLogger('pdfminer').setLevel(logging.ERROR)
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
plan = json.loads((DIR / 'ASSEMBLY.json').read_text())
for name, digest in plan['inputs'].items():
    assert sha(ROOT / name) == digest, name

# Reuse the book assembler's proven recursive text-object footer removal,
# without running its full-book assembly side effects.
helper_path = ROOT / 'scripts/assemble-whole-book-preview.py'
tree = ast.parse(helper_path.read_text())
helpers = [n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name in ('mult', 'remove_footer')]
assert len(helpers) == 2
exec(compile(ast.Module(body=helpers, type_ignores=[]), str(helper_path), 'exec'))

paper_bytes = io.BytesIO()
c = canvas.Canvas(paper_bytes, pagesize=(W, H))
c.setFillColorRGB(1, 248 / 255, 233 / 255)
c.rect(0, 0, W, H, fill=1, stroke=0)
c.save()
paper = PdfReader(paper_bytes).pages[0]
# The paper rectangle contains no text; remove ReportLab's unused default font.
paper_stream = paper.get_contents()
assert not any(op in (b'Tj', b'TJ') for _, op in paper_stream.operations)
paper_stream.operations = [(a, op) for a, op in paper_stream.operations if op not in (b'BT', b'ET', b'Tf', b'TL')]
paper.replace_contents(paper_stream)
paper['/Resources'].pop('/Font', None)
footer_reader = PdfReader(ROOT / 'tmp/pdfs/techniques-sequence/footers.pdf')
assert len(footer_reader.pages) == len(plan['footerFolios']) == 18
footers = dict(zip(plan['footerFolios'], footer_reader.pages))
writer = PdfWriter()
readers = {}
clones = []
map_rows = []
for record in plan['pages']:
    folio = record['folio']
    result = PageObject.create_blank_page(width=W, height=H)
    result.merge_page(paper)
    shift = 0
    if record['source']:
        name = record['source']
        if name not in readers:
            readers[name] = PdfReader(ROOT / name)
        reader = readers[name]
        original = reader.pages[record['sourcePage'] - 1]
        clone = PdfWriter()
        body = clone.add_page(original)
        clones.append(clone)
        if record['kind'] != 'opener':
            assert remove_footer(body, clone) > 0, folio
        body.pop('/Annots', None)
        old_left = 17 if record['sourceFolio'] % 2 else 8
        new_left = 17 if folio % 2 else 8
        shift = (new_left - old_left) * MM
        result.merge_transformed_page(body, Transformation().translate(shift, 0))
        if folio in footers:
            result.merge_page(footers[folio])
    p = writer.add_page(result)
    for box in ('mediabox', 'cropbox', 'trimbox'):
        setattr(p, box, RectangleObject([0, 0, W, H]))
    record = dict(record, shiftMm=round(shift / MM, 3), image=f'pages/page-{len(map_rows)+1:02d}.jpg')
    map_rows.append(record)
    if record['kind'] != 'blank':
        writer.add_outline_item(f"{folio} · {record['label']}", len(map_rows) - 1)
writer.set_page_label(0, len(writer.pages) - 1, style='/D', start=145)
writer.page_layout = '/TwoPageRight'
writer.page_mode = '/UseOutlines'
writer.add_metadata({'/Title': 'The Vegetable Guru — Growing Techniques order preview', '/Author': 'John Lennon', '/Subject': 'Imperial section-only sequence trial, pages 145–165; two proposed alignment blanks; full book unchanged.'})

# Add the one internal reference which changes in this section-only proof.
nutrient_check = ROOT / 'tmp/pdfs/techniques-sequence/nutrient-147.pdf'
with pdfplumber.open(nutrient_check) as check:
    matches = check.pages[0].search(r'pages 148[–-]149')
    assert len(matches) == 1
    m = matches[0]
    annotation = writer.add_annotation(2, Link(rect=(m['x0'], H-m['bottom'], m['x1'], H-m['top']), target_page_index=3))
    annotation['/Dest'][0] = writer.pages[3].indirect_reference
OUT.parent.mkdir(parents=True, exist_ok=True)
writer.write(OUT)

normal = lambda s: re.sub(r'\s+', '', s)
body_checks = []
with pdfplumber.open(OUT) as final:
    assert len(final.pages) == 21
    source_pdfs = {name: pdfplumber.open(ROOT / name) for name in readers}
    for record, current in zip(map_rows, final.pages):
        assert abs(current.width-W) < .01 and abs(current.height-H) < .01
        assert record['folio'] % 2 == record['pdfPage'] % 2
        if record['kind'] == 'blank':
            assert not current.chars
            continue
        before = source_pdfs[record['source']].pages[record['sourcePage'] - 1]
        before_chars = [c for c in before.chars if c['bottom'] < 228 * MM]
        after_chars = [c for c in current.chars if c['bottom'] < 228 * MM]
        assert len(before_chars) == len(after_chars), (record['folio'], len(before_chars), len(after_chars))
        for a, b in zip(before_chars, after_chars):
            assert a['text'] == b['text'], (record['folio'], a['text'], b['text'])
            assert abs(a['size'] - b['size']) < .02
            # Bottom-origin glyph coordinates survive trim-box normalisation.
            # Chromium's source MediaBox can be 0.139 mm shorter than 240 mm.
            assert abs(a['y0'] - b['y0']) < .02
            assert abs((a['x0'] + record['shiftMm'] * MM) - b['x0']) < .02
        assert len(before.images) == len(current.images), record['folio']
        if record['kind'] != 'opener':
            footer = current.crop((0, 228 * MM, W, H)).extract_text() or ''
            assert normal(footer) == 'GROWINGTECHNIQUES'+str(record['folio']), (record['folio'], footer)
            left, right = ((17, 177) if record['folio'] % 2 else (8, 168))
            assert min(c['x0'] for c in after_chars) >= (left-.3)*MM, record['folio']
            assert max(c['x1'] for c in after_chars) <= (right+.3)*MM, record['folio']
            assert min(c['top'] for c in after_chars) >= 4.8*MM
        body_checks.append({'folio':record['folio'], 'charactersPreserved':len(after_chars), 'imagesPreserved':len(current.images), 'horizontalShiftMm':record['shiftMm'], 'bodySizeAndVerticalPositionsUnchanged':True})
    for doc in source_pdfs.values():
        doc.close()

# Check the derivative against the approved nutrient copy, not just its own PDF.
with pdfplumber.open(ROOT/'output/pdf/nutrient-cycles/nutrient-cycles.pdf') as approved, pdfplumber.open(nutrient_check) as derivative:
    a=approved.pages[0].crop((0,0,W,228*MM)).extract_text()
    b=derivative.pages[0].crop((0,0,derivative.pages[0].width,228*MM)).extract_text()
    assert normal(a.replace('156–157','148–149')) == normal(b)
    assert sorted(round(x['size'],3) for x in approved.pages[0].chars if x['bottom']<228*MM)==sorted(round(x['size'],3) for x in derivative.pages[0].chars if x['bottom']<228*MM)

check = PdfReader(OUT)
font_checks=[]
def fonts(resources):
    for font in resources.get('/Font', {}).values():
        f=font.get_object()
        if f.get('/Subtype')=='/Type0':
            f=f['/DescendantFonts'][0].get_object()
        descriptor=f.get('/FontDescriptor')
        assert f.get('/Subtype')=='/Type3' or descriptor and any(k in descriptor.get_object() for k in ('/FontFile','/FontFile2','/FontFile3')), str(f.get('/BaseFont'))
        font_checks.append(str(f.get('/BaseFont','Type3 embedded glyphs')))
    for obj in resources.get('/XObject',{}).values():
        o=obj.get_object()
        if o.get('/Subtype')=='/Form': fonts(o.get('/Resources',{}))
for p in check.pages: fonts(p.get('/Resources',{}))
for left,right in plan['facingPairs']:
    assert left%2==0 and right==left+1
for name,digest in plan['inputs'].items(): assert sha(ROOT/name)==digest

images=DIR/'pages';images.mkdir(exist_ok=True)
poppler='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm'
subprocess.run([poppler,'-r','150','-jpeg','-jpegopt','quality=90',str(OUT),str(images/'page')],check=True)
assert len(list(images.glob('page-*.jpg')))==21
for row in map_rows: assert (DIR/row['image']).is_file()

def contact(name, folios, columns, width):
    tiles=[]
    for folio in folios:
        row=next(r for r in map_rows if r['folio']==folio)
        im=Image.open(DIR/row['image']).convert('RGB');im.thumbnail((width,round(width*240/185)))
        tile=Image.new('RGB',(width,im.height+26),'#d9dfcf');tile.paste(im,(0,26))
        ImageDraw.Draw(tile).text((5,6),f"{folio} · {row['label'][:45]}",fill='#173e2c');tiles.append(tile)
    height=max(t.height for t in tiles)
    sheet=Image.new('RGB',(width*columns,height*((len(tiles)+columns-1)//columns)),'#d9dfcf')
    for i,t in enumerate(tiles): sheet.paste(t,((i%columns)*width,(i//columns)*height))
    sheet.save(DIR/name,quality=92)
for a,b in plan['facingPairs']: contact(f'spread-{a}-{b}.jpg',[a,b],2,650)
contact('contact-opening.jpg',range(145,152),4,350)
contact('contact-methods.jpg',range(152,160),4,350)
contact('contact-growing.jpg',range(160,166),3,400)
checks={'status':'Technical assembly checks passed; visual review recorded separately','pdf':str(OUT.relative_to(ROOT)),'sha256':sha(OUT),'pages':21,'contentPages':18,'sectionOpeners':1,'proposedBlankFolios':[150,162],'folioRange':[145,165],'units':'imperial','trimMm':[185,240],'facingPairs':plan['facingPairs'],'bodyPreservation':body_checks,'embeddedFonts':sorted(set(font_checks)),'nutrientDerivative':'Only folio/parity and rotation reference 156–157 → 148–149 change. Text size retained.','inputsUnchanged':True,'fullBookUnchanged':True,'footerRemovalSource':{'path':str(helper_path.relative_to(ROOT)),'sha256':sha(helper_path)},'viewerImages':'Actual assembled PDF rendered at 150 dpi'}
(DIR/'CHECKS.json').write_text(json.dumps(checks,indent=2,ensure_ascii=False)+'\n')
(DIR/'PAGE-MAP.json').write_text(json.dumps(map_rows,indent=2,ensure_ascii=False)+'\n')
template=(DIR/'viewer-template.html').read_text()
template=template.replace('__PAGES__',json.dumps(map_rows,ensure_ascii=False).replace('</','<\\/')).replace('__REVISION__',checks['sha256'][:12])
(DIR/'REVIEW.html').write_text(template)
print(json.dumps({'pdf':str(OUT),'pages':21,'preservedContentPages':len(body_checks),'blanks':[150,162],'review':str(DIR/'REVIEW.html')}))
