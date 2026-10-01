import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const root=new URL('./',import.meta.url),models=JSON.parse(await fs.readFile(new URL('CONTENT.json',root)));
const browser=await chromium.launch(),results=[];
try{const page=await browser.newPage({viewport:{width:860,height:1190},deviceScaleFactor:1.25});
for(const m of models){
 await page.goto(new URL(m.key+'.html',root).href);await page.evaluate(async()=>{await document.fonts.ready;await document.fonts.load('400 76px "Lilita One"');await document.fonts.load('400 12px "Nunito Sans"');await Promise.all([...document.images].map(i=>i.decode()));});
 for(const [i,cards] of m.pages.entries()){
 const sheet=page.locator('.sheet').nth(i),text=(await sheet.textContent()).replace(/\s+/g,' ');
 for(const c of cards)for(const value of [c.name,c.crops,c.symptom,...['recognise','act','prevent'].map(k=>c.copy[k])].filter(Boolean))assert(text.includes(value.replace(/\s+/g,' ')),c.key+': missing '+value);
 if(!i)assert(text.includes(m.introduction.replace(/\s+/g,' ')));
 const bounds=await sheet.evaluate(s=>{const footer=s.querySelector('footer').getBoundingClientRect();return {cards:s.querySelectorAll('.card').length,overflow:[...s.querySelectorAll('.card')].filter(c=>c.scrollHeight>c.clientHeight+1).map(c=>c.dataset.key),textOutside:[...s.querySelectorAll('p,h1,h2,h3')].filter(e=>{const r=e.getBoundingClientRect(),card=e.closest('.card')?.getBoundingClientRect(),page=s.getBoundingClientRect();return r.bottom>footer.top-6||r.left<page.left||r.right>page.right||(card&&r.bottom>card.bottom-6)}).map(e=>e.textContent.slice(0,50))}});
 await sheet.screenshot({path:new URL(m.key+'-'+(i+1)+'.png',root).pathname});results.push({group:m.key,page:i+1,...bounds});
 }
}
await fs.writeFile(new URL('CHECKS.json',root),JSON.stringify({scope:'First two browser pages from two approved guides; no PDF or live-template change',fontsAndImagesLoaded:true,sourceCopyPreserved:true,results},null,2)+'\n');console.log(JSON.stringify(results,null,2));assert(results.every(r=>r.cards===4&&!r.overflow.length&&!r.textOutside.length));
}finally{await browser.close()}
