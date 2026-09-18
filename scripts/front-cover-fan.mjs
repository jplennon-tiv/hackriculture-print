import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'..');
const out=path.join(root,'output/pdf/front-cover-fan-v1');
await fs.mkdir(out,{recursive:true});
const original=await fs.readFile(path.join(root,'output/pdf/front-matter-concepts/front-matter-concepts.html'),'utf8');
const image='data:image/png;base64,'+(await fs.readFile(path.join(root,'docs/front-matter/assets/hands-sheet-fan-v1.png'))).toString('base64');
const browser=await chromium.launch();
try {
 const page=await browser.newPage({viewport:{width:794,height:1123}});
 await page.setContent(original,{waitUntil:'networkidle'});
 await page.evaluate(image=>{
  document.querySelectorAll('.page:not(.cover-b)').forEach(p=>p.remove());
  const tiles=document.querySelector('.tiles');
  tiles.className='fan';tiles.innerHTML=`<img src="${image}" alt="Two hands holding a fan of vegetable growing sheets">`;
  document.querySelector('footer span:last-child').textContent='FRONT COVER / FAN STUDY 01';
  const style=document.createElement('style');
  style.textContent='.fan{margin:14mm -9mm 0 -9mm;height:118mm;display:flex;align-items:center}.fan img{width:100%;height:auto;display:block}.cover-b .strap{margin-top:9mm}';
  document.head.append(style);
 },image);
 await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
 if(!await page.evaluate(()=>document.fonts.check('900 20px Inter')))throw Error('Font unavailable');
 await fs.writeFile(path.join(out,'cover.html'),await page.content());
 await page.pdf({path:path.join(out,'vegetable-cheat-sheets-cover-fan-v1.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});
 console.log(out);
}finally{await browser.close();}
