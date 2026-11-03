"""Verify the isolated crop derivatives and build John's complete wording diff."""
from pathlib import Path
from collections import Counter
import json,re,hashlib,html,difflib,subprocess,logging
from pypdf import PdfReader,PdfWriter
import pdfplumber
from PIL import Image,ImageOps,ImageDraw
logging.getLogger('pdfminer').setLevel(logging.ERROR)
ROOT=Path(__file__).resolve().parents[1]
D=ROOT/'docs/publication/soil-acidity-crop-edits'
checks=json.loads((D/'CHECKS.json').read_text())
norm=lambda s:re.sub(r'\s+','',s).lower()
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
MM=72/25.4
book=ROOT/'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'
assert sha(book)=='2fdba2be30bfdb278dbc97f6e9b7346d039328ce10b54a4e9f1a206c1d22ae4d'
main=PdfReader(book)
rows=[]
baseline_comparison=[]
for result in checks['results']:
    if result['unit']=='imperial':
        baseline=PdfReader(ROOT/result['baseline'])
        for i in range(2):
            old=Counter(norm(main.pages[result['start']+i+1].extract_text()))
            new=Counter(norm(baseline.pages[i].extract_text()))
            assert old==new, (result['key'],'baseline text differs from current book',dict(new-old),dict(old-new))
            baseline_comparison.append({'key':result['key'],'folio':result['start']+i,'sameTextCharacters':True,'added':{},'removed':{}})
    for name in ['pdf','highlighted']:
        p=ROOT/result[name];reader=PdfReader(p);assert len(reader.pages)==2
        writer=PdfWriter()
        for page in reader.pages:page.scale_to(185*MM,240*MM);writer.add_page(page)
        writer.page_layout='/TwoPageLeft'
        writer.add_metadata({'/Title':f"The Vegetable Guru — {result['label']} — soil wording review ({result['unit']})",'/Author':'John Lennon'})
        with p.open('wb') as f:writer.write(f)
    actual=PdfReader(ROOT/result['pdf']);marked=PdfReader(ROOT/result['highlighted'])
    for i in range(2):assert norm(actual.pages[i].extract_text())==norm(marked.pages[i].extract_text())
    for change in result['changes']:
        i=change['folio']-result['start']
        assert norm(change['proposed']) in norm(actual.pages[i].extract_text()),(result['key'],'missing new copy',change)
        if result['unit']=='imperial':
            assert norm(change['expected']) in norm(main.pages[change['folio']+1].extract_text()),(result['key'],'not current book wording',change)
    expected=result['baselineText'][:]
    for change in result['changes']:
        i=change['folio']-result['start'];assert expected[i].count(change['expected'])==1
        expected[i]=expected[i].replace(change['expected'],change['proposed'])
    assert expected==result['text'],(result['key'],'unlisted text change')
    assert all(i['loaded'] for i in result['images']) and not result['violations']
    fonts=[]
    for page in actual.pages:
        for ref in page['/Resources'].get('/Font',{}).values():
            f=ref.get_object()
            for part in f.get('/DescendantFonts',[f]):
                part=part.get_object();fd=part.get('/FontDescriptor');fd=fd.get_object() if fd else {}
                embedded=any(k in fd for k in ['/FontFile','/FontFile2','/FontFile3']) or (part.get('/Subtype')=='/Type3' and bool(part.get('/CharProcs')))
                assert embedded;fonts.append(str(part.get('/BaseFont','Embedded glyphs')))
    rows.append({'key':result['key'],'unit':result['unit'],'pages':2,'trimMm':[185,240],'onlyListedCopyChanges':True,'newCopyInPdf':True,'oldCopyVerifiedAgainstCurrentImperialBook':result['unit']=='imperial','fontsEmbedded':True,'pdf':result['pdf'],'sha256':sha(ROOT/result['pdf']),'footerGapsMm':[p['footerGapMm'] for p in result['pages']]})
    subprocess.run(['pdftoppm','-f','2','-l','2','-r','110','-png',str(ROOT/result['pdf']),str(D/'pages'/f"{result['key']}-{result['unit']}")],check=True,capture_output=True)
    print(result['key'],result['unit'],'checked',flush=True)

# Side-by-side wording diff uses complete affected paragraphs and word changes.
def diff(a,b):
    aa=re.findall(r'\S+\s*',a);bb=re.findall(r'\S+\s*',b);old=[];new=[]
    for tag,i,j,k,l in difflib.SequenceMatcher(None,aa,bb).get_opcodes():
        x=html.escape(''.join(aa[i:j]));y=html.escape(''.join(bb[k:l]))
        old.append(f'<del>{x}</del>' if tag in ['replace','delete'] else x)
        new.append(f'<ins>{y}</ins>' if tag in ['replace','insert'] else y)
    return ''.join(old),''.join(new)
