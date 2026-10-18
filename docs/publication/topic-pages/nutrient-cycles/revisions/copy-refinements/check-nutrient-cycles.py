"""Check and render the one-page nutrient-cycle proposal with both units printed."""
from pathlib import Path
from collections import Counter
import hashlib, json, logging, re, subprocess
import pdfplumber
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject

ROOT=Path(__file__).resolve().parents[1]
DIR=ROOT/'docs/publication/topic-pages/nutrient-cycles'
LIB=ROOT.parent/'hackriculture-resources/summaries/nutrient-cycles'
POPPLER=Path('/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override/pdftoppm')
logging.getLogger('pdfminer').setLevel(logging.ERROR)
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
read=lambda p:json.loads(p.read_text())
tokens=lambda s:Counter(re.findall(r'\w+|[^\w\s]',s.casefold()))
check=read(DIR/'CHECKS.json');pdf=Path(check['output'])
assert not check['errors'] and not check['violations']
assert sha(LIB/'copy.json')==check['copySha256']
research=read(LIB/'PRACTICAL-RESEARCH-2026-10-18.json')
for source in research['canonical']:assert sha(Path(source['source']))==source['sha256']
approval=read(ROOT/'docs/publication/topic-pages/crop-rotation-planning/APPROVAL-2026-10-18.json')
for source in approval['proofs']:assert sha(ROOT/source['path'])==source['sha256']
baseline=read(ROOT/'docs/publication/reader-edit-pass/BASELINE.json')
assert sha(Path(baseline['pdf']))==baseline['pdf_sha256']
reader=PdfReader(pdf);assert len(reader.pages)==1
page=reader.pages[0];original_box=[float(page.mediabox.width)*25.4/72,float(page.mediabox.height)*25.4/72]
for key in ('mediabox','cropbox','trimbox','bleedbox','artbox'):
    setattr(page,key,RectangleObject([0,0,185*72/25.4,240*72/25.4]))
writer=PdfWriter();writer.add_page(page)
writer.add_metadata({'/Title':'The Vegetable Guru — Nutrient cycles','/Subject':'One proposed follow-on page, folio 158. Dual-unit depth; unchanged 9.45 pt body text.'})
with pdf.open('wb') as f:writer.write(f)
fonts=[]
for font in PdfReader(pdf).pages[0]['/Resources']['/Font'].get_object().values():
    f=font.get_object()
    if f.get('/Subtype')=='/Type3':
        assert f.get('/CharProcs') and all(g.get_object().get_data() for g in f['/CharProcs'].get_object().values())
        fonts.append('Type3 embedded glyph programs')
        continue
    descendants=f.get('/DescendantFonts',[f])
    for child in descendants:
        item=child.get_object();desc=item.get('/FontDescriptor')
        assert desc and any(k in desc.get_object() for k in ('/FontFile','/FontFile2','/FontFile3')),item
    fonts.append(str(f.get('/BaseFont')))
with pdfplumber.open(pdf) as doc:
    actual=doc.pages[0];text=actual.extract_text() or ''
    missing=tokens(check['text'])-tokens(text);extra=tokens(text)-tokens(check['text'])
    assert not missing and not extra,{'missing':dict(missing),'extra':dict(extra)}
    chars=actual.chars
    assert min(c['x0'] for c in chars)>7*72/25.4
    assert max(c['x1'] for c in chars)<169*72/25.4
    assert max(c['bottom'] for c in chars)<234*72/25.4
    sizes=sorted(set(round(c['size'],3) for c in chars))
    assert 9.45 in sizes,sizes
images=DIR/'images';images.mkdir(exist_ok=True)
subprocess.run([str(POPPLER),'-r','150','-png','-singlefile',str(pdf),str(images/'page-158')],check=True,capture_output=True)
report={'status':'Technical PDF checks passed; visual review recorded separately; John’s review pending','pdf':str(pdf),'sha256':sha(pdf),'pages':1,'folio':158,'units':'Identical dual-unit copy for both editions; seaweed depth is 6 inches / 15 cm.','dimensionsMm':[185,240],'originalBrowserMediaMm':original_box,'pageBoxNormalisation':'Exact trim boxes only; no scaling or content movement','allDomTextInPdf':True,'fontsEmbedded':fonts,'fontSizesPt':sizes,'sourceClearanceMm':check['sourceNoteClearanceMm'],'footerClearanceMm':check['footerClearanceMm'],'canonicalRecordsChecked':len(research['canonical']),'canonicalRecordsUnchanged':True,'approvedRotationPdfsUnchanged':True,'fullBookUnchanged':True,'fullBookSha256':baseline['pdf_sha256'],'copySha256':check['copySha256'],'render':str(images/'page-158.png')}
(DIR/'PDF-CHECKS.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'passed':True,'pages':1,'embeddedFonts':fonts,'sourceClearanceMm':check['sourceNoteClearanceMm'],'footerClearanceMm':check['footerClearanceMm']}))
