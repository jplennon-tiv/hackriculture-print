import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.dirname(fileURLToPath(import.meta.url));
const copy=JSON.parse(await fs.readFile(path.resolve(dir,'../../../../../hackriculture-resources/summaries/techniques-expansion/copy.json'),'utf8'));
const base='http://127.0.0.1:5173/docs/publication/topic-pages/techniques-expansion/';
const browser=await chromium.launch();
const result={errors:[],editions:[],checkedUrls:[]};
try{
 const page=await browser.newPage({viewport:{width:1440,height:1100}});
 page.on('pageerror',e=>result.errors.push(e.message));page.on('response',r=>{if(r.status()>=400)result.errors.push(`${r.status()} ${r.url()}`);});
 await page.goto(base+'REVIEW.html',{waitUntil:'networkidle'});
 for(const unit of ['imperial','metric']){
  await page.getByRole('button',{name:unit==='imperial'?'Imperial':'Metric',exact:true}).click();
  await page.evaluate(async()=>{await Promise.all([...document.images].map(async i=>{i.loading='eager';await i.decode();}));});
  const state=await page.evaluate(()=>({pages:[...document.querySelectorAll('img[data-page]')].map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0})),pdf:document.querySelector('#pdf').href,pressed:[...document.querySelectorAll('button[aria-pressed=true]')].map(b=>b.dataset.unit)}));
  if(state.pages.length!==copy.pages.length||state.pages.some(p=>!p.ok||!p.src.startsWith(unit))||state.pressed[0]!==unit||!state.pdf.includes(unit))throw Error('Edition switch failed');
  result.editions.push({unit,images:state.pages.length,pdf:state.pdf});
 }
 const links=await page.locator('a[href]').evaluateAll(as=>as.map(a=>a.href));
 for(const url of new Set(links.filter(u=>u.startsWith('http://127.0.0.1:5173/')&&!u.includes('#')))){
  const response=await page.request.get(url);if(!response.ok())throw Error(`Link failed ${response.status()} ${url}`);result.checkedUrls.push(url);
 }
 await page.getByRole('button',{name:'Imperial',exact:true}).click();
 await page.screenshot({path:path.join(dir,'review-screen.png'),fullPage:false});
 await page.setViewportSize({width:390,height:844});
 const fits=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);if(!fits)throw Error('Narrow preview overflows');
 result.narrowPreviewFits=true;
 if(result.errors.length)throw Error(JSON.stringify(result.errors));
 result.status='passed';await fs.writeFile(path.join(dir,'REVIEW-CHECKS.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({status:result.status,editions:result.editions.length,links:result.checkedUrls.length,narrowPreviewFits:fits}));
}finally{await browser.close();}
