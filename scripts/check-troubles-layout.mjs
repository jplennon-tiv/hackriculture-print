import {refreshGenerated} from '../../hackriculture-data/lib/records.mjs';
refreshGenerated();
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:688,height:979}});
 const results=[];
 const keys=process.argv.includes('--all')?Object.keys(JSON.parse(await fs.readFile('../hackriculture-data/generated/master/troubles.json','utf8'))):['carrot_and_parsnip_troubles','brassica_troubles','florence_fennel_troubles'];
 for(const key of keys){
  await page.goto('http://127.0.0.1:5173/print/trouble/'+key,{waitUntil:'networkidle'});
  await page.waitForFunction(()=>document.body.dataset.printReady||document.body.dataset.printError);
  const check=await page.evaluate(()=>{
   if(document.body.dataset.printError)throw Error(document.body.dataset.printError);
   const source=document.querySelector('[data-source-card]').parentElement;
   const output=source.nextElementSibling;
   const norm=s=>s.replace(/\s+/g,' ').trim();
   for(const card of source.querySelectorAll('[data-source-card]')){
    const copies=[...output.querySelectorAll('[data-key]')].filter(c=>c.dataset.key===card.dataset.key);
    if(!copies.length)throw Error('Missing card '+card.dataset.key);
    for(const section of card.querySelectorAll('[data-section]')){
     const text=copies.flatMap(c=>[...c.querySelectorAll('[data-section]')]).filter(s=>s.dataset.section===section.dataset.section).map(s=>s.querySelector('p').textContent).join(' ');
     if(norm(text)!==norm(section.querySelector('p').textContent))throw Error('Lost text '+card.dataset.key);
    }
   }
   const columns=[...output.querySelectorAll('[data-column]')];
   if(columns.some(c=>c.scrollHeight>c.clientHeight+1))throw Error('Column overflow');
   for(const column of columns){const footer=column.closest('[class*="page"]').querySelector('footer');if(column.getBoundingClientRect().bottom>footer.getBoundingClientRect().top)throw Error('Footer overlap');}
   return {pages:columns.length/2,cards:output.querySelectorAll('[data-key]').length,warnings:JSON.parse(document.body.dataset.printWarnings||'[]'),colour:getComputedStyle(output.parentElement).getPropertyValue('--trouble-colour')};
  });results.push({key,...check});
 }
 // Isolated browser DOM fixture: exercise oversized text without changing master records.
 const continuation=await page.evaluate(async()=>{
  const {paginateTroubles}=await import('/src/print/troublePagination.ts');
  const source=document.querySelector('[data-source-card]').parentElement,output=source.nextElementSibling;
  const original=source.querySelector('[data-source-card]');
  const expected=('Long entry still retains every word. ').repeat(900).trim();
  original.querySelector('[data-copy]').innerHTML='<section data-section="recognise"><h3>Recognise</h3><p></p></section>';
  original.querySelector('p').textContent=expected;
  for(const card of [...source.querySelectorAll('[data-source-card]')].slice(1))card.remove();
  const result=paginateTroubles(source,output,source.querySelector('[data-template]'));
  const actual=[...output.querySelectorAll('[data-section] p')].map(p=>p.textContent).join(' ');
  if(actual!==expected)throw Error('Continuation lost text');
  if(!output.textContent.includes('(continued)'))throw Error('Missing continuation label');
  if([...output.querySelectorAll('[data-column]')].some(c=>c.scrollHeight>c.clientHeight+1))throw Error('Oversized continuation');
  return result;
 });
 await fs.writeFile('output/pdf/troubles-production-check/layout-checks.json',JSON.stringify({results,continuation},null,2));
 console.log(JSON.stringify({results,continuation},null,2));
}finally{await browser.close();}
