// Native cover mock-ups using exact existing page renders. No interior export.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'..');
const dir=path.join(root,'docs/publication/vegetable-guru-back-cover');
const crops={
 title:{file:'carrot-1.png',size:[1553,2000],box:[65,18,1458,275]},
 calendar:{file:'carrot-1.png',size:[1553,2000],box:[84,831,700,248]},
 needs:{file:'carrot-1.png',size:[1553,2000],box:[802,829,600,254]},
 trouble:{file:'troubles-1.png',size:[1243,1600],box:[602,267,516,365]},
 kaleCalendar:{file:'kale-1.png',size:[1553,2000],box:[84,831,700,248]},
 titleWord:{file:'carrot-1.png',size:[1553,2000],box:[63,55,515,196]},
 titleDetail:{file:'kale-1.png',size:[1553,2000],box:[992,0,550,292]},
 kaleTitle:{file:'kale-1.png',size:[1553,2000],box:[60,15,1468,281]}
};
const crop=(name,cls)=>{const c=crops[name];return `<div class="snap ${cls}" data-crop="${name}"><svg viewBox="${c.box.join(' ')}" role="img" aria-label="Actual book excerpt: ${name}" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="clip-${name}"><rect x="${c.box[0]}" y="${c.box[1]}" width="${c.box[2]}" height="${c.box[3]}"/></clipPath></defs><image href="assets/${c.file}" x="0" y="0" width="${c.size[0]}" height="${c.size[1]}" clip-path="url(#clip-${name})"/></svg></div>`};
const lorem=`<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>`;
const title=(id)=>id==='B3'?'The<span>Vegetable</span><span>Guru</span>':'The Vegetable Guru';
const gallery={
 B1:crop('title','title-snap')+crop('calendar','calendar')+crop('needs','needs')+crop('trouble','trouble'),
 B2:crop('title','title-snap')+crop('calendar','calendar')+crop('needs','needs')+crop('kaleCalendar','second-calendar')+crop('titleDetail','detail'),
 B3:'<div class="column"></div><div class="rule"></div>'+crop('titleWord','title-snap')+crop('calendar','calendar')+crop('needs','needs')+crop('trouble','trouble')+crop('kaleTitle','small-art')
};
const make=id=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${id} · The Vegetable Guru back cover</title><link rel="stylesheet" href="back-ideas.css"></head><body><main class="cover ${id}"><div class="bar"><i></i><i></i><i></i></div>${gallery[id]}<h1 class="heading">${title(id)}</h1><p class="subtitle">44 growing guides and<br>14 troubleshooting guides</p><p class="eyebrow">INSIDE THE BOOK</p><div class="blurb">${lorem}</div><p class="price">£17.50</p><div class="barcode"><strong>ISBN / BARCODE</strong>Reserved panel</div><div class="base-line"></div></main></body></html>`;
const report={date:'2026-10-07',status:'Three unapproved back-cover ideas for selected G2 front',selectedFront:'docs/publication/vegetable-guru-grid-variations/assets/G2-centre-title.png',title:'The Vegetable Guru',subtitle:'44 growing guides and 14 troubleshooting guides',priceGBP:17.50,blurb:'Lorem ipsum placeholder, explicitly requested by John',method:'Native editable HTML/CSS with SVG viewBox windows onto unaltered full-page PDF renders; no imagegen, no fake page text, no interior re-export.',crops,results:[]};
const hash=async file=>createHash('sha256').update(await fs.readFile(path.join(root,file))).digest('hex');
report.frontSelection={date:'2026-10-07',selected:'G2 Cream centre',file:report.selectedFront,sha256:await hash(report.selectedFront),userInstruction:"G2 is the best - let's go with that.",scope:'Selected front-cover direction; production artwork and wrap pending.'};
report.sources=[];
for(const [pdf,png,folio] of [['vegetable_carrot.pdf','carrot-1.png',12],['vegetable_kale.pdf','kale-1.png',40],['trouble_carrot_and_parsnip_troubles.pdf','troubles-1.png',116]]){
 const source='output/pdf/book-preparation/bookvault/imperial/'+pdf,render='docs/publication/vegetable-guru-back-cover/assets/'+png;
 report.sources.push({pdf:source,sha256:await hash(source),page:1,folio,render,renderSha256:await hash(render),method:'pdftoppm rasterisation of existing PDF, no guide generation or modification'});
}
report.limitations='1480 × 1920 px preview PNGs, with editable HTML/CSS sources. Not final 300 dpi cover art, not a print PDF or production wrap. Lorem ipsum and blank ISBN panel are placeholders.';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:800,height:1000},deviceScaleFactor:2});
 await page.route('**/@vite/client',route=>route.abort());
 for(const id of ['B1','B2','B3']){
  const html=path.join(dir,`${id}.html`);await fs.writeFile(html,make(id));
  await page.goto(`http://127.0.0.1:5173/${path.relative(root,html)}`);await page.evaluate(()=>document.fonts.ready);
  await page.waitForFunction(()=>[...document.querySelectorAll('svg image')].every(e=>e.href.baseVal));
  // Await each SVG image's source decode before capturing.
  await page.evaluate(()=>Promise.all([...document.querySelectorAll('svg image')].map(e=>new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=reject;i.src=e.href.baseVal}))));
  const checks=await page.evaluate(()=>{
   const cover=document.querySelector('.cover').getBoundingClientRect();const mm=4;
   const text=[...document.querySelectorAll('.heading,.subtitle,.blurb,.price,.barcode,.eyebrow')].map(el=>{const box=el.getBoundingClientRect();return {element:el.className,text:el.innerText,rect:[box.x,box.y,box.width,box.height],edgeMm:Math.min(box.left-cover.left,cover.right-box.right,box.top-cover.top,cover.bottom-box.bottom)/mm,overflow:el.scrollWidth>el.clientWidth+1}});
   if(text.some(t=>t.edgeMm<5||t.overflow))throw Error(JSON.stringify(text));
   const blurb=document.querySelector('.blurb').getBoundingClientRect(),price=document.querySelector('.price').getBoundingClientRect(),barcode=document.querySelector('.barcode').getBoundingClientRect();if(blurb.bottom>price.top-10)throw Error('Blurb overlaps price');
   if(blurb.right>barcode.left&&blurb.bottom>barcode.top-10)throw Error('Blurb overlaps barcode panel');
   return text;
  });
  const png=path.join(dir,`${id}.png`);await page.locator('.cover').screenshot({path:png});
  report.results.push({id,html:path.relative(root,html),png:path.relative(root,png),sha256:createHash('sha256').update(await fs.readFile(png)).digest('hex'),checks,visualReview:'pending'});
 }
}finally{await browser.close()}
await fs.writeFile(path.join(dir,'CHECKS.json'),JSON.stringify(report,null,2)+'\n');
console.log('B1, B2, B3 back-cover mock-ups rendered. Inspect all crops and layouts.');
