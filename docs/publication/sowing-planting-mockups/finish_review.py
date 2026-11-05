"""Check, combine and render the ten bounded crop proofs; never build the book."""
from pathlib import Path
import hashlib, html, json, logging, re, shutil, subprocess, unicodedata
import pdfplumber
from pypdf import PdfReader, PdfWriter
from pypdf.generic import RectangleObject
logging.getLogger('pdfminer').setLevel(logging.ERROR)

ROOT=Path(__file__).resolve().parents[3]
DIR=Path(__file__).resolve().parent
OUT=ROOT/'output/pdf/sowing-planting-mockups'
data=json.loads((DIR/'CHECKS.json').read_text())
keys=['carrot','beetroot','leek','tomato_outdoor','potato']
labels=dict(zip(keys,['Carrot','Beetroot','Leek','Outdoor tomato','Potato']))
def digest(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def normal(s): return re.sub(r'\s+','',unicodedata.normalize('NFKC',s)).replace('−','-')
checks=[]
for rec in data['records']:
    assert all(x['unchanged'] for x in rec['retained'])
    assert rec['fontsReady'] and all(x['loaded'] for x in rec['images'])
    assert all(x['sizePt']==9 for x in rec['methodFonts'])
    assert all(x['footerGapMm']>=2.9 for x in rec['pages']), (rec['key'],rec['unit'],rec['pages'])
    assert all(any(a['src']==b['src'] for b in rec['images']) for a in rec['originalPlantingImages'])
    path=ROOT/rec['pdf']
    reader=PdfReader(path)
    original_boxes=[[float(p.mediabox.width)*25.4/72,float(p.mediabox.height)*25.4/72] for p in reader.pages]
    # Match the existing review-finishing workflow: correct Chromium's sub-mm
    # MediaBox rounding without scaling the text or artwork.
    assert all(abs(w-185)<.25 and abs(h-240)<.25 for w,h in original_boxes)
    writer=PdfWriter()
    for p in reader.pages:
        for attr in ('mediabox','cropbox','trimbox'): setattr(p,attr,RectangleObject([0,0,185*72/25.4,240*72/25.4]))
        writer.add_page(p)
    writer.write(path)
    with pdfplumber.open(path) as pdf:
        assert len(pdf.pages)==3
        for p in pdf.pages:
            assert abs(float(p.width)*25.4/72-185)<.15 and abs(float(p.height)*25.4/72-240)<.15
        for paragraph in rec['paragraphs']:
            p=pdf.pages[paragraph['page']]
            l,t,r,b=paragraph['boxPt']
            extracted=p.crop((l-.25,t-.7,r+.25,b+.7)).extract_text(x_tolerance=1,y_tolerance=2) or ''
            assert normal(extracted)==normal(paragraph['text']), (rec['key'],rec['unit'],extracted,paragraph['text'])
    subprocess.run(['pdftoppm','-jpeg','-scale-to','1250','-jpegopt','quality=88',str(path),str(DIR/'pages'/f"{rec['key']}-{rec['unit']}")],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    checks.append({'key':rec['key'],'unit':rec['unit'],'pdf':str(path.relative_to(ROOT)),'sha256':digest(path),'pages':3,'originalChromiumBoxesMm':original_boxes,'finishedTrimMm':[185,240],'paragraphsRecoveredExactly':len(rec['paragraphs']),'minimumFooterGapMm':min(p['footerGapMm'] for p in rec['pages']),'mainProsePt':9,'originalPlantingArtRetained':True,'retainedSectionsUnchanged':True})

outputs=[]
for unit in ['imperial','metric']:
    w=PdfWriter()
    for key in keys:
        w.append(str(OUT/f'{key}-{unit}.pdf'),outline_item=labels[key])
    w.add_metadata({'/Title':f'Sowing & planting — five crop mock-ups ({unit})','/Subject':'Unapproved layout trial. Local numbering; not a revised book or final pagination.','/Author':'John Lennon — The Vegetable Guru'})
    if hasattr(w,'compress_identical_objects'): w.compress_identical_objects()
    path=OUT/f'five-crop-mockups-{unit}.pdf';w.write(path)
    assert len(PdfReader(path).pages)==15
    outputs.append({'unit':unit,'path':str(path.relative_to(ROOT)),'sha256':digest(path),'pages':15})

# The "before" images are renders of the actual current main PDF, not a reconstruction.
for i,key in enumerate(keys):
    for j in range(2):
        source=ROOT/'tmp/sowing-planting-mockups'/f'current-{i*2+j+1:02d}.jpg'
        shutil.copyfile(source,DIR/'pages'/f'{key}-current-{j+1}.jpg')

for p,h in data['inputs'].items(): assert digest(ROOT/p)==h, p
(DIR/'PDF-CHECKS.json').write_text(json.dumps({'status':'Passed; mock-ups remain unapproved','checks':checks,'outputs':outputs,'protectedInputsUnchanged':True,'visualReview':'All 30 pages reviewed as rendered contacts; selected planting pages and dense openings inspected at reading size. Substantial trailing whitespace remains intentional in this trial.'},indent=2)+'\n')

notes={
 'carrot':'The clearest warning about page economy: the complete advice is easy to follow, but three pages leave too much spare space. The three original drawings remain together as a compact sequence.',
 'beetroot':'Direct sowing and early module clumps have separate paths. A provisional diagram shows the intact shared rootball. The opening is the tightest of the five; all five varieties and all eight problem rows remain.',
 'leek':'Nursery-bed singles and young module clumps are separated. The deep individual holes belong only to the first method. The new calendar band is explicitly for moving nursery-bed singles.',
 'tomato_outdoor':'Sowing, pricking out/potting on, hardening off and final planting now have their own headings. The current pot illustration covers growing on; a future close-up of pricking out would add more instructional value.',
 'potato':'Preparation and timing sit above the main ground method and the two alternatives. Quick facts now says “Plant tubers”. A small chitting or container sequence would be the next useful illustration, if this layout is taken forward.'}
parts=[]
for key in keys:
    images=''.join(f'<a href="pages/{key}-imperial-{n}.jpg" target="_blank"><img src="pages/{key}-imperial-{n}.jpg" alt="{labels[key]}, trial page {n}"><span>Trial page {n} of 3</span></a>' for n in range(1,4))
    before=''.join(f'<img src="pages/{key}-current-{n}.jpg" alt="Current {labels[key]} page {n}">' for n in range(1,3))
    metric=''.join(f'<a href="pages/{key}-metric-{n}.jpg" target="_blank"><img src="pages/{key}-metric-{n}.jpg" alt="Metric trial page {n}"></a>' for n in range(1,4))
    parts.append(f'<section id="{key}"><h2>{labels[key]}</h2><p>{html.escape(notes[key])}</p><div class="pages">{images}</div><details><summary>Compare with the current book spread</summary><div class="before">{before}</div></details><details><summary>Metric version</summary><div class="pages">{metric}</div></details></section>')
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Sowing & planting — five crop mock-ups</title><style>
*{box-sizing:border-box}body{margin:0;background:#eceee7;color:#283b30;font:17px/1.5 system-ui,sans-serif}header,main{max-width:1500px;margin:auto;padding:30px}header{background:#faf8f0}h1{font-size:34px;line-height:1.12;margin:12px 0}h2{font-size:27px;margin-bottom:8px}p{max-width:90ch}a{color:#8d430e}.tag{font-weight:750;letter-spacing:.08em;font-size:13px}nav{display:flex;gap:20px;flex-wrap:wrap}section{padding:20px 0 35px;border-top:1px solid #bac5b5}.pages{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;align-items:start}.pages a{display:block;text-decoration:none;font-size:13px}.pages img,.before img{display:block;width:100%;height:auto;box-shadow:0 2px 8px #0002}.pages span{display:block;margin-top:5px}details{margin-top:20px}summary{cursor:pointer;font-weight:700}.before{display:grid;grid-template-columns:1fr 1fr;gap:0;max-width:1100px;margin-top:15px}details .pages{margin-top:15px}.notice{padding:14px 18px;background:#e6eadd;border-left:4px solid #58724a}@media(max-width:800px){header,main{padding:20px}.pages{grid-template-columns:1fr}.before{grid-template-columns:1fr}}
</style><header><div class="tag">THE VEGETABLE GURU · LAYOUT TRIAL · 3 NOVEMBER 2026</div><h1>Sowing & planting: five crop mock-ups</h1><p>The complete replacement advice, with clearer stages, selective Quick facts and calendar changes, the existing planting artwork, and two provisional clump diagrams. The book and master data are unchanged.</p><p class="notice">This trial gives each crop three pages. The first two face each other; the third turns over onto the next spread. The three images below are a comparison strip, not a three-page spread. Local numbers are for review only. These are not proposed final book folios.</p><p><strong>The trade-off:</strong> the text is clearer at the normal 9 pt body size, but each extra page leaves substantial unused space. Carrot is particularly uneconomical. The trial does not prove that every two-page alternative is impossible. A shared technique explanation or a more substantial guide redesign remains a choice for discussion.</p><p><a href="../../../output/pdf/sowing-planting-mockups/five-crop-mockups-imperial.pdf">Open all five imperial mock-ups (15 pages)</a> · <a href="../../../output/pdf/sowing-planting-mockups/five-crop-mockups-metric.pdf">Metric proof (15 pages)</a> · <a href="README.md">Notes and checks</a></p><nav>'''+''.join(f'<a href="#{k}">{labels[k]}</a>' for k in keys)+'''</nav></header><main>'''+''.join(parts)+'''</main></html>'''
(DIR/'REVIEW.html').write_text(page)
print(json.dumps({'proofs':len(checks),'paragraphsVerified':sum(x['paragraphsRecoveredExactly'] for x in checks),'outputs':outputs},indent=2))
