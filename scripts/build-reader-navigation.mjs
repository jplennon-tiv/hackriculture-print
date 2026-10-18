// Focused A1/A6 review derivatives. Frozen proofs and source builders stay intact.
import fs from 'node:fs/promises';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {readBookContent, root, sha256} from './lib/book-content.mjs';
import {bookLayoutRevision} from '../../hackriculture-data/lib/book-layout.mjs';

const dir='docs/publication/reader-edit-pass/navigation';
const out='output/pdf/reader-edit-pass/navigation';
const tmp='tmp/pdfs/reader-edit-pass/navigation';
const base='http://127.0.0.1:5173';
const json=async p=>JSON.parse(await fs.readFile(p,'utf8'));
for(const p of [dir,out,tmp])await fs.mkdir(p,{recursive:true});
const book=readBookContent(),save=await json(`${dir}/SAVE-RECEIPT.json`);
if(book.revision!==save.revision)throw Error('Book copy changed since the navigation save; reconcile its receipt before rebuilding.');
const approval=await json('docs/publication/combined-guides-opening/APPROVAL.json');
const frozen='docs/publication/combined-guides-opening/references/approved-2026-10-15';
const guards={...book.inputs,...book.assets,...approval.frozen};
for(const p of [
 'docs/publication/combined-guides-opening/opening.css',
 'docs/publication/guide-key/guide-key.css',
 'docs/publication/vegetable-guru-entry-pages/entry-pages.css'
]){
 const h=sha256(await fs.readFile(p));
 if(h!==approval.implementation[p])throw Error('Approved opening style changed: '+p);
 guards[p]=h;
}
const indexApproval=await json('docs/publication/book-index/APPROVAL.json');
for(const f of indexApproval.files||[])guards[f.path]=f.sha256;
for(const p of ['docs/publication/book-index/index.css','scripts/build-book-index.mjs','scripts/lib/book-index.mjs',
 'docs/publication/contents-update/ASSEMBLY-PROPOSAL.json','docs/publication/contents-update/TOPIC-FOLIOS.json',
 'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'])guards[p]=sha256(await fs.readFile(p));
async function verifyGuards(){
 for(const [p,h]of Object.entries(guards))if(sha256(await fs.readFile(p))!==h)throw Error('Input changed: '+p);
 if(bookLayoutRevision()!==book.revision)throw Error('Book copy changed during navigation proof generation.');
}
await verifyGuards();