imperial=[r for r in checks['results'] if r['unit']=='imperial']
sections=[];plain=['# Vegetable-guide pH and liming changes','', 'Draft for review — 2 November 2026. Twelve guides; sixteen changes. Current book folios are retained. No main-book or canonical gardening data changes.','']
for r in imperial:
    rootlink='../../../'
    sections.append(f'<section id="{r["key"]}"><h2>{html.escape(r["label"])} <small>page {r["start"]+1}</small></h2><p class="links"><a href="{rootlink+r["pdf"]}">Revised pages · imperial</a> · <a href="{rootlink+r["pdf"].replace("-imperial", "-metric")}">metric</a> · <a href="{rootlink+r["highlighted"]}">Highlighted proof</a></p>')
    plain+=['## '+r['label']+' — page '+str(r['start']+1),'']
    for c in r['changes']:
        a,b=diff(c['expected'],c['proposed'])
        sections.append(f'<div class="comparison"><div><h3>Before</h3><p>{a}</p></div><div><h3>Proposed</h3><p>{b}</p></div></div><p class="reason">{html.escape(c["reason"])}</p>')
        plain+=['**Before:** '+c['expected'],'','**Proposed:** '+c['proposed'],'','Reason: '+c['reason'],'']
    sections.append('</section>')
style='body{font:18px/1.55 system-ui,sans-serif;background:#fff8e9;color:#173e2c;margin:0}main{max-width:1150px;margin:auto;padding:32px}h1{font-size:34px;line-height:1.2}h2{font-size:25px}h3{font-size:13px;text-transform:uppercase;letter-spacing:.08em}small{font-size:15px;font-weight:400}a{color:#a44007}section{padding:20px 0;border-top:1px solid #cbd6c0}.comparison{display:grid;grid-template-columns:1fr 1fr;gap:28px}.comparison>div{background:white;border:1px solid #d7dfce;padding:0 20px 12px;border-radius:9px}del{background:#fae0d8;color:#7c2e17;text-decoration-thickness:1px}ins{background:#def0bc;text-decoration:none;font-weight:600}.reason,.links{font-size:15px}.reason{color:#516148}.intro{max-width:850px}nav{display:flex;gap:14px;flex-wrap:wrap;font-size:15px;margin:25px 0}@media(max-width:650px){.comparison{grid-template-columns:1fr}main{padding:18px}}@media print{section{break-inside:avoid}.links,nav{display:none}}'
heading='<h1>Vegetable guides: pH and liming</h1><p class="intro">Sixteen proposed wording changes across twelve guides. Deleted words are marked in the left column; additions are highlighted on the right. These are complete affected paragraphs, checked against the current book. Both unit editions have revised proofs.</p><p class="intro">The other 32 guides retain their existing wording. Soil preferences, pH values and useful deficiency warnings remain. Existing brassica clubroot entries already say to test before liming and that it is not a cure. The new Techniques page explains the general method; no provisional page reference has been added to crop text.</p>'
nav='<nav>'+''.join(f'<a href="#{r["key"]}">{html.escape(r["label"])}</a>' for r in imperial)+'</nav>'
(D/'DIFF.html').write_text('<!doctype html><html lang="en-GB"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Vegetable guide wording comparison</title><style>'+style+'</style><main>'+heading+nav+''.join(sections)+'</main></html>')
(D/'DIFF.md').write_text('\n'.join(plain))
receipt={'date':'2026-11-02','status':'Proposed copy; actual PDFs checked, not author approval','cropCount':len(imperial),'changeCount':sum(len(r['changes']) for r in imperial),'unitEditions':2,'pdfChecks':rows,'currentBookSha256':sha(book),'canonicalAndSourceHashesUnchanged':True,'limits':['No full-book integration or renumbering.','Footer gaps below 3 mm in some retained dense guides are documented against their baseline, not newly worsened.','No changes to canonical gardening records or Troubles pages.']}
for p,h in checks['inputs'].items():assert sha(ROOT/p)==h,p
(D/'VERIFICATION.json').write_text(json.dumps(receipt,indent=2)+'\n')
(D/'BASELINE-COMPARISON.json').write_text(json.dumps(baseline_comparison,indent=2)+'\n')
# Contact sheets are for review; individual page images are preserved above.
for unit in ['imperial','metric']:
    chosen=[r for r in checks['results'] if r['unit']==unit];thumbs=[]
    for r in chosen:
        im=Image.open(D/'pages'/f"{r['key']}-{unit}-2.png").convert('RGB');im.thumbnail((370,500))
        tile=Image.new('RGB',(390,540),'#eee');tile.paste(im,((390-im.width)//2,30));ImageDraw.Draw(tile).text((10,10),r['label']+' / '+str(r['start']+1),fill='#173e2c');thumbs.append(tile)
    sheet=Image.new('RGB',(390*4,540*3),'#ddd')
    for i,im in enumerate(thumbs):sheet.paste(im,((i%4)*390,(i//4)*540))
    sheet.save(D/f'contact-{unit}.png')
print(json.dumps({'crops':receipt['cropCount'],'changes':receipt['changeCount'],'pdfs':len(rows),'diff':str(D/'DIFF.html')}))
