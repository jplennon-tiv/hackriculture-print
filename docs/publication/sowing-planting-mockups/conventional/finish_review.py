"""Finish only the second five-crop experiment. No book or data writes."""
from pathlib import Path
import hashlib,html,json,logging,re,subprocess,unicodedata
import pdfplumber
from pypdf import PdfReader,PdfWriter
from pypdf.generic import RectangleObject
from PIL import Image,ImageDraw
logging.getLogger('pdfminer').setLevel(logging.ERROR)
DIR=Path(__file__).resolve().parent
ROOT=DIR.parents[3]
OUT=ROOT/'output/pdf/sowing-planting-mockups/conventional'
data=json.loads((DIR/'CHECKS.json').read_text())
keys=['carrot','beetroot','leek','tomato_outdoor','potato']
names=dict(zip(keys,['Carrot','Beetroot','Leek','Outdoor tomato','Potato']))
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def normal(s):return re.sub(r'\s+','',unicodedata.normalize('NFKC',s))
checks=[]
for rec in data['records']:
    assert all(x['unchanged'] for x in rec['retained'])
    assert rec['fontsReady'] and all(i['loaded'] for i in rec['images'])
    assert all(f['sizePt']==9 for f in rec['methodFonts'])
    assert min(p['footerGapMm'] for p in rec['pages'])>=2.9
    assert not re.search(r'\bclump', ' '.join(rec['text']),re.I)
    assert len(rec['paragraphs'])==len(rec['methods'])
    assert all(any(i['src']==a['src'] for i in rec['images']) for a in rec['originalPlantingImages'])
    path=ROOT/rec['pdf'];r=PdfReader(path);w=PdfWriter()
    assert len(r.pages)==rec['trial']['pages']
    for p in r.pages:
        assert abs(float(p.mediabox.width)*25.4/72-185)<.25
        assert abs(float(p.mediabox.height)*25.4/72-240)<.25
        for a in ('mediabox','cropbox','trimbox'):setattr(p,a,RectangleObject([0,0,185*72/25.4,240*72/25.4]))
        w.add_page(p)
    w.write(path)
    with pdfplumber.open(path) as pdf:
        for paragraph in rec['paragraphs']:
            l,t,r,b=paragraph['boxPt'];text=pdf.pages[paragraph['page']].crop((l-.25,t-.7,r+.25,b+.9)).extract_text(x_tolerance=1,y_tolerance=2) or ''
            assert normal(text)==normal(paragraph['text']),(rec['key'],rec['unit'],text,paragraph['text'])
    subprocess.run(['pdftoppm','-jpeg','-scale-to','1250','-jpegopt','quality=88',str(path),str(DIR/'pages'/f"{rec['key']}-{rec['unit']}")],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    checks.append({'key':rec['key'],'unit':rec['unit'],'pages':rec['trial']['pages'],'sha256':sha(path),'paragraphsVerified':len(rec['paragraphs']),'minFooterGapMm':min(p['footerGapMm'] for p in rec['pages']),'mainTypePt':9,'twoPageShortfallMm':max(0,round(3-rec['trial']['selected']['gap'],1))})
outputs=[]
for unit in ['imperial','metric']:
    w=PdfWriter()
    for key in keys:w.append(str(OUT/f'{key}-{unit}.pdf'),outline_item=names[key])
    w.add_metadata({'/Title':f'Sowing & planting — conventional methods ({unit})','/Subject':'Second experiment. Two-page target; remaining overflow retained for review. Not installed.'})
    w.compress_identical_objects()
    path=OUT/f'five-crop-conventional-{unit}.pdf';w.write(path)
    outputs.append({'path':str(path.relative_to(ROOT)),'pages':len(PdfReader(path).pages),'sha256':sha(path)})
    contact=Image.new('RGB',(1500,3400),'#d8d8d0');draw=ImageDraw.Draw(contact)
    for i,key in enumerate(keys):
        rec=next(r for r in data['records'] if r['unit']==unit and r['key']==key)
        for j in range(rec['trial']['pages']):
            im=Image.open(DIR/'pages'/f'{key}-{unit}-{j+1}.jpg');im.thumbnail((490,640));contact.paste(im,(j*500,i*680));draw.text((j*500+4,i*680+644),f'{names[key]} / {j+1}',fill='black')
    contact.save(DIR/'pages'/f'contact-{unit}.jpg')
for p,h in data['inputs'].items():assert sha(ROOT/p)==h,p
(DIR/'PDF-CHECKS.json').write_text(json.dumps({'status':'Passed; unresolved two-page fit recorded separately','checks':checks,'outputs':outputs,'protectedInputsUnchanged':True},indent=2)+'\n')
parts=[];rows=[]
for key in keys:
    rec=next(r for r in data['records'] if r['unit']=='imperial' and r['key']==key)
    short=max(0,3-rec['trial']['selected']['gap']);count=rec['trial']['pages']
    status='Fits on two pages' if count==2 else f'Another {short:.1f} mm needed for the two-page target'
    rows.append(f'<tr><th><a href="#{key}">{names[key]}</a></th><td>{rec["previousBodyWords"]} → {rec["bodyWords"]}</td><td>{status}</td></tr>')
    imgs=lambda unit:''.join(f'<a href="pages/{key}-{unit}-{n}.jpg"><img src="pages/{key}-{unit}-{n}.jpg" alt="{names[key]}, page {n}"></a>' for n in range(1,count+1))
    previous=''.join(f'<img src="../pages/{key}-imperial-{n}.jpg" alt="First trial page {n}">' for n in range(1,4))
    parts.append(f'<section id="{key}"><h2>{names[key]}</h2><p><strong>{status}.</strong> '+('The facing pair is complete.' if count==2 else 'The complete text is retained across three pages for this fit study. That is an unresolved overflow proof, not a proposed three-page policy.')+f'</p><div class="pages">{imgs("imperial")}</div><details><summary>Compare with the previous draft</summary><div class="previous">{previous}</div></details><details><summary>Metric proof</summary><div class="pages">{imgs("metric")}</div></details></section>')
page='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sowing & planting — second trial</title><style>
*{box-sizing:border-box}body{margin:0;color:#283d31;background:#edf0e8;font:17px/1.5 system-ui,sans-serif}header,main{max-width:1350px;padding:30px;margin:auto}header{background:#faf8ee}h1{font-size:34px;line-height:1.15}h2{font-size:26px}p{max-width:90ch}a{color:#98460d}table{border-collapse:collapse;width:100%;max-width:950px}th,td{text-align:left;padding:9px 16px;border-bottom:1px solid #bac5b4}section{border-top:1px solid #bac5b4;padding:20px 0 35px}.pages{display:grid;grid-template-columns:1fr 1fr;gap:0}.pages img{width:100%;display:block}.pages a:nth-child(3){margin-top:20px}.previous{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.previous img{width:100%}details{margin-top:18px}summary{cursor:pointer;font-weight:700}.tag{font-weight:800;font-size:13px;letter-spacing:.07em}.notice{background:#e3e9d8;padding:14px 20px;border-left:4px solid #638047}@media(max-width:750px){header,main{padding:18px}.pages,.previous{grid-template-columns:1fr}th,td{padding:8px;font-size:14px}}
</style><header><div class="tag">THE VEGETABLE GURU · SECOND SAMPLE TRIAL · NOT INSTALLED</div><h1>Conventional planting, with dates kept in the reference panels</h1><p>Clump growing has been removed throughout these five crop samples. It is reserved for the planned Techniques page. Calendar dates have been removed from Sowing & planting; essential date distinctions remain in Quick facts or the calendar. Readiness, weather conditions, germination and hardening durations remain beside the instructions.</p><p class="notice"><strong>Two pages remain the target.</strong> This pass makes beetroot fit. The other samples still need the space shown below. Their third pages preserve all remaining content for review; they are not an accepted solution for the book. The body type remains 9 pt, and every existing planting picture, variety and problem-table row is retained.</p><p>Short bold lead-ins and several column arrangements were tested. No further copy cuts, smaller body text, table pruning or new artwork have been used. The main book and masters remain unchanged.</p><table><thead><tr><th>Crop</th><th>Planting words: before → now</th><th>Best measured fit</th></tr></thead><tbody>'''+''.join(rows)+'''</tbody></table><p><a href="../../../../output/pdf/sowing-planting-mockups/conventional/five-crop-conventional-imperial.pdf">Imperial PDF</a> · <a href="../../../../output/pdf/sowing-planting-mockups/conventional/five-crop-conventional-metric.pdf">Metric PDF</a> · <a href="README.md">Changes and checks</a></p></header><main>'''+''.join(parts)+'''</main></html>'''
(DIR/'REVIEW.html').write_text(page)
print(json.dumps({'outputs':outputs,'proofs':len(checks),'paragraphsVerified':sum(c['paragraphsVerified'] for c in checks),'fit':checks},indent=2))
