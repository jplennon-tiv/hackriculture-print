// Bounded, isolated five-crop review. Never installed in the ordinary exporter.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {applyHeaderWidgetTrial} from '../src/print/book/header-widget-trial/layout.mjs';
const root=process.cwd(),base='http://127.0.0.1:5173';
const dir='docs/publication/sowing-planting-mockups',out='output/pdf/sowing-planting-mockups';
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const copyPath='../hackriculture-resources/summaries/sowing-planting-five-crop-audit/drafts.json';
const drafts=await read(copyPath),plan=await read('docs/publication/contents-update/ASSEMBLY-PROPOSAL.json');
const navs=(await read('docs/publication/whole-book-order-preview/integration-2026-10-31/FOOTERS.json')).navigation;
const category=await read('docs/publication/whole-book-order-preview/integration-2026-10-31/CATEGORY-LABELS.json');
const only=process.argv.find(a=>a.startsWith('--only='))?.slice(7).split(',');
const units=process.argv.includes('--imperial-only')?['imperial']:['imperial','metric'];
const inputs={},records=[];
const track=async p=>{inputs[p]=sha(await fs.readFile(p));};
await track(copyPath);await track('output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf');
for(const p of ['scripts/build-sowing-planting-mockups.mjs','src/print/book/sowing-planting-mockups/layout.mjs','src/print/book/sowing-planting-mockups/trial.css','src/print/book/sowing-planting-mockups/beetroot-clump.svg','src/print/book/sowing-planting-mockups/leek-clump.svg','src/print/book/workingCopy.ts','src/print/book/compact.css','src/print/book/renderCompact.ts','src/print/book/header-widget-trial/layout.mjs'])await track(p);
for(const crop of drafts.crops)await track(`../hackriculture-data/vegetables/${crop.key}/${crop.key}.json`);
const bundle=await build({entryPoints:['src/print/book/renderCompact.ts'],bundle:true,platform:'node',format:'esm',packages:'external',write:false});
const {prepareCompactBook}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].contents).toString('base64'));
const labelBundle=await build({entryPoints:['src/lib/troubleLabel.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {troubleLabel}=await import('data:text/javascript;base64,'+Buffer.from(labelBundle.outputFiles[0].contents).toString('base64'));
const browser=await chromium.launch();
try{
 for(const unit of units)for(const crop of drafts.crops.filter(c=>!only||only.includes(c.key))){
  const page=await browser.newPage({viewport:{width:1100,height:1200}});
  const key=crop.key,d=plan.editions[unit].documents.find(d=>d.key===key),nav=navs.decisions.find(n=>n.key===key);
  const frozen=['carrot','leek'].includes(key)?`docs/publication/reader-edit-pass/guides/${key}-${unit}.html`:key==='tomato_outdoor'?`tmp/tomato-two-page-trial/${key}-${unit}.html`:null;
  if(frozen){await track(frozen);await page.goto(`${base}/${frozen}`,{waitUntil:'networkidle'});}
  else{
   await page.goto(`${base}/print/vegetable/${key}?units=${unit}`,{waitUntil:'networkidle'});
   await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
   const error=await page.evaluate(()=>document.body.dataset.printError);if(error)throw Error(error);
   await prepareCompactBook(page,base,'vegetable',key,unit,root,{supplier:'bookvault',startPage:d.startPage});
   await page.evaluate(()=>{for(const leaf of document.querySelectorAll('.book-leaf'))leaf.replaceWith(leaf.querySelector('.sheet'));});
  }
  await page.evaluate(applyHeaderWidgetTrial,{circleGapPx:20,titleGapPx:20});
  await page.emulateMedia({media:'print'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  await page.addStyleTag({content:await fs.readFile('src/print/book/sowing-planting-mockups/trial.css','utf8')});
  const labels=await page.locator('.key-risks h3,.pests tbody th,.pests tbody td:first-child strong').allTextContents();
  await page.evaluate(({start,nav,titlePt,labels})=>{
   document.body.classList.add('sowing-review');
   [...document.querySelectorAll('.key-risks h3,.pests tbody th,.pests tbody td:first-child strong')].forEach((e,i)=>e.textContent=labels[i]);
   const category=document.querySelector('.front header>.eyebrow').textContent;
   const h=document.querySelector('.back h1');h.replaceChildren(document.createTextNode('Growing guide · '));const name=document.createElement('span');name.textContent=nav.crop;name.style.color='var(--deep)';h.append(name);h.style.setProperty('font-size',titlePt+'pt','important');const title=document.createElement('div');title.className='mock-title';title.append(h);document.querySelector('.back').append(title);
   [...document.querySelectorAll('.sheet')].forEach((s,i)=>{
    s.classList.toggle('verso',(start+i)%2===0);s.classList.toggle('recto',(start+i)%2!==0);
    const cat=document.createElement('div');cat.className='mock-category';cat.textContent=category.toUpperCase();s.append(cat);
    const f=s.querySelector('footer');f.innerHTML='<span class="section-label">VEGETABLE GUIDES</span><span class="folio"></span>';f.lastElementChild.textContent=String(start+i);
   });
  },{start:d.startPage,nav,titlePt:category.dom.find(r=>r.folio===d.startPage+1).blocks[1].fontPt,labels:labels.map(troubleLabel)});
  const baseline=await page.evaluate(()=>({text:[...document.querySelectorAll('.sheet')].map(s=>s.innerText),blocks:[...document.querySelectorAll('.soil,.planting,.care,.harvest,.pests,.tips,.fact-grid,.calendar')].map(e=>({class:e.className,html:e.outerHTML})),images:[...document.querySelectorAll('.planting img')].map(i=>i.src)}));
  await fs.writeFile(`${dir}/${key}-${unit}-source.html`,await page.content());
  if(process.argv.includes('--baseline-only')){await page.pdf({path:`${out}/${key}-${unit}-source.pdf`,preferCSSPageSize:true,printBackground:true});records.push({key,unit,baseline});await page.close();continue;}
  const {applySowingMockup}=await import('../src/print/book/sowing-planting-mockups/layout.mjs');
  const check=await page.evaluate(applySowingMockup,{crop,unit,start:d.startPage});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const {measureMockup}=await import('../src/print/book/sowing-planting-mockups/layout.mjs');
  const measured=await page.evaluate(measureMockup);
  if(measured.pages.some(p=>p.footerGapMm<2.9))throw Error(`Footer clearance: ${key}/${unit}: ${JSON.stringify(measured.pages)}`);
  if(/\b(?:undefined|NaN)\b/.test(measured.text.join('\n')))throw Error(`Unexpected placeholder: ${key}/${unit}`);
  await fs.writeFile(`${dir}/${key}-${unit}.html`,await page.content());
  const pdf=`${out}/${key}-${unit}.pdf`;await page.pdf({path:pdf,preferCSSPageSize:true,printBackground:true});
  records.push({key,unit,pdf,sourceHtml:frozen,baseline,...check,...measured});
  console.log(JSON.stringify({key,unit,pages:measured.pages.map(p=>({page:p.page,gap:p.footerGapMm})),trial:check.trial.chosen}));await page.close();
 }
}finally{await browser.close();}
for(const [p,h]of Object.entries(inputs))if(sha(await fs.readFile(p))!==h)throw Error('Protected source changed: '+p);
await fs.writeFile(`${dir}/${process.argv.includes('--baseline-only')?'BASELINES':'CHECKS'}.json`,JSON.stringify({status:'Unapproved mock-ups; not installed',date:'2026-11-03',inputs,records},null,2)+'\n');
