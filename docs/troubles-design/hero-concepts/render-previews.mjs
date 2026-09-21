// Preview-only DOM substitution: never changes shared records or production CSS.
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
const dir=new URL('./',import.meta.url);
const browser=await chromium.launch();
try {
 const page=await browser.newPage({viewport:{width:794,height:1123},deviceScaleFactor:1.5});
 await page.goto('http://127.0.0.1:5173/print/trouble/turnip_swede_radish_troubles',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.body.dataset.printReady==='true');
 for(const name of ['01-harvest-cluster','02-diagonal-bunch','03-overhead-harvest']) {
  const src='data:image/png;base64,'+(await fs.readFile(new URL(name+'.png',dir))).toString('base64');
  const box=await page.evaluate(async src=>{
   const output=document.querySelector('[data-source-card]').parentElement.nextElementSibling;
   const intro=output.querySelector('[data-planned-intro]');
   const holder=intro.lastElementChild;
   const img=new Image();img.src=src;await img.decode();
   img.style.cssText='width:100%;height:100%;object-fit:contain';holder.replaceChildren(img);
   const rect=intro.getBoundingClientRect();
   return {x:0,y:0,width:794,height:Math.ceil(rect.bottom+12)};
  },src);
  await page.screenshot({path:new URL(name+'-header.png',dir).pathname,clip:box});
 }
} finally {await browser.close();}