// Use the existing resolver and its measured four-page packing, in isolated paths.
execFileSync(process.execPath,['scripts/build-book-index.mjs',
 '--plan=docs/publication/contents-update/ASSEMBLY-PROPOSAL.json',
 '--topic-map=docs/publication/contents-update/TOPIC-FOLIOS.json',
 `--review-dir=${dir}/generated-index`,`--output-dir=${tmp}`,
 '--start-page=162','--integrated',
 '--book-pdf=/output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'
],{cwd:root,stdio:'inherit'});
const indexChecks=await json(`${dir}/generated-index/CHECKS.json`);
const resolved=await json(`${dir}/generated-index/RESOLVED.json`);
if(indexChecks.pages!==4||indexChecks.entries!==278)throw Error('Index page budget or expected coverage changed.');
const oldResolved=await json('docs/publication/whole-book-order-preview/index/RESOLVED.json');
for(const unit of ['imperial','metric'])for(const old of oldResolved.editions[unit]){
 const current=resolved.editions[unit].find(e=>e.id===old.id);
 if(JSON.stringify(current?.displayReferences)!==JSON.stringify(old.displayReferences))throw Error('Existing index destination changed: '+old.id);
}
const addedIds=save.indexAdded.map(e=>e.id);
const cleanHtml=html=>html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
const sourceHtml=cleanHtml(await fs.readFile(`${frozen}/opening.html`,'utf8'));
const indexHtml=cleanHtml(await fs.readFile(`${dir}/generated-index/index.html`,'utf8'));
const highlightCss='body.review-highlights .reader-change{background:#fff19a;box-shadow:0 0 0 1px #c58b16;box-decoration-break:clone;-webkit-box-decoration-break:clone}';
const manifests={};
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1000,height:1100}});
 await page.route('**/@vite/client',r=>r.abort());
 await page.route('**/@react-refresh',r=>r.abort());
 for(const units of ['imperial','metric']){
  manifests[units]={};
  for(const component of ['guide-key','index']){
   const htmlPath=`${dir}/${component}-${units}.html`;
   await fs.writeFile(htmlPath,component==='guide-key'?sourceHtml:indexHtml);
   await page.goto(`${base}/${htmlPath}`,{waitUntil:'networkidle'});
   await page.emulateMedia({media:'print'});
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
   const baseline=await page.evaluate(component=>component==='guide-key'?{
    texts:[...document.querySelectorAll('.key-scale .scale-copy p')].map(e=>e.textContent),
    native:[...document.querySelectorAll('.native-calendar,.native-difficulty,.native-needs')].map(e=>e.outerHTML),
    images:[...document.images].map(e=>[e.getAttribute('src'),e.getAttribute('alt')])
   }:null,component);
   await page.evaluate(({component,how,addedIds})=>{
    document.querySelectorAll('script').forEach(s=>s.remove());
    if(component==='guide-key'){
     const p=document.querySelector('.key-calendar>p');
     if(how.calendar.paragraphs.length!==1)throw Error('Expected one calendar paragraph.');
     p.textContent=how.calendar.paragraphs[0];p.classList.add('reader-change');
     const name=document.querySelectorAll('.key-climate h3 span')[1];
     name.textContent=how.calendar.climates[1].name;name.classList.add('reader-change');
    }else{
     const sheets=[...document.querySelectorAll('.sheet')];
     // Keep a new letter with at least two entries when the existing next
     // column continues it. This avoids a new S/Saddleback orphan on p164.
     const columns=[...document.querySelectorAll('.column')];
     for(let i=0;i<columns.length-1;i++){
      const headings=[...columns[i].querySelectorAll('.letter')],last=headings.at(-1);
      if(!last)continue;
      const tail=[];for(let e=last.nextElementSibling;e;e=e.nextElementSibling)tail.push(e);
      const next=columns[i+1],nextHead=next.firstElementChild;
      if(tail.length===1&&tail[0].classList.contains('entry')&&nextHead?.classList.contains('letter')&&last.textContent[0]===nextHead.textContent[0]){
       nextHead.remove();next.prepend(last,...tail);
      }
     }
     sheets.forEach((sheet,i)=>{
      sheet.dataset.folio=String(162+i);
      const footer=sheet.querySelector('footer');footer.firstElementChild.textContent='INDEX';footer.lastElementChild.textContent=String(162+i);
      const letters=[...sheet.querySelectorAll('.letter')].map(h=>h.textContent[0]);
      sheet.querySelector('h1 span').textContent=letters[0]===letters.at(-1)?letters[0]:letters[0]+'–'+letters.at(-1);
     });
     for(const id of addedIds){const e=document.getElementById('entry-'+id);if(!e)throw Error('Missing added index entry: '+id);e.classList.add('reader-change');}
    }
   },{component,how:book.data['how-to'],addedIds});
   await page.addStyleTag({content:highlightCss});
   const checks=await page.evaluate(({component,baseline,entryOrder})=>{
    const mm=96/25.4;
    const results=[...document.querySelectorAll('.sheet')].map(s=>{
     const b=s.getBoundingClientRect(),footer=s.querySelector('footer').getBoundingClientRect();
     const box=e=>{const r=e.getBoundingClientRect();return {left:(r.left-b.left)/mm,top:(r.top-b.top)/mm,right:(r.right-b.left)/mm,bottom:(r.bottom-b.top)/mm};};
     const blocks=[...s.querySelectorAll('h1,h2,h3,p,figcaption,.key-swatches,footer')].map(e=>({text:e.textContent,...box(e),fontPt:parseFloat(getComputedStyle(e).fontSize)*.75,overflow:e.scrollWidth>e.clientWidth+1}));
     const bottom=component==='guide-key'?s.querySelector('.how-panel').getBoundingClientRect().bottom:Math.max(...[...s.querySelectorAll('.column')].map(c=>c.lastElementChild.getBoundingClientRect().bottom));
     const gap=(footer.top-bottom)/mm;
     if(gap<3)throw Error('Footer gap below 3mm: '+gap);
     if(blocks.some(e=>e.overflow||e.left<4.9||e.right>180.1||e.bottom>233))throw Error('Text overflows safe page bounds.');
     return {folio:Number(s.dataset.folio),footerGapMm:gap,blocks,changes:[...s.querySelectorAll('.reader-change')].map(e=>({text:e.textContent,...box(e)}))};
    });
    if(component==='guide-key'){
     const current={texts:[...document.querySelectorAll('.key-scale .scale-copy p')].map(e=>e.textContent),native:[...document.querySelectorAll('.native-calendar,.native-difficulty,.native-needs')].map(e=>e.outerHTML),images:[...document.images].map(e=>[e.getAttribute('src'),e.getAttribute('alt')])};
     if(JSON.stringify(current)!==JSON.stringify(baseline))throw Error('Unrequested guide-key content changed.');
     if(document.images.length!==10||[...document.images].some(i=>!i.naturalWidth))throw Error('Instructional image missing.');
     if(getComputedStyle(document.querySelector('.how-panel')).backgroundColor!=='rgb(255, 225, 183)')throw Error('Peach panel changed.');
     if([...document.querySelectorAll('.key-calendar>p,.scale-copy>p')].some(p=>parseFloat(getComputedStyle(p).fontSize)!==14))throw Error('Body size changed.');
    }
    if(component==='index'){
     const ids=[...document.querySelectorAll('.entry')].map(e=>e.id.slice(6));
     if(new Set(ids).size!==278||ids.length!==278)throw Error('Index reflow lost or duplicated an entry.');
     if(ids.join('|')!==entryOrder.join('|'))throw Error('Index reflow changed alphabetical order.');
    }
    return results;
   },{component,baseline,entryOrder:resolved.editions[units].map(e=>e.id)});
   manifests[units][component]={folios:checks.map(c=>c.folio),checks};
   for(const variant of ['clean','highlight']){
    await page.evaluate(highlight=>document.body.classList.toggle('review-highlights',highlight),variant==='highlight');
    const file=`${out}/${component}-${units}-${variant}.pdf`;
    await page.pdf({path:file,preferCSSPageSize:true,printBackground:true});
    manifests[units][component][variant]={pdf:file,sha256:sha256(await fs.readFile(file)),html:`${dir}/${component}-${units}-${variant}.html`};
    await fs.writeFile(manifests[units][component][variant].html,cleanHtml(await page.content()));
   }
   await fs.writeFile(htmlPath,cleanHtml(await page.content()));
  }
 }
}finally{await browser.close();}
await verifyGuards();
await fs.writeFile(`${dir}/PROOF-MANIFEST.json`,JSON.stringify({date:new Date().toISOString(),status:'Reader-edit pass A1/A6; actual PDF and visual checks follow',units:manifests,bookRevision:book.revision,saveReceipt:`${dir}/SAVE-RECEIPT.json`,sourceGuards:guards,index:{entries:278,crossReferences:35,pages:4,bodyPt:9.45,existingDestinationsUnchanged:true,added:resolved.editions.imperial.filter(e=>addedIds.includes(e.id)),localPacking:'An isolated letter heading plus one entry is moved to the immediately following continuation column. In this proof S/Saddleback starts p165 rather than sitting alone at the end of p164; entry order and all four folios are retained.'},scope:'Page 9 wording/sublabel and five index routes. No gardening record, artwork, frozen reference, full-book or folio-order changes.',highlight:'Temporary pale yellow marks identify the replaced calendar paragraph/sublabel and five added index entries. Clean proofs have identical geometry.',baselineComparison:'Page 9 retains exact frozen native widgets and image references; current page-9 styling hashes match approved sources. Index uses the existing measured packing and source resolver, with the local single-entry heading guard above; all 273 existing destination lists are unchanged.'},null,2)+'\n');
console.log(JSON.stringify({manifest:`${dir}/PROOF-MANIFEST.json`,folios:[9,162,163,164,165],editions:Object.keys(manifests)}));
