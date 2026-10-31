"""Verify and render the focused contents-key trial, retaining the approved sources."""
from pathlib import Path
from collections import Counter
import json,hashlib,logging,subprocess
import pdfplumber
from pypdf import PdfReader,PdfWriter
from pypdf.generic import RectangleObject
from PIL import Image,ImageChops
logging.getLogger('pdfminer').setLevel(logging.ERROR)
ROOT=Path(__file__).resolve().parents[1]
D=ROOT/'docs/publication/contents-colour-study/key-preview'
OUT=ROOT/'output/pdf/contents-colour-study/contents-with-key.pdf'
check=json.loads((D/'CHECKS.json').read_text())
sha=lambda p:hashlib.sha256((ROOT/p).read_bytes()).hexdigest()
norm=lambda text:Counter(c for c in text if not c.isspace())
for p,h in check['inputs'].items():assert sha(p)==h,p
checked=[]
for result in check['results']:
    with pdfplumber.open(ROOT/result['pdf']) as pdf:
        assert len(pdf.pages)==2
        for page,sheet in zip(pdf.pages,result['sheets']):
            expected=norm(''.join(b['text'] for b in sheet['blocks']))
            actual=norm(page.extract_text())
            assert actual==expected,(result['unit'],sheet['folio'],actual-expected,expected-actual)
            assert len(page.images)==len(sheet['images'])
            checked.append({'unit':result['unit'],'folio':sheet['folio'],'allPdfTextVerified':True,'imagesVerified':len(page.images)})
imperial=next(r for r in check['results'] if r['unit']=='imperial')
writer=PdfWriter()
for source in PdfReader(ROOT/imperial['pdf']).pages:
    page=writer.add_page(source)
    for key in ['mediabox','cropbox','trimbox']:setattr(page,key,RectangleObject([0,0,185*72/25.4,240*72/25.4]))
writer.set_page_label(0,1,style='/D',start=4)
writer.add_metadata({'/Title':'The Vegetable Guru - coloured contents and pale category key','/Author':'John Lennon','/Subject':'Two-page review proof. Option A approved; coloured Troubles and an 8 pt key restored beside the harvest basket with a paler peach background.'})
writer.write(OUT)
with pdfplumber.open(OUT) as final, pdfplumber.open(ROOT/'output/pdf/contents-colour-study/contents-colour-options.pdf') as approved:
    for i,sheet in enumerate(imperial['sheets']):
        page=final.pages[i]
        assert norm(page.extract_text())==norm(''.join(b['text'] for b in sheet['blocks']))
        assert min(c['top'] for c in page.chars)>=5*72/25.4
        assert max(c['bottom'] for c in page.chars)<=235*72/25.4
        assert all(img['top']>=0 and img['bottom']<=page.height for img in page.images)
        # Preserve approved A and all unchanged second-page type; Troubles gains colour/weight.
        signature=lambda c:(c['text'],round(c['x0'],3),round(c['top'],3),round(c['size'],3),str(c.get('non_stroking_color')))
        rows=sheet['troubleRows']
        inside=lambda c,r:r['left']*72/25.4-.5<=c['x0']<=r['right']*72/25.4+.5 and r['top']*72/25.4-.5<=c['top']<=r['bottom']*72/25.4+.5
        retained=lambda c:not any(inside(c,r) for r in rows)
        old=Counter(signature(c) for c in approved.pages[i].chars if retained(c))
        new=Counter(signature(c) for c in page.chars if retained(c))
        assert not old-new,('Original glyph changed',i,old-new)
        additions=''.join(k['text'] for k in sheet['key'])+('Category colours' if sheet['key'] else '')
        assert norm(''.join(c[0]*n for c,n in (new-old).items()))==norm(additions)
        for row,theme in zip(rows,imperial['troubleThemes']):
            chars=[c for c in page.chars if inside(c,row)]
            assert norm(''.join(c['text'] for c in chars))==norm(row['text']),row['text']
            rgb=tuple(int(theme['deep'][n:n+2],16)/255 for n in [1,3,5])
            assert all(abs(c['size']-10.5)<.01 and all(abs(a-b)<.001 for a,b in zip(c['non_stroking_color'],rgb)) for c in chars),row['text']
subprocess.run(['pdftoppm','-r','150','-png','-cropbox',str(OUT),str(D/'page')],check=True)
old_first=Image.open(D.parent/'page-1.png').convert('RGB')
new_first=Image.open(D/'page-1.png').convert('RGB')
assert ImageChops.difference(old_first,new_first).getbbox() is None,'Approved A first-page pixels changed'
new_facing=Image.open(D/'page-2.png').convert('RGB')
left=Image.open(D/'page-1.png').convert('RGB')
spread=Image.new('RGB',(left.width+new_facing.width,left.height),'#fff8e9')
spread.paste(left,(0,0));spread.paste(new_facing,(left.width,0));spread.save(D/'spread.jpg',quality=93)
check.update(pdf=str(OUT.relative_to(ROOT)),sha256=sha(OUT.relative_to(ROOT)),pdfPages=2,pdfChecks=checked,unchangedGlyphPositionsSizesColoursRetained=True,all14TroublesColoursVerified=True,firstPagePixelsUnchanged=True,trimMm=[185,240])
check['implementation']={p:sha(p) for p in ['scripts/build-contents-key-preview.mjs','scripts/review-contents-key-preview.py','docs/publication/contents-colour-study/key-preview/key.css']}
(D/'CHECKS.json').write_text(json.dumps(check,indent=2)+'\n')
print(json.dumps({'output':str(OUT.relative_to(ROOT)),'pages':2,'bothUnitPdfPagesChecked':len(checked),'approvedFirstPageUnchanged':True,'all14TroublesColoursVerified':True}))
