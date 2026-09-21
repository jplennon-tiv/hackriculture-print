// Generates first-page proofs only. Unapproved heroes are substituted in browser memory.
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {readCollection} from '../../../../hackriculture-data/lib/records.mjs';
const root=new URL('../../../',import.meta.url),dir=new URL('./',import.meta.url);
const jobs=JSON.parse(await fs.readFile(new URL('prompts.json',dir),'utf8'));
const keys=['turnip_swede_radish_troubles',...jobs.map(j=>j.key)];
const data=readCollection('troubles'),reports=[];
const drafts=new Set(keys.filter(key=>data[key].ai_layout.hero_images[0]!==`/images/troubles/heroes/${key}-v1.png`));
await fs.mkdir(new URL('tmp/pdfs/hero-review/',root),{recursive:true});
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:794,height:1123},deviceScaleFactor:1});
 for(const [i,key]of keys.entries()){
  await page.goto('http://127.0.0.1:5173/print/trouble/'+key,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.body.dataset.printReady||document.body.dataset.printError);
  const src=drafts.has(key)?'data:image/png;base64,'+(await fs.readFile(new URL(key+'-v1.png',dir))).toString('base64'):null;
  const report=await page.evaluate(async({src,draft})=>{
   if(document.body.dataset.printError)throw Error(document.body.dataset.printError);
   const output=document.querySelector('[data-source-card]').parentElement.nextElementSibling;
   const intro=output.querySelector('[data-planned-intro]');
   if(src){const img=new Image();img.src=src;await img.decode();img.style.cssText='width:100%;height:100%;object-fit:contain';intro.lastElementChild.replaceChildren(img);}
   output.querySelector('footer span:first-child').textContent=draft?'HERO ARTWORK - AWAITING APPROVAL':'HERO ARTWORK - APPROVED';
   const cols=[...output.querySelectorAll('[data-column]')];
   return {pages:cols.length/2,cards:output.querySelectorAll('[data-key]').length,overflow:cols.filter(c=>c.scrollHeight>c.clientHeight+1).length,warnings:JSON.parse(document.body.dataset.printWarnings||'[]')};
  },{src,draft:drafts.has(key)});
  if(report.pages!==data[key].ai_layout.pages.length||report.overflow||report.warnings.length)throw Error(JSON.stringify({key,...report}));
  reports.push({key,...report,heroApproved:!drafts.has(key)});
  await page.pdf({path:new URL(`tmp/pdfs/hero-review/${String(i+1).padStart(2,'0')}.pdf`,root).pathname,pageRanges:'1',preferCSSPageSize:true,printBackground:true});
  await page.screenshot({path:new URL(key+'-header.png',dir).pathname,clip:{x:0,y:0,width:794,height:355}});
 }
}finally{await browser.close();}
await fs.writeFile(new URL('checks.json',dir),JSON.stringify(reports,null,2));
console.log(reports);
