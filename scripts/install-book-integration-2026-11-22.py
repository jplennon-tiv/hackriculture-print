"""Install the checked assembly; preserve approved inputs and the prior book."""
from pathlib import Path
import hashlib, json, os
R=Path(__file__).resolve().parents[1];D=R/'docs/publication/whole-book-order-preview/integration-2026-11-22';B=D.parent
def read(name):return json.loads((D/name).read_text())
def sha(path):
 with path.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
def save(path,value):
 temp=path.with_name(path.name+'.new');temp.write_text(json.dumps(value,indent=2,ensure_ascii=False)+'\n');os.replace(temp,path)
M=read('SOURCES.json');N=read('NATIVE-CHECKS.json');P=read('READING-COPY.json');V=read('VISUAL-CHECKS.json');A=read('IMAGE-RESOLUTION.json')
assert N['pdfPages']==V['pagesRendered']==180 and N['guidePairsIntegrated']==44
assert V['unchangedPixelsOutsideApprovedEdits'] and N['internalLinks']==662
assert P['sourceSHA256']==V['nativeSHA256']==A['nativeSHA256']==N['sha256']
assert V['readingCopySHA256']==P['sha256']
candidate=R/N['candidate'];output=R/M['output'];review=R/P['readingCopy']
assert sha(candidate)==N['sha256'] and sha(review)==P['sha256']
for file,digest in M['inputs'].items():assert sha(R/file)==digest,('Approved source changed',file)
allowed={M['baseline']['sha256']}
if (D/'INTEGRATION-CHECKS.json').exists():allowed.add(read('INTEGRATION-CHECKS.json')['sha256'])
assert sha(output) in allowed,'Current book changed outside this integration; preserve and reconcile first.'
temp=output.with_name(output.name+'.new');temp.unlink(missing_ok=True);os.link(candidate,temp);os.replace(temp,output)
receipt={'date':'2026-11-22','status':'Approved-page integration complete; print-resolution decisions remain',
 'authorisation':M['authorisation'],'pdf':M['output'],'sha256':N['sha256'],'bytes':N['bytes'],
 'readingCopy':P['readingCopy'],'readingCopySHA256':P['sha256'],'readingCopyBytes':P['bytes'],
 'interiorPages':176,'pdfPages':180,'guidePairsIntegrated':44,'guidePagesReused':88,'guidesReexported':0,
 'sourceFilesUnchanged':N['sourceFilesUnchanged'],'nativeExactSourcePages':N['nativeExactPages'],
 'internalLinks':N['internalLinks'],'contentsLinks':84,'openerLinks':77,'bookmarks':len(N['bookmarks']),
 'modifiedFolios':N['modifications'],'resolutionFlags':A['flaggedPlacements'],
 'nativeChecks':'NATIVE-CHECKS.json','readingCopyChecks':'READING-COPY.json','visualChecks':'VISUAL-CHECKS.json',
 'resolutionChecks':'IMAGE-RESOLUTION.json','sourceManifest':'SOURCES.json','previousBook':M['baseline'],
 'supplierFilesChanged':False,'canonicalGardeningRecordsChanged':False,'newArtworkGenerated':False,
 'limits':['Screen review, not supplier approval.','Native artwork retains source resolution; browsing images are smaller.',
 'Title tomato and selected cover raster assets remain below the 200 dpi review threshold.','Publication metadata placeholders remain.']}
