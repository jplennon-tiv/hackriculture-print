import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {build} from 'esbuild';
import {applyHeaderWidgetTrial} from '../../src/print/book/header-widget-trial/layout.mjs';
import {readRecord} from '../../../hackriculture-data/lib/records.mjs';

const read = async p=>JSON.parse(await fs.readFile(p));
const dir='tmp/sowing-rollout', base='http://127.0.0.1:5173';
const whole='docs/publication/whole-book-order-preview';
const map=await read(whole+'/PAGE-MAP.json');
const navs=(await read(whole+'/NAVIGATION.json')).pages;
const order=(await read('docs/publication/contents-update/ASSEMBLY-PROPOSAL.json')).editions.imperial.documents;
const sample=['beetroot','carrot','leek','potato','tomato_outdoor'];
const crops=map.filter(p=>p.kind==='vegetable' && p.folio%2===0 && !sample.includes(p.key));
const live=await build({entryPoints:['src/print/book/renderCompact.ts'],bundle:true,platform:'node',format:'esm',packages:'external',write:false});
const {prepareCompactBook}=await import('data:text/javascript;base64,'+Buffer.from(live.outputFiles[0].contents).toString('base64'));
const labels=await build({entryPoints:['src/lib/troubleLabel.ts'],bundle:true,platform:'node',format:'esm',write:false});
const {troubleLabel}=await import('data:text/javascript;base64,'+Buffer.from(labels.outputFiles[0].contents).toString('base64'));
const sha=b=>createHash('sha256').update(b).digest('hex');
const exists=p=>fs.access(p).then(()=>true,()=>false);
const browser=await chromium.launch();
const fails=[];
try {
 for(const unit of ['imperial','metric']) for(const {key,folio,label} of crops) {
  const path=dir+'/'+key+'-'+unit;
  if(await exists(path+'.json') && await exists(path+'.html')) continue;
  const page=await browser.newPage({viewport:{width:1100,height:1200}});
  try {
   const frozen='docs/publication/reader-edit-pass/guides/'+key+'-'+unit+'.html';
   const onion='tmp/vegetable-two-page-trial/onions_and_shallots-'+unit+'.html';
   const src=await exists(frozen)?frozen:key==='onion_shallot'?onion:null;
   const slug=order.find(d=>d.key===key).label.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
   if(src){
    const url=base+'/'+src;const html=(await fs.readFile(src,'utf8')).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
    await page.route(url,r=>r.fulfill({contentType:'text/html',body:html}));await page.goto(url);
   } else {
    await page.goto(base+'/print/vegetable/'+slug+'?units='+unit);await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
    await prepareCompactBook(page,base,'vegetable',slug,unit,process.cwd(),{supplier:'bookvault',startPage:folio});
    await page.evaluate(()=>{for(const leaf of document.querySelectorAll('.book-leaf')) leaf.replaceWith(leaf.querySelector('.sheet'));});
   }
   await page.emulateMedia({media:'print'});
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
   await page.evaluate(applyHeaderWidgetTrial,{circleGapPx:20,titleGapPx:20});
   for(const css of ['trial.css','conventional/trial.css'])await page.addStyleTag({content:await fs.readFile('src/print/book/sowing-planting-mockups/'+css,'utf8')});
   const selector='.key-risks h3,.pests tbody th,.pests tbody td:first-child strong';
   const names=(await page.locator(selector).allTextContents()).map(troubleLabel);
   const record=await page.evaluate(({folio,label,selector,names})=>{
    const q=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
    document.body.classList.add('sowing-review');all(selector).forEach((e,i)=>e.textContent=names[i]);
    const category=q('.front header>.eyebrow').textContent;
    all('.sheet').forEach((s,i)=>{
     s.classList.toggle('verso',i%2===0);s.classList.toggle('recto',i%2===1);
     const cat=document.createElement('div');cat.className='mock-category';cat.textContent=category.toUpperCase();s.append(cat);
     s.querySelector('footer').innerHTML='<span class="section-label">VEGETABLE GUIDES</span><span class="folio">'+(folio+i)+'</span>';
    });
    const title=document.createElement('div');title.className='mock-title';const h=q('.back h1');h.replaceChildren('Growing guide · ');const crop=document.createElement('span');crop.textContent=label;crop.style.color='var(--deep)';h.append(crop);title.append(h);q('.back').append(title);
    const list=s=>all(s).map(e=>e.innerText);
    return {pages:all('.sheet').length,plant:q('.planting').innerText,facts:list('.fact-grid article'),calendar:q('.calendar').innerText,care:list('.care li'),soil:list('.soil li'),harvest:list('.harvest li'),tips:q('.tips').innerText,intro:q('.intro').innerText,art:all('.planting img').map(i=>i.getAttribute('src')),pests:list('.pests tbody tr'),stages:list('.stages article h3')};
   },{folio,label,selector,names});
   const html=(await page.content()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');await fs.writeFile(path+'.html',html);
   const master='../hackriculture-data/vegetables/'+key+'/'+key+'.json';
   const canonical=readRecord('vegetables',key);
   if (!canonical.print_planting || !canonical.calendar) throw Error('Missing source companion or calendar: '+key);
   const nav=navs.find(p=>p.folio===folio+1);
   await fs.writeFile(path+'.json',JSON.stringify({key,label,unit,folio,source:src||'compact:'+slug,masterHash:sha(await fs.readFile(master)),htmlHash:sha(html),links:nav.links.map(l=>({text:l.text,pdfPage:map.find(p=>p.folio===l.target).pdfPage})),...record},null,2));
   console.log(key,unit,record.pages);
  }catch(e){console.error('FAILED',key,unit,String(e));fails.push(key);}finally{await page.close();}
 }
}finally{await browser.close();}
if(fails.length)process.exitCode=1;
