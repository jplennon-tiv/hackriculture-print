"""Check only the proposed rotation section as a two-page facing spread."""
from pathlib import Path
from collections import Counter
import hashlib, json, logging, re, subprocess
import pdfplumber
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
DIR=ROOT/'docs/publication/topic-pages/crop-rotation-planning'
OUT=ROOT/'output/pdf/crop-rotation-planning'
LIB=ROOT.parent/'hackriculture-resources/summaries/crop-rotation-planning'
POPPLER=Path('/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm')
logging.getLogger('pdfminer').setLevel(logging.ERROR)
read=lambda p:json.loads(p.read_text())
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
tokens=lambda t:Counter(re.findall(r'\w+|[^\w\s]',t.casefold()))
normal=lambda t:re.sub(r'\s+','',t)
checks=read(DIR/'CHECKS.json');copy=read(LIB/'copy.json')
baseline=read(ROOT/'docs/publication/reader-edit-pass/BASELINE.json')
canonical={p:h for p,h in baseline['source_hashes'].items() if '/vegetables/' in p or '/troubles/' in p}
assert len(canonical)==58
assert all(sha(Path(p))==h for p,h in canonical.items())
assert sha(Path(baseline['pdf']))==baseline['pdf_sha256']
assert sha(LIB/'copy.json')==checks['copySha256']
source_copy=read(Path(copy['sources']['readerRotation']['path']))
old=read(Path(copy['sources']['oldRotation']['path']))
old=next(p for p in old['pages'] if p['id']=='rotation')
o1=next(p for p in source_copy['pages'] if p['id']=='rotation')
succession=copy['pages'][1]['succession']
assert succession['crops']==o1['succession']['crops']
assert succession['text'].startswith(o1['succession']['text'].split(' Choose a suitable variety')[0])
assert succession['text'].endswith('See Kale, pages 40–41.')
assert copy['pages'][1]['successionTitle']=='One bed, two complementary crops in the same year'
assert copy['pages'][0]['families']==o1['families']
assert copy['pages'][0]['threeYear']['title']==old['diagramTitle']
assert copy['pages'][0]['threeYear']['crops']==old['rotation']
assert copy['pages'][0]['closing']['title']==old['closing']['title']
assert copy['pages'][0]['closing']['text']=='Clubroot and onion white rot, to take the two worst examples, can remain in soil for many years. A short circuit round the beds does not make infected ground clean. Keep contaminated soil off clean beds, and do not put infected allium debris into good compost.'
assert copy['pages'][0]['record']==old['blocks'][0]
reports=[]
for edition in checks['results']:
    unit=edition['units'];pdf=Path(edition['output'])
    reader=PdfReader(pdf);assert len(reader.pages)==2
    writer=PdfWriter();old_boxes=[]
    for page in reader.pages:
        old_boxes.append([float(page.mediabox.width)*25.4/72,float(page.mediabox.height)*25.4/72])
        for key in ('mediabox','cropbox','trimbox','bleedbox','artbox'):
            setattr(page,key,RectangleObject([0,0,185*72/25.4,240*72/25.4]))
        writer.add_page(page)
    writer.page_layout='/TwoPageLeft'
    writer.add_metadata({'/Title':f'The Vegetable Guru — Crop rotation & planning ({unit} proof)','/Subject':'Two proposed facing pages: three-year family rotation, one-bed succession, four-bed rotation and a small-plot alternative. Folios 156–157.'})
    for i,page in enumerate(copy['pages']):writer.add_outline_item(page['qualifier'],i)
    with pdf.open('wb') as f:writer.write(f)
    pages=[]
    with pdfplumber.open(pdf) as actual:
        for i,dom in enumerate(edition['pages']):
            page=actual.pages[i];text=page.extract_text() or ''
            difference={'missing':dict(tokens(dom['text'])-tokens(text)),'extra':dict(tokens(text)-tokens(dom['text']))}
            assert difference=={'missing':{},'extra':{}},(unit,i,difference)
            chars=page.chars
            assert chars and min(c['x0'] for c in chars)>7*72/25.4
            assert max(c['x1'] for c in chars)<178*72/25.4
            assert max(c['bottom'] for c in chars)<234*72/25.4
            pages.append({'folio':dom['folio'],'allDomTextInPdf':True,'dimensionsMm':[185,240], 'fontSizesPt':sorted(set(round(c['size'],3) for c in chars)), 'sourceClearanceMm':dom['sourceNoteClearanceMm'],'footerClearanceMm':dom['footerClearanceMm']})
        row=next(b for b in edition['pages'][1]['blocks'] if b['text']==succession['text'])
        crop=actual.pages[1].crop(tuple(v*72/25.4 for v in (row['leftMm']-.2,row['topMm']-.2,row['rightMm']+.2,row['bottomMm']+.2)))
        assert normal(crop.extract_text())==normal(succession['text'])
        combined=' '.join(p.extract_text() for p in actual.pages)
        for removed in ['winter carrots','Before eating dried beans','Make a small plot work harder','compulsory three-year prescription']:
            assert removed not in combined
    dest=DIR/'images'/unit;dest.mkdir(parents=True,exist_ok=True)
    subprocess.run([str(POPPLER),'-r','120','-png',str(pdf),str(dest/'page')],check=True,capture_output=True)
    for a,b,n in [(1,2,1)]:
        left=Image.open(dest/f'page-{a}.png').convert('RGB');right=Image.open(dest/f'page-{b}.png').convert('RGB')
        spread=Image.new('RGB',(left.width+right.width+12,max(left.height,right.height)), '#c5cdbb')
        spread.paste(left,(0,0));spread.paste(right,(left.width+12,0));spread.save(dest/f'spread-{n}.png')
    reports.append({'unit':unit,'pdf':str(pdf),'sha256':sha(pdf),'pages':pages,'browserMediaMm':old_boxes,'pageBoxNormalisation':'Exact 185 × 240 mm boxes; no scaling or moving page content.','successionExactPdfText':True})
assets={}
for name in ['pea','cabbage','carrot','bean_broad','kale']:
    p=ROOT/f'public/images/heroes/richer-a/{name}.png';assets[str(p.relative_to(ROOT))]=sha(p)
report={'status':'Technical proof checks passed; new section still requires John’s review.','results':reports,'preserved':{'canonicalRecords':58,'allCanonicalHashesUnchanged':True,'fullBookSha256':baseline['pdf_sha256'],'fullBookUnchanged':True,'threeYearGraphicRetained':True,'householdPageRemoved':True,'successionTimingAndCropsExact':True,'successionCopyRevisedAtJohnRequest':'2026-10-18','eightFamilyRowsExact':True,'recordKeepingExact':True,'diseaseWarningMatchesJohnRevision':True},'assets':assets,'sourceCopies':copy['sources'],'copySha256':sha(LIB/'copy.json'),'cssSha256':sha(DIR/'draft.css'),'scope':'Only two proposed technique pages, both unit editions. Focused nitrogen research recorded separately; no reader simulations or whole-book assembly.'}
(DIR/'PDF-CHECKS.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'passed':True,'units':['imperial','metric'],'pagesPerPdf':2,'canonicalRecordsUnchanged':58,'fullBookUnchanged':True}))