save(D/'INTEGRATION-CHECKS.json',receipt);bound='integration-2026-11-22/INTEGRATION-CHECKS.json'
checks={k:v for k,v in receipt.items() if k not in ['resolutionFlags','modifiedFolios']}
checks.update(units='imperial',displayEdition='Traditional measurements edition',trimMm=[185,240],folioMapping='PDF page = printed folio + 2',integrationReceipt=bound,previousFullAssemblyChecks='integration-2026-11-22/before-CHECKS.json',indexEntries=307,indexSeeReferences=36)
save(B/'CHECKS.json',checks)
pages=[{**p,'image':f'integration-2026-11-22/pages/page-{p["pdfPage"]:03}.jpg'} for p in M['pages']];save(B/'PAGE-MAP.json',pages)
save(B/'COMPONENT-CHECKS.json',{'date':receipt['date'],'status':'All exact source bindings verified','pdfSha256':N['sha256'],'integrationReceipt':bound,'sourceFilesUnchanged':N['sourceFilesUnchanged'],'guidePairsIntegrated':44,'nativeSourceComparisons':178,'nativeExactSourcePages':174,'sourceManifest':'integration-2026-11-22/SOURCES.json'})
save(B/'NAVIGATION-PDF-CHECKS.json',{'date':receipt['date'],'status':'All 662 internal destinations matched to expected targets','pdfSha256':N['sha256'],'integrationReceipt':bound,'internalLinks':662,'contentsLinks':84,'newOpenerLinks':77,'bookmarks':N['bookmarks'],'detail':'integration-2026-11-22/NATIVE-CHECKS.json','limits':'Existing index/body destinations preserved; no new index curation.'})
sequence=read('before-SEQUENCE-CHECKS.json');sequence.update(date=receipt['date'],pdfSha256=N['sha256'],integrationReceipt=bound,pdfPages=180,interiorPages=176,vegetableFacingPairs=44,firstLeaves=pages[:11])
sequence.pop('introductionApproval',None);sequence.pop('introductionIntegration',None);save(B/'SEQUENCE-CHECKS.json',sequence)
save(B/'VISUAL-REVIEW.json',{'date':receipt['date'],'status':V['status'],'pdfSha256':N['sha256'],'integrationReceipt':bound,'pagesRendered':180,'nativeSourceComparisons':178,'unchangedPixelsOutsideApprovedEdits':True,'detail':'integration-2026-11-22/VISUAL-CHECKS.json','resolutionReport':'integration-2026-11-22/IMAGE-RESOLUTION.json','inspection':V.get('inspection')})
payload=json.dumps(pages,ensure_ascii=False).replace('<','\\u003c')
viewer='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>The Vegetable Guru — complete book review</title>
<style>*{box-sizing:border-box}body{margin:0;background:#e7e5dd;color:#244a35;font:16px system-ui,sans-serif}header{padding:20px 4vw;background:#faf8ee}h1{font-size:25px;margin:0 0 8px}p{max-width:1000px;line-height:1.5;margin:8px 0}a{color:#244a35}nav{display:flex;flex-wrap:wrap;gap:12px;align-items:center;padding:12px 4vw;position:sticky;top:0;background:#f7f4e8;z-index:1}button,select{font:inherit;padding:8px;border:1px solid #a8b4a5;border-radius:4px;background:white;color:#244a35}button:disabled{opacity:.4}.spread{display:flex;justify-content:center;align-items:flex-start;gap:8px;margin:20px auto;max-width:1250px}.leaf{width:49%;margin:0}.leaf img{display:block;width:100%;box-shadow:0 2px 10px #0003}.leaf figcaption{padding:8px;font-size:13px;min-height:3em}.empty{visibility:hidden}details{margin:25px 4vw}#grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px;margin-top:14px}#grid a{font-size:12px;text-decoration:none}#grid img{width:100%;display:block}.note{font-size:14px;color:#596052}@media(max-width:650px){.spread{gap:3px;margin:12px 3px}h1{font-size:21px}nav{gap:6px}select{max-width:220px}}</style>
<header><h1>The Vegetable Guru</h1><p>Complete book review · 22 November 2026 · Traditional measurements edition</p><p>Approved opening pages, photographic Growing Techniques and all 44 latest vegetable guides, including variety additions. 176 interior pages, plus four cover leaves.</p><p><a href="REVIEW_PDF">Browsing PDF (REVIEW_MB MB)</a> · <a href="NATIVE_PDF">Full-resolution native PDF (NATIVE_MB MB)</a> · <a href="README.md">Sources and checks</a></p><p class="note">Print-resolution review remains for the title-page tomato and selected cover raster artwork. Publication metadata and final supplier specifications remain separate.</p></header>
<nav><button id="prev">← Previous</button><select id="jump" aria-label="Jump to page"></select><button id="next">Next →</button><span id="position" aria-live="polite"></span></nav><main><div class="spread" id="spread"></div><details id="overview"><summary>All pages</summary><div id="grid"></div></details></main>
<script>const pages=PAGE_DATA;let at=0;const spread=document.getElementById('spread'),jump=document.getElementById('jump');const label=p=>p.folio===null?p.label:`${p.folio} · ${p.label}`;
pages.forEach((p,i)=>{const o=document.createElement('option');o.value=i;o.textContent=label(p);jump.append(o)});
function show(n){at=Math.max(0,Math.min(90,n));spread.replaceChildren();for(const i of [at*2-1,at*2]){const f=document.createElement('figure');f.className='leaf';if(i<0||i>=pages.length){f.classList.add('empty')}else{const p=pages[i],a=document.createElement('a'),im=document.createElement('img'),c=document.createElement('figcaption');a.href=p.image;a.target='_blank';im.src=p.image;im.alt=label(p);c.textContent=label(p);a.append(im);f.append(a,c)}spread.append(f)}jump.value=Math.max(0,at*2-1);document.getElementById('prev').disabled=at===0;document.getElementById('next').disabled=at===90;document.getElementById('position').textContent=`Spread ${at+1} of 91`;history.replaceState(null,'',`#spread=${at}`)}
document.getElementById('prev').onclick=()=>show(at-1);document.getElementById('next').onclick=()=>show(at+1);jump.onchange=()=>show(Math.floor((Number(jump.value)+1)/2));document.addEventListener('keydown',e=>{if(e.target.tagName==='SELECT')return;if(e.key==='ArrowLeft')show(at-1);if(e.key==='ArrowRight')show(at+1)});
document.getElementById('overview').addEventListener('toggle',e=>{const g=document.getElementById('grid');if(!e.target.open||g.children.length)return;pages.forEach((p,i)=>{const a=document.createElement('a'),im=document.createElement('img');a.href=`#spread=${Math.floor((i+1)/2)}`;a.onclick=e=>{e.preventDefault();show(Math.floor((i+1)/2));window.scrollTo({top:0,behavior:'smooth'})};im.src=p.image;im.loading='lazy';im.alt=label(p);a.append(im,document.createTextNode(label(p)));g.append(a)})});show(Number(new URLSearchParams(location.hash.slice(1)).get('spread'))||0);</script></html>'''
viewer=viewer.replace('PAGE_DATA',payload).replace('REVIEW_PDF','../../../'+P['readingCopy']).replace('NATIVE_PDF','../../../'+M['output']).replace('REVIEW_MB',str(round(P['bytes']/1e6))).replace('NATIVE_MB',str(round(N['bytes']/1e6)))
(B/'REVIEW.html').write_text(viewer);assert all((B/p['image']).is_file() for p in pages)
print(json.dumps({k:receipt[k] for k in ['status','pdf','sha256','bytes','readingCopyBytes','internalLinks','bookmarks']}))
