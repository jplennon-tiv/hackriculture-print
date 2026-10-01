import {chromium} from 'playwright';import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const root=new URL('./',import.meta.url),browser=await chromium.launch(),results=[];
try{const page=await browser.newPage({viewport:{width:850,height:1180}});
for(const unit of ['metric','imperial']){
await page.goto(new URL('../fresh-c/a-rich-'+unit+'.html',root).href);
const original=await page.locator('.sheet p,.sheet li,.sheet td,.sheet th,.fact-grid h3').allTextContents();
await page.goto(new URL(unit+'.html',root).href);await page.evaluate(async()=>{await document.fonts.ready;await document.fonts.load('400 63px "Lilita One"');await document.fonts.load('400 13px "Nunito Sans"');await Promise.all([...document.images].map(i=>i.decode()))});
assert.deepEqual(await page.locator('.sheet p,.sheet li,.sheet td,.sheet th,.fact-grid h3').allTextContents(),original);
const result=await page.evaluate(()=>[...document.querySelectorAll('.sheet')].map(s=>{const f=s.querySelector('footer').getBoundingClientRect(),r=s.getBoundingClientRect();return {outside:[...s.querySelectorAll('p,li,td,th,h1,h2,h3')].filter(e=>{const b=e.getBoundingClientRect();return b.bottom>f.top-6||b.left<r.left||b.right>r.right}).map(e=>e.textContent),titleBottom:s.querySelector('h1').getBoundingClientRect().bottom-r.top}}));
assert(result.every(p=>!p.outside.length));
if(unit==='metric')for(let i=0;i<2;i++)await page.locator('.sheet').nth(i).screenshot({path:new URL('metric-'+(i+1)+'.png',root).pathname});
results.push({unit,adviceUnchanged:true,pages:result});
}await fs.writeFile(new URL('CHECKS.json',root),JSON.stringify({scope:'Heading revision: both-unit browser content/fit check, metric images inspected; no PDF',results},null,2)+'\n');console.log(JSON.stringify(results));}finally{await browser.close()}
