"""Verify and assemble only the isolated affected reader-edit guide proofs."""
from pathlib import Path
import collections, hashlib, json, logging, re, subprocess, sys
import pdfplumber
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject
from PIL import Image

logging.getLogger('pdfminer').setLevel(logging.ERROR)
ROOT=Path.cwd()
DOC=ROOT/'docs/publication/reader-edit-pass/guides'
OUT=ROOT/'output/pdf/reader-edit-pass/guides'
data=json.loads((DOC/'CHECKS.json').read_text())
render_only=next((a.split('=',1)[1].split(',') for a in sys.argv if a.startswith('--render-only=')),None)
current=ROOT/'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'
assert hashlib.sha256(current.read_bytes()).hexdigest()=='39d437e8571d92aca177c31a2da4e2f371dada19a5f66465e4826678ac747cd6'
def tokens(s): return collections.Counter(re.findall(r'\w+|[^\w\s]',s.casefold()))
def delta(a,b): return {'removed':dict(tokens(a)-tokens(b)),'added':dict(tokens(b)-tokens(a))}
def extract(path):
    with pdfplumber.open(path) as pdf:
        return [p.extract_text() or '' for p in pdf.pages]
def sha(path): return hashlib.sha256(Path(path).read_bytes()).hexdigest()
normalisations=data.get('pdfBoxNormalisation',{}).get('files',[])
for r in data['results']:
    for field in ['baselinePdf','pdf','highlighted']:
        path=ROOT/r[field];reader=PdfReader(path);writer=PdfWriter()
        for page in reader.pages:
            old=[float(page.mediabox.width)*25.4/72,float(page.mediabox.height)*25.4/72]
            for name in ['mediabox','cropbox','trimbox','bleedbox','artbox']:setattr(page,name,RectangleObject([0,0,185*72/25.4,240*72/25.4]))
            writer.add_page(page)
        if any(abs(a-b)>.001 for a,b in zip(old,[185,240])):
            with path.open('wb') as f:writer.write(f)
            normalisations.append({'pdf':r[field],'browserMediaMm':old,'reviewMediaMm':[185,240],'contentScaleChanged':False})
    r['sha256']=sha(ROOT/r['pdf']);r['highlightedSha256']=sha(ROOT/r['highlighted'])
data['pdfBoxNormalisation']={'method':'Match current assembly: set exact 185 × 240 mm page boxes without scaling or moving content. Chromium quantises CSS paper dimensions by fractions of a millimetre.','files':normalisations}
(DOC/'CHECKS.json').write_text(json.dumps(data,indent=2)+'\n')
with pdfplumber.open(current) as pdf:
    current_text={f:pdf.pages[f+1].extract_text() for r in data['results'] if r['unit']=='imperial' for f in r['folios']}
checks=[]
for r in data['results']:
    baseline=extract(ROOT/r['baselinePdf']);clean=extract(ROOT/r['pdf']);highlight=extract(ROOT/r['highlighted'])
    assert len(clean)==len(r['folios'])==len(baseline)==len(highlight)
    reader=PdfReader(ROOT/r['pdf'])
    pages=[]
    for i,folio in enumerate(r['folios']):
        p=reader.pages[i]
        assert abs(float(p.mediabox.width)*25.4/72-185)<.1 and abs(float(p.mediabox.height)*25.4/72-240)<.1
        expected_removed=collections.Counter();expected_added=collections.Counter()
        for c in [c for c in r['changes'] if c['folio']==folio]:
            expected_removed.update(tokens(c['expected']));expected_added.update(tokens(c['proposed']))
        expected={'removed':dict(expected_removed-expected_added),'added':dict(expected_added-expected_removed)}
        observed=delta(baseline[i],clean[i]);assert observed==expected,(r['key'],r['unit'],folio,observed,expected)
        assert tokens(clean[i])==tokens(highlight[i])
        comparison=delta(current_text[folio],baseline[i]) if r['unit']=='imperial' else None
        if comparison is not None: assert comparison=={'removed':{},'added':{}},(r['key'],folio,comparison)
        order_identical=re.sub(r'\s+',' ',current_text[folio]).strip()==re.sub(r'\s+',' ',baseline[i]).strip() if r['unit']=='imperial' else None
        pages.append({'folio':folio,'pdfPage':i+1,'dimensionsMm':[185,240],'onlyListedEdits':True,'highlightTextIdentical':True,'currentImperialBaselineDifference':comparison,'currentImperialBaselineNormalisedReadingOrderIdentical':order_identical})
    checks.append({'key':r['key'],'unit':r['unit'],'pages':pages,'sourcePdf':r['sourcePdf'],'sourceSha256':r['sourceSha256'],'cleanPdf':r['pdf'],'cleanSha256':sha(r['pdf']),'highlightedPdf':r['highlighted'],'highlightedSha256':sha(r['highlighted'])})

