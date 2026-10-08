// Local front/back concepts, using existing approved artwork. No account actions.
// These are separate panels, not supplier-ready wraps; no guessed spine width.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {chromium} from 'playwright';

const root=path.resolve(import.meta.dirname,'..');
const out=path.join(root,'output/pdf/book-preparation/covers');
const evidence=path.join(root,'docs/publication/book-preparation');
await fs.mkdir(out,{recursive:true});
const fonts=await fs.readFile(path.join(root,'src/print/local-fonts.css'),'utf8');
const art=(name,cls)=>`<img class="${cls}" src="/images/heroes/richer-a/${name}.png" alt="">`;
const icon=(name)=>`<img src="/images/coloured-icons/style-a-v1/${name}.svg" alt="">`;
const css=`${fonts}
@page{size:191.35mm 246.35mm;margin:0}
*{box-sizing:border-box}body{margin:0;background:white;color:#173e2c;font:14px/1.45 'Nunito Sans',sans-serif}
.canvas{width:191.35mm;height:246.35mm;position:relative;overflow:hidden;break-after:page;background:#fff8e9}.canvas:last-child{break-after:auto}
.panel{position:absolute;top:3.175mm;left:3.175mm;width:185mm;height:240mm}
h1,h2,h3,p{margin:0}h1,h2,h3{font-family:'Lilita One';font-weight:400}h1{font-size:80px;line-height:.96;letter-spacing:-1.6px;transform:rotate(-3deg);transform-origin:left center}h1 span{color:#ff781f}
.draft{position:absolute;left:15mm;top:8mm;font-size:9.5px;letter-spacing:1px;font-weight:900}
.title{position:absolute;left:15mm;top:23mm;width:155mm}.subtitle{position:absolute;left:15mm;top:73mm;width:143mm;font-size:23px;line-height:1.22}
.strap{position:absolute;left:15mm;top:99mm;font-size:13px;font-weight:900;background:#064d32;color:#fff8e9;border-radius:12px 24px 15px 18px;padding:9px 15px;transform:rotate(-2deg)}
.author{position:absolute;left:15mm;bottom:13mm;font-size:23px;font-weight:900}
.picture{position:absolute;left:0;right:0;top:109mm;bottom:27mm}.circle{position:absolute;width:183mm;height:124mm;border-radius:50%;background:#dce6cc;right:-20mm;top:0}
.picture img{position:absolute;object-fit:contain}.kale{width:92mm;height:123mm;right:-3mm;top:-12mm;transform:rotate(12deg)}.carrot{width:80mm;height:111mm;left:14mm;top:5mm;transform:rotate(-20deg)}.beetroot{width:87mm;height:95mm;left:64mm;top:17mm;transform:rotate(6deg)}
.back-copy{position:absolute;left:15mm;right:15mm;top:23mm}.back-copy h2{font-size:43px;line-height:1.05;margin-bottom:22px}.back-copy p{font-size:15px;line-height:1.48}.back-copy p+p{margin-top:13px}
.features{margin-top:24px;display:grid;gap:15px}.feature{display:grid;grid-template-columns:34px 1fr;gap:12px;align-items:start}.feature img{width:31px;height:36px;object-fit:contain}.feature h3{font-size:22px;line-height:1.1}.feature p{font-size:13px;margin-top:4px}
.back-end{position:absolute;left:15mm;bottom:17mm;width:84mm;font-size:12px}.back-end b{display:block;font-size:14px;margin-bottom:4px}
.barcode{position:absolute;right:12mm;bottom:12mm;width:52mm;height:32mm;background:white;border:1px dashed #708269;display:flex;align-items:center;justify-content:center;text-align:center;padding:7px;font-size:10px;color:#596456}
.back-accent{position:absolute;right:14mm;bottom:46mm;width:40mm;height:30mm;object-fit:contain}
.B{background:#064d32;color:#fff8e9}.B .subtitle{color:#d6ea9b}.B .title{top:24mm}.B h1{font-size:82px;transform:rotate(-2deg)}.B .strap{background:#ff781f;color:#173e2c;top:100mm}
.B .circle{background:#d6ea9b;right:-28mm;top:5mm;height:146mm;width:190mm}.B .picture{top:114mm;bottom:0}.B .kale{right:36mm;top:-4mm;height:128mm;width:100mm;transform:rotate(-13deg)}.B .carrot{left:98mm;top:9mm;width:87mm;height:120mm;transform:rotate(15deg)}.B .beetroot{display:none}.B .author{z-index:4;color:#173e2c;left:34mm;bottom:13mm}
.B .back-copy h2{color:#d6ea9b}.B .features{gap:19px}.B .feature{border-top:1px solid #9bbb7955;padding-top:13px;grid-template-columns:40px 1fr}.B .feature img{width:38px;height:38px;background:#fff8e9;border-radius:50%;padding:3px}.B .back-end{color:#d6ea9b}.B .barcode{border:none}
`;
const make=(concept)=>{
 const panel=(side,copy)=>`<section class="canvas ${concept}"><div class="panel ${side}"><p class="draft">CONCEPT ${concept} · WORKING TITLE</p>${copy}</div></section>`;
 const front=panel('front',`<div class="title"><h1>Vegetable<br>growing<span>.</span></h1></div><p class="subtitle">A practical garden companion<br>for growers in the UK</p><p class="strap">44 crop guides · illustrated problem solving</p><div class="picture"><div class="circle"></div>${art('kale','kale')}${art('carrot','carrot')}${art('beetroot','beetroot')}</div><p class="author">John Lennon</p>`);
 const back=panel('back',`<div class="back-copy"><h2>Keep the next useful<br>step close to hand.</h2><p>A vegetable patch is full of small decisions: what to grow, when to sow, how much room to leave and what to do when a crop struggles.</p><p>This illustrated companion brings the advice together in a compact book to consult through the growing season.</p><div class="features"><div class="feature">${icon('sow')}<div><h3>Choose and plan</h3><p>44 vegetable guides, ranked varieties and seasonal calendars help you decide what suits your garden.</p></div></div><div class="feature">${icon('plant_spacing')}<div><h3>Grow and observe</h3><p>Clear planting illustrations, practical measurements and timely reminders keep the next jobs in view.</p></div></div><div class="feature">${icon('harvest')}<div><h3>Recognise and respond</h3><p>14 illustrated Troubles guides help you compare symptoms and find practical organic ways to act.</p></div></div></div></div>${art(concept==='A'?'beetroot':'kale','back-accent')}<p class="back-end"><b>For growers in the UK</b>From the first sowing to harvesting<br>and storage.</p><div class="barcode">ISBN / barcode area<br>Reserved pending final metadata<br>and supplier template</div>`);
 return `<!doctype html><html lang="en"><head><meta charset="utf-8"><base href="http://127.0.0.1:5173/"><title>Cover concept ${concept} — unapproved</title><style>${css}</style></head><body>${front}${back}</body></html>`;
};
const browser=await chromium.launch();
const report={status:'Two unapproved front/back concept pairs; no spine and no upload-ready wrap',trimMm:[185,240],panelMediaMm:[191.35,246.35],bleedMm:3.175,sourceLinks:['docs/BOOK-PRINT-STYLE.md','docs/publication/book-preparation/DRAFT-METADATA.json','public/images/heroes/richer-a/','public/images/coloured-icons/style-a-v1/'],editorialAttribution:'AI-assisted design and draft back-cover copy. Existing approved artwork reused; title, subtitle, author presentation and credits await John.',remaining:'Choose concept/title. Derive spine and wrap from final page count and verified supplier stock/template. Review physical colour and all metadata before upload.',results:[]};
try{
 const page=await browser.newPage({viewport:{width:1150,height:1200}});
 for(const concept of ['A','B']){
  const html=make(concept);await page.goto('http://127.0.0.1:5173/print-shell.html');await page.setContent(html);
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(Array.from(document.images,i=>i.decode()));});
  const check=await page.evaluate(()=>Array.from(document.querySelectorAll('.panel'),(panel,i)=>{
   const box=panel.getBoundingClientRect(),walker=document.createTreeWalker(panel,NodeFilter.SHOW_TEXT);let min=Infinity;
   while(walker.nextNode()){
    const n=walker.currentNode;if(!n.textContent.trim()||!n.parentElement.getClientRects().length)continue;
    const range=document.createRange();range.selectNodeContents(n);min=Math.min(min,parseFloat(getComputedStyle(n.parentElement).fontSize)*.75);
    if([...range.getClientRects()].some(r=>r.width&&r.height&&(r.left<box.left+6.4*3.7795||r.right>box.right-6.4*3.7795||r.top<box.top+6.4*3.7795||r.bottom>box.bottom-6.4*3.7795)))throw Error(`Cover panel ${i+1} text outside safety: ${n.textContent}`);
   }
   const copy=panel.querySelector('.back-copy'),end=panel.querySelector('.back-end'),accent=panel.querySelector('.back-accent');if(copy&&copy.getBoundingClientRect().bottom>Math.min(end.getBoundingClientRect().top,accent.getBoundingClientRect().top)-10)throw Error('Back cover copy overlaps lower block or art');
   // All panel images use object-fit:contain; use the drawn image, not its empty container.
   return {panel:i+1,minTypePt:min,images:[...panel.querySelectorAll('img')].filter(e=>getComputedStyle(e).display!=='none').map(e=>({src:e.getAttribute('src'),unrotatedDpi:Math.max(e.naturalWidth/e.clientWidth,e.naturalHeight/e.clientHeight)*96}))};
  }));
  const raw=await page.pdf({width:'191.35mm',height:'246.35mm',preferCSSPageSize:true,printBackground:true});
  const pdf=path.join(out,`concept-${concept}.pdf`),htmlPath=path.join(out,`concept-${concept}.html`);
  const proc=spawnSync('/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',['-c',`from pypdf import PdfReader,PdfWriter\nfrom pypdf.generic import RectangleObject\nfrom io import BytesIO\nimport sys\nr=PdfReader(BytesIO(sys.stdin.buffer.read()));w=PdfWriter();mm=72/25.4\nassert len(r.pages)==2\nfor p in r.pages:\n p.add_transformation((1,0,0,1,0,246.35*mm-float(p.mediabox.height)));p.mediabox=RectangleObject([0,0,191.35*mm,246.35*mm]);p.cropbox=RectangleObject(p.mediabox);p.bleedbox=RectangleObject(p.mediabox);p.trimbox=RectangleObject([3.175*mm,3.175*mm,188.175*mm,243.175*mm]);w.add_page(p)\nw.add_metadata({'/Title':'Compact cover concept ${concept} - unapproved separate panels'});b=BytesIO();w.write(b);sys.stdout.buffer.write(b.getvalue())`],{input:raw,maxBuffer:60*1024*1024});
  if(proc.status!==0)throw Error(proc.stderr.toString());
  await fs.writeFile(pdf,proc.stdout);await fs.writeFile(htmlPath,html);
  report.results.push({concept,pdf:path.relative(root,pdf),html:path.relative(root,htmlPath),sha256:createHash('sha256').update(proc.stdout).digest('hex'),panels:2,check,visualReview:'pending'});
 }
 await fs.writeFile(path.join(evidence,'COVER-CHECKS.json'),JSON.stringify(report,null,2)+'\n');
 console.log('Created two front/back concept PDFs; actual PDF visual and physical checks next.');
}finally{await browser.close();}
