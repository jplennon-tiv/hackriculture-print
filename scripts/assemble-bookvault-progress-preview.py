"""Screen-only assembly: selected covers, seven current openings, saved Bookvault body.

Uses the bundled Python runtime. Keeps native text, samples existing art at 150 dpi.
No supplier files, source images, approved page files or guide content are overwritten.
"""
from pathlib import Path
from io import BytesIO
from datetime import datetime, timezone
import gc
import hashlib
import json
from PIL import Image
from pypdf import PdfReader, PdfWriter, PageObject, Transformation
from pypdf.generic import NameObject
import pypdf.filters
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

ROOT=Path(__file__).resolve().parents[1]
DOC=ROOT/'docs/publication/bookvault-progress-preview'
SCRATCH=ROOT/'tmp/pdfs/bookvault-progress-preview'
OUT=ROOT/'output/pdf/bookvault-progress-preview/the-vegetable-guru-bookvault-progress-preview.pdf'
SOURCE=ROOT/'output/pdf/book-preparation/compact-book-imperial-bookvault-flattened-review.pdf'
FRONT=ROOT/'docs/publication/vegetable-guru-grid-variations/assets/G2-centre-title.png'
BACK=ROOT/'docs/publication/vegetable-guru-back-collage/B5.png'
EXPECTED_SOURCE='c612bf238e2661925dfef0a11c368075b2cc9f95481ded82017fdb262b2fa386'
WIDTH,HEIGHT=185*72/25.4,240*72/25.4
# The trusted local 600 dpi RGB page images decode to ~79 MB; retain a bounded limit.
pypdf.filters.ZLIB_MAX_OUTPUT_LENGTH=120_000_000

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def verify_protected():
    files=json.loads((DOC/'OPENING-CHECKS.json').read_text())['protectedApprovedFiles']
    for item in files:
        assert sha(ROOT/item['path'])==item['sha256'],item['path']

def cover(file):
    data=BytesIO()
    c=canvas.Canvas(data,pagesize=(WIDTH,HEIGHT))
    c.drawImage(ImageReader(str(file)),0,0,width=WIDTH,height=HEIGHT)
    c.showPage();c.save();data.seek(0)
    return PdfReader(data).pages[0]

def trim(page):
    box=page.trimbox
    result=PageObject.create_blank_page(width=WIDTH,height=HEIGHT)
    # Merge clips to the existing trim box, removing the supplier bleed for screen review.
    result.merge_transformed_page(page,Transformation().translate(-float(box.left),-float(box.bottom)))
    return result

verify_protected()
assert sha(SOURCE)==EXPECTED_SOURCE,'Saved source changed'
plan=json.loads((ROOT/'docs/publication/book-preparation/ASSEMBLY-PLAN-BOOKVAULT.json').read_text())['editions']['imperial']
opening_checks=json.loads((DOC/'OPENING-CHECKS.json').read_text())
expected_toc=sorted((d['label'].removesuffix(' Troubles'),d['startPage']) for d in plan['documents'])
assert sorted((i['label'],i['folio']) for i in opening_checks['contents'])==expected_toc
reader=PdfReader(SOURCE)
assert len(reader.pages)==148
writer=PdfWriter()
writer.add_page(cover(FRONT));writer.add_blank_page(WIDTH,HEIGHT)
for name,count in [('opening',3),('entry',4)]:
    opening=PdfReader(SCRATCH/(name+'.pdf'))
    assert len(opening.pages)==count,(name,len(opening.pages))
    for p in opening.pages:
        writer.add_page(trim(p))

resampled=0
for idx in range(7,148):
    page=writer.add_page(trim(reader.pages[idx]))
    # Only the existing body artwork is reduced. Fonts and native text stay vector.
    for key in page.images.keys():
        image=page.images[key]
        if image.image.width>2000 or image.image.height>2000:
            rgb=image.image.convert('RGB')
            rgb.thumbnail((1130,1454),Image.Resampling.LANCZOS)
            image.replace(rgb,quality=82,subsampling=0)
            resampled+=1
            image.indirect_reference.get_object().decoded_self=None
            rgb.close()
    if (idx+1)%20==0:
        print(f'Prepared folio {idx+1}/148',flush=True)
    del page
    gc.collect()