packs=[]
for unit in ['imperial','metric']:
    selected=[r for r in data['results'] if r['unit']==unit]
    for kind,field in [('clean','pdf'),('highlighted','highlighted')]:
        writer=PdfWriter();mapping=[];offset=0
        for r in selected:
            reader=PdfReader(ROOT/r[field]);writer.append(reader)
            mapping.extend({'reviewPage':offset+i+1,'folio':f,'key':r['key'],'changed':any(c['folio']==f for c in r['changes'])} for i,f in enumerate(r['folios']))
            offset+=len(reader.pages)
        path=OUT/f'reader-guides-{unit}-{kind}.pdf'
        with path.open('wb') as f: writer.write(f)
        packs.append({'unit':unit,'kind':kind,'pdf':str(path.relative_to(ROOT)),'sha256':sha(path),'pageCount':offset,'pages':mapping})

pages_dir=DOC/'pages';pages_dir.mkdir(exist_ok=True)
for r in data['results']:
    if render_only and r['key'] not in render_only:continue
    for kind,field in [('clean','pdf'),('highlighted','highlighted')]:
        dest=DOC/'images'/f"{r['unit']}-{kind}";dest.mkdir(parents=True,exist_ok=True)
        prefix=dest/r['key']
        subprocess.run(['pdftoppm','-r','110','-png',str(ROOT/r[field]),str(prefix)],check=True,capture_output=True)
        for i,folio in enumerate(r['folios']):Path(f'{prefix}-{i+1}.png').replace(dest/f'folio-{folio}.png')
    images=[Image.open(DOC/'images'/f"{r['unit']}-clean"/f'folio-{f}.png').convert('RGB') for f in r['folios']]
    pairs=[(images[:2],r['folios'][:2])]
    if len(images)>2:pairs.append((images[2:],r['folios'][2:]))
    for ims,folios in pairs:
        sheet=Image.new('RGB',(sum(im.width for im in ims),max(im.height for im in ims)),(255,255,255));x=0
        for im in ims:sheet.paste(im,(x,0));x+=im.width
        sheet.save(pages_dir/f"{r['key']}-{r['unit']}-folios-{'-'.join(map(str,folios))}.jpg",quality=90)
manifest={'date':'2026-10-15','status':'proofs_for_review_not_publication_approval','currentBook':str(current.relative_to(ROOT)),'currentBookSha256':sha(current),'canonicalRecordsChanged':False,'frozenSourcesChanged':False,'checks':checks,'packs':packs,'limits':['Current assembled book is imperial. All 19 imperial baseline pages are checked for identical token coverage against their actual current folios before the listed changes. Metric uses the identical retained approved rendering adapters and source inputs, with both-unit before/after checks.','Page 17 and several existing back pages retain their baseline 2.68 mm footer clearance. No body type or leading was reduced.']}
(DOC/'MANIFEST.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'checkedGuideEditions':len(checks),'checkedPages':sum(len(c['pages']) for c in checks),'packs':[{'pdf':p['pdf'],'pages':p['pageCount']} for p in packs]},indent=2))
