import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('./',import.meta.url);
const browser=await chromium.launch();const results=[];
try{
 const page=await browser.newPage({viewport:{width:850,height:1180},deviceScaleFactor:1.5});
 for(const theme of ['a','b','c']){
  await page.goto(new URL(theme+'.html',root).href,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{await Promise.all([document.fonts.load('400 80px "Lilita One"'),document.fonts.load('400 16px "Nunito Sans"')]);await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const result=await page.evaluate(()=>({fonts:document.fonts.check('400 80px "Lilita One"')&&document.fonts.check('400 16px "Nunito Sans"'),images:[...document.images].every(i=>i.complete&&i.naturalWidth),pages:[...document.querySelectorAll('.sheet')].map(e=>{const r=e.getBoundingClientRect();const f=e.querySelector('footer').getBoundingClientRect();const text=[...e.querySelectorAll('p,h2,h3,.measures,.timings,.needs')];return {width:r.width,height:r.height,textCount:e.innerText.trim().split(/\s+/).length,outside:text.filter(t=>{const b=t.getBoundingClientRect();return b.bottom>f.top-5||b.left<r.left||b.right>r.right}).map(t=>({text:t.innerText.slice(0,75),bottom:t.getBoundingClientRect().bottom-r.top})),lastContentBottom:Math.max(...text.map(t=>t.getBoundingClientRect().bottom-r.top)),footerTop:f.top-r.top};})}));
  assert(result.fonts&&result.images,theme+': missing fonts/images');
  assert(result.pages.every(p=>p.outside.length===0),theme+': text extends into footer or outside page');
  for(let i=0;i<2;i++)await page.locator('.sheet').nth(i).screenshot({path:new URL(theme+'-'+(i+1)+'.png',root).pathname});
  results.push({theme,...result});
 }
 await fs.writeFile(new URL('CHECKS.json',root),JSON.stringify({scope:'Metric-only static HTML design concepts. Browser renders, not PDF or catalogue checks.',results},null,2)+'\n');
 console.log(JSON.stringify(results,null,2));
}finally{await browser.close()}