writer.add_blank_page(WIDTH,HEIGHT);writer.add_page(cover(BACK))
assert len(writer.pages)==152
writer.add_outline_item('Front cover — selected G2',0)
writer.add_outline_item('Title',2)
writer.add_outline_item('Publication details — placeholders',3)
writer.add_outline_item('Welcome — lipsum copy',4)
writer.add_outline_item('Contents',5)
writer.add_outline_item('How to use this book',7)
groups={}
for d in plan['documents']:
    section='Growing guides' if d['type']=='vegetable' else 'Troubleshooting guides'
    if section not in groups:groups[section]=writer.add_outline_item(section,d['startPage']+1)
    writer.add_outline_item(d['label'],d['startPage']+1,parent=groups[section])
writer.add_outline_item('Back cover — preferred B5',151)
writer.set_page_label(0,0,prefix='Front cover')
writer.set_page_label(1,1,prefix='Inside front cover')
writer.set_page_label(2,149,style='/D',start=1)
writer.set_page_label(150,150,prefix='Inside back cover')
writer.set_page_label(151,151,prefix='Back cover')
writer.page_layout='/TwoPageRight'
writer.page_mode='/UseOutlines'
writer.add_metadata({'/Title':'The Vegetable Guru — Rough Bookvault progress preview',
                     '/Subject':'185 × 240 mm; imperial; 148 interior pages plus cover leaves. Review only, not a print upload.',
                     '/Creator':'hackriculture-print — existing source assembly, 7 October 2026'})
OUT.parent.mkdir(parents=True,exist_ok=True)
writer.write(OUT)
del writer
gc.collect()
result=PdfReader(OUT)
assert len(result.pages)==152
text_matches=0
for folio in range(8,149):
    assert result.pages[folio+1].extract_text()==reader.pages[folio-1].extract_text(),folio
    text_matches+=1
for folio in [15,69,87,91]:
    p=result.pages[folio+1]
    assert not p.extract_text().strip() and not len(p.images),folio
for p in result.pages:
    assert abs(float(p.mediabox.width)-WIDTH)<.1 and abs(float(p.mediabox.height)-HEIGHT)<.1
verify_protected()
assert sha(SOURCE)==EXPECTED_SOURCE
receipt={
    'createdAtUtc':datetime.now(timezone.utc).isoformat(),
    'status':'Rough screen preview; artwork allocation and all new copy remain for review; not a production upload',
    'pdf':str(OUT.relative_to(ROOT)),'sha256':sha(OUT),'bytes':OUT.stat().st_size,
    'units':'imperial','trimMm':[185,240],'previewPages':152,'interiorPages':148,
    'vegetableGuides':44,'troublesGroups':14,'conditions':220,
    'structure':'Front cover, blank inside front, 148 numbered interior pages, blank inside back, back cover',
    'folioMapping':'PDF page number = printed interior folio + 2. Cover leaves do not change interior pagination.',
    'screenOptimisation':'Existing body artwork downsampled to approximately 150 dpi JPEG quality 82; native text retained. Existing bleed trimmed for screen. Cover concepts retained as supplied rasters.',
    'resampledBodyArtImages':resampled,
    'source':{'path':str(SOURCE.relative_to(ROOT)),'sha256':EXPECTED_SOURCE},
    'covers':[{'path':str(p.relative_to(ROOT)),'sha256':sha(p)} for p in [FRONT,BACK]],
    'checks':{'nativeBodyTextMatchesSourcePages':text_matches,'contentsReferencesMatch':58,'blankFolios':[15,69,87,91],'pageCountAndGeometry':True,'approvedSourcesUnchanged':True},
    'visualReview':{'status':'Pending representative review of the assembled PDF'},
    'scope':'Seven opening pages rendered. No guide re-export, new artwork generation, metric work, canonical-data change or Bookvault account action.'
}
(DOC/'CHECKS.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps({'pdf':receipt['pdf'],'pages':152,'MiB':round(receipt['bytes']/1024**2,1),'bodyTextChecks':text_matches,'imagesReduced':resampled}))
