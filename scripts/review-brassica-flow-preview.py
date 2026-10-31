"""Verify complete Brassica advice/art preservation and make trim-only review PDFs."""
from pathlib import Path
from collections import Counter
import hashlib
import json
import logging
import subprocess
import pdfplumber
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject
from PIL import Image, ImageDraw, ImageFont

logging.getLogger('pdfminer').setLevel(logging.ERROR)
ROOT = Path(__file__).resolve().parents[1]
EV = ROOT / 'docs/publication/brassica-flow-preview'
TMP = ROOT / 'tmp/pdfs/brassica-flow-preview'
OUT = ROOT / 'output/pdf/brassica-flow-preview'
if (EV/'APPROVAL.json').exists():
    raise SystemExit('Approved full-guide proof is frozen; use a new working path')
OUT.mkdir(parents=True, exist_ok=True)
DOM = json.loads((EV / 'CHECKS.json').read_text())

def image_hashes(resources):
    images = []
    for ref in resources.get('/XObject', {}).get_object().values() if '/XObject' in resources else []:
        obj = ref.get_object()
        if obj.get('/Subtype') == '/Image':
            images.append((int(obj['/Width']), int(obj['/Height']), hashlib.sha256(obj.get_data()).hexdigest()))
        elif obj.get('/Subtype') == '/Form' and '/Resources' in obj:
            images.extend(image_hashes(obj['/Resources']))
    return images

def embedded_fonts(resources):
    fonts=[]
    for ref in resources.get('/Font',{}).get_object().values() if '/Font' in resources else []:
        f=ref.get_object()
        for ff in f.get('/DescendantFonts',[f]):
            font=ff.get_object();desc=font.get('/FontDescriptor')
            assert (font.get('/Subtype')=='/Type3' and '/CharProcs' in font) or (desc and any(k in desc for k in ['/FontFile','/FontFile2','/FontFile3'])), 'Unembedded font'
            fonts.append(str(f.get('/BaseFont','Embedded Type3 glyphs')))
    for ref in resources.get('/XObject',{}).get_object().values() if '/XObject' in resources else []:
        x=ref.get_object()
        if '/Resources' in x: fonts+=embedded_fonts(x['/Resources'])
    return fonts

