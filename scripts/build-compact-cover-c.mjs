// Cover-only review proposals. Preserves A4 sources and existing interiors.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'..');
const dir=path.join(root,'docs/publication/cover-c-compact');
const out=path.join(root,'output/pdf/cover-c-compact');
const py='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const url='http://127.0.0.1:5173';
const rel=p=>path.relative(root,p);
const hash=async p=>createHash('sha256').update(await fs.readFile(p)).digest('hex');
const sourcePaths=['docs/front-matter/cover-studies/assets/contemporary-c.png','docs/front-matter/cover-studies/preview-c.html','public/front-matter/cover-A4.pdf','docs/publication/cover-c-compact/assets/cover-c-text-free-v1.png','output/pdf/book-preparation/bookvault/imperial/vegetable_bean_broad.pdf'];
const badge=(n,label)=>`<div class="badge"><strong>${n}</strong><span>${label}</span></div>`;
const make=(id)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Veg Sorted · ${id} cover proposal</title><link rel="stylesheet" href="covers.css"></head><body>
<section class="canvas ${id}"><main class="panel front"><img class="plate" src="assets/cover-c-text-free-v1.png" alt="Cover C vegetables: carrot, cut purple onion, tomato and peas"><div class="badge-pair">${badge(44,'VEGETABLE<br>GUIDES')}${badge(14,'TROUBLE<br>GUIDES')}</div><h1 class="book-title"><span class="veg">Veg</span><span class="sorted">Sorted</span></h1><p class="subtitle">The vegetable grower’s<br>cheat book</p><p class="coverline">44 at-a-glance growing guides<br>&amp; 14 troubleshooting guides</p></main></section>
<section class="canvas ${id} back"><main class="panel back"><h2 class="back-heading">Good veg.<br><span>Less guesswork.</span></h2><p class="back-intro">From the first sowing to the final harvest, <b>Veg Sorted</b> puts the next useful step close to hand. Find the timings, spacing and growing advice you need, then get back to your patch.</p><div class="features"><section class="feature"><strong>44</strong><h3>At-a-glance growing guides</h3><p>Sowing calendars, variety choices, planting illustrations and practical harvest advice.</p></section><section class="feature"><strong>14</strong><h3>Troubleshooting guides</h3><p>Illustrated symptoms and practical organic ways to act and prevent problems.</p></section></div><p class="peek">A peek inside →</p><div class="spread"><img src="assets/broad-bean-1.png" alt="Existing compact Broad Bean guide, first page"><img src="assets/broad-bean-2.png" alt="Existing compact Broad Bean guide, second page"></div><p class="region">FOR UK VEGETABLE GARDENERS</p><p class="price">£17.50</p><div class="barcode"><b>ISBN / BARCODE</b>Reserved for final metadata</div></main></section>
</body></html>`;
await fs.mkdir(out,{recursive:true});
const sourceHashes=Object.fromEntries(await Promise.all(sourcePaths.map(async p=>[p,await hash(path.join(root,p))])));
const report={status:'Unapproved Cover C compact proposals; separate front/back panels, not supplier-ready wraps',date:'2026-10-07',trimMm:[185,240],mediaMm:[191,246],bleedMm:3,safeInsetMm:5,workingPriceGBP:17.50,sourceHashes,results:[],limitations:['AI-edited artwork is a working derivative, not pixel-identical original art; reconstructed hidden carrot and adjusted proportions need review.','Artwork below 300 ppi at cover size: resolve high-resolution reconstruction after concept selection.','Final spine, stock, pagination, colour conversion, ISBN and author/imprint metadata remain unconfirmed.','Back copy and both compositions need John’s review. Miniature pages are existing imperial Bookvault proofs, not newly exported interiors.']};
const browser=await chromium.launch();
try {
 const page=await browser.newPage({viewport:{width:1100,height:1200}});
 for(const id of ['C1','C2']) {
  const file=path.join(dir,`${id}.html`);await fs.writeFile(file,make(id));
  await page.goto(`${url}/${rel(file)}`);
  await page.emulateMedia({media:'print'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const measured=await page.evaluate(()=>{
   const mm=96/25.4;
   return [...document.querySelectorAll('.panel')].map(panel=>{
    const box=panel.getBoundingClientRect();const text=[];const walker=document.createTreeWalker(panel,NodeFilter.SHOW_TEXT);
    while(walker.nextNode()) {
     const n=walker.currentNode;if(!n.textContent.trim()||!n.parentElement.getClientRects().length||getComputedStyle(n.parentElement).display==='none')continue;
     const r=document.createRange();r.selectNodeContents(n);
     for(const q of r.getClientRects())if(q.width&&q.height)text.push({text:n.textContent,edgeMm:Math.min(q.left-box.left,box.right-q.right,q.top-box.top,box.bottom-q.bottom)/mm,sizePt:parseFloat(getComputedStyle(n.parentElement).fontSize)*.75});
    }
    const bad=text.filter(t=>t.edgeMm<5);if(bad.length)throw Error(JSON.stringify(bad));
    const images=[...panel.querySelectorAll('img')].map(im=>({src:im.getAttribute('src'),pixels:[im.naturalWidth,im.naturalHeight],ppi:Math.min(im.naturalWidth/im.clientWidth,im.naturalHeight/im.clientHeight)*96}));
    return {panel:panel.className,minTextEdgeMm:Math.min(...text.map(t=>t.edgeMm)),minTypePt:Math.min(...text.map(t=>t.sizePt)),images};
   });
  });
  const raw=await page.pdf({preferCSSPageSize:true,printBackground:true});
  const dest=path.join(out,`veg-sorted-${id}-front-back.pdf`);
  const fix=spawnSync(py,['-c',`from pypdf import PdfReader,PdfWriter\nfrom pypdf.generic import RectangleObject\nfrom io import BytesIO\nimport sys\nr=PdfReader(BytesIO(sys.stdin.buffer.read()));w=PdfWriter();mm=72/25.4\nassert len(r.pages)==2\nfor p in r.pages:\n p.add_transformation((1,0,0,1,0,246*mm-float(p.mediabox.height)));p.mediabox=RectangleObject([0,0,191*mm,246*mm]);p.cropbox=RectangleObject(p.mediabox);p.bleedbox=RectangleObject(p.mediabox);p.trimbox=RectangleObject([3*mm,3*mm,188*mm,243*mm]);w.add_page(p)\nw.add_metadata({'/Title':'Veg Sorted ${id} - unapproved front and back cover proposal'});b=BytesIO();w.write(b);sys.stdout.buffer.write(b.getvalue())`],{input:raw,maxBuffer:50*1024*1024});
  if(fix.status!==0)throw Error(fix.stderr.toString());await fs.writeFile(dest,fix.stdout);
  const render=spawnSync('pdftoppm',['-scale-to','1600','-png',dest,path.join(dir,`proof-${id}`)],{encoding:'utf8'});if(render.status!==0)throw Error(render.stderr);
  report.results.push({id,html:rel(file),pdf:rel(dest),sha256:await hash(dest),dom:measured,visualReview:'pending'});
 }
}finally {await browser.close()}
await fs.writeFile(path.join(dir,'CHECKS.json'),JSON.stringify(report,null,2)+'\n');
console.log('Prepared C1 and C2, two cover panels each. Actual PDF review pending.');