report={'scope':'Both units, every Brassica page; no other guide or whole-book assembly','results':[]}
for d in DOM['results']:
    units=d['units'];variants=[]
    # Prove that earlier whitespace is caused by indivisible entries, not padding.
    heights=[e['heightPx'] for p in d['after'] for e in p['entries']]
    start=0;packing=[]
    for page in d['after']:
        end=start+len(page['entries']);cap=page['footerTopPx']-14-page['bodyTopPx']
        def span(a,b): return sum(heights[a:b])+8*max(0,b-a-1)
        if end<len(heights):
            feasible=[mid for mid in range(start+1,end+2) if span(start,mid)<=cap+.1 and span(mid,end+1)<=cap+.1]
            assert not feasible, f'An extra complete entry fits folio {page["folio"]}'
        mid=start+len(page['columns'][0]['keys'])
        if mid<end: assert span(start,mid+1)>cap+.1, 'Left column could take another entry'
        packing.append({'folio':page['folio'],'capacityPx':cap,'nextEntryCannotFitAnyOrderedSplit':end<len(heights),'leftColumnFilledFirst':True})
        start=end
    for mode in ['before','after']:
        filename=TMP/f'{units}-{mode}.pdf';reader=PdfReader(filename)
        assert len(reader.pages)==len(d[mode])
        images=Counter();glyphs=Counter();fonts=set()
        with pdfplumber.open(filename) as doc:
            for p,dom,pdf in zip(doc.pages,d[mode],reader.pages):
                # Exclude repeated page furniture; compare every body glyph and type size.
                body=[c for c in p.chars if c['top']>=dom['bodyTopPx']*.75-.5 and c['bottom']<dom['footerTopPx']*.75-1]
                glyphs.update((c['text'],round(c['size'],2)) for c in body if not c['text'].isspace())
                images.update(image_hashes(pdf['/Resources']));fonts.update(embedded_fonts(pdf['/Resources']))
        variants.append({'glyphs':glyphs,'images':images,'fonts':sorted(fonts)})
    assert variants[0]['glyphs']==variants[1]['glyphs'], f'Body glyph/type change: {units}: {variants[0]["glyphs"]-variants[1]["glyphs"]}, {variants[1]["glyphs"]-variants[0]["glyphs"]}'
    assert variants[0]['images']==variants[1]['images'], f'Embedded art changed: {units}'
    assert sum(variants[1]['images'].values())==29
    main_preserved=None
    if units=='imperial':
        main_glyphs=Counter()
        with pdfplumber.open(ROOT/'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf',pages=list(range(108,114))) as main:
            for p,dom in zip(main.pages,d['before']):
                main_glyphs.update((c['text'],round(c['size'],2)) for c in p.chars if not c['text'].isspace() and c['top']>=dom['bodyTopPx']*.75-.5 and c['bottom']<dom['footerTopPx']*.75-1)
        assert main_glyphs==variants[0]['glyphs'], 'Current source differs from main-book Brassica body'
        main_preserved=True
    writer=PdfWriter()
    for i,page in enumerate(PdfReader(TMP/f'{units}-after.pdf').pages):
        # Correct Chromium's sub-point rounding without changing layout/scale.
        page.mediabox=RectangleObject([0,0,185*72/25.4,240*72/25.4]);page.cropbox=page.mediabox
        writer.add_page(page);writer.add_outline_item(f'Brassica - {106+i}',i)
    writer.add_metadata({'/Title':f'Brassica Troubles - natural book flow ({units})','/Subject':'Full-guide layout for review. Approved 25% larger art and 4 mm wrapping gap. Folios provisional; trim-only, not supplier upload.'})
    dest=OUT/f'brassica-troubles-{units}.pdf'
    with dest.open('wb') as f:writer.write(f)
    subprocess.run(['pdftoppm','-scale-to','1600','-png',str(dest),str(EV/units)],check=True)
    report['results'].append({'units':units,'beforePages':len(d['before']),'afterPages':len(d['after']),'entries':29,'bodyGlyphsAndTypeSizesPreserved':True,'embeddedImagesIdentical':29,'fontsEmbedded':variants[1]['fonts'],'output':str(dest.relative_to(ROOT)),'sha256':hashlib.sha256(dest.read_bytes()).hexdigest(),'trimMm':[185,240],'packing':packing,'mainBookBodyGlyphsAndTypePreserved':main_preserved})

# Compare the old and new guide at identical scale; render baseline from actual PDF.
subprocess.run(['pdftoppm','-scale-to','900','-png',str(TMP/'imperial-before.pdf'),str(TMP/'before')],check=True)
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',24)
n=len(DOM['results'][0]['after']);thumb_w,thumb_h=370,480
canvas=Image.new('RGB',(thumb_w*n,1040),'#e4e7de');draw=ImageDraw.Draw(canvas)
draw.text((15,7),'Before: smaller drawings, space distributed through the guide',font=font,fill='#21452c')
draw.text((15,523),'Now: larger drawings, natural gaps and trailing final space',font=font,fill='#21452c')
for i in range(max(n,len(DOM['results'][0]['before']))):
    for y,p in [(40,TMP/f'before-{i+1}.png'),(560,EV/f'imperial-{i+1}.png')]:
        if p.exists():canvas.paste(Image.open(p).convert('RGB').resize((thumb_w,thumb_h),Image.Resampling.LANCZOS),(i*thumb_w,y))
canvas.save(EV/'before-after-contact.jpg',quality=92)
for unit in ['imperial','metric']:
    for i in range(0,n,2):
        left=Image.open(EV/f'{unit}-{i+1}.png').convert('RGB')
        spread=Image.new('RGB',(left.width*2+12,left.height),'#e4e7de');spread.paste(left,(0,0))
        right=EV/f'{unit}-{i+2}.png'
        if right.exists():spread.paste(Image.open(right).convert('RGB'),(left.width+12,0))
        spread.save(EV/f'{unit}-spread-{106+i}-{107+i}.jpg',quality=91)
report['bothUnitsPixelIdentical']=all((EV/f'imperial-{i+1}.png').read_bytes()==(EV/f'metric-{i+1}.png').read_bytes() for i in range(n))
assert report['bothUnitsPixelIdentical']
(EV/'PDF-CHECKS.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
