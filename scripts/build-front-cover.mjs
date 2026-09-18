// Regenerate only after an approved cover change; batch exports copy the saved PDF.
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'..');
const html=await fs.readFile(path.join(root,'docs/front-matter/templates/approved-cover.html'),'utf8');
const image='data:image/png;base64,'+(await fs.readFile(path.join(root,'public/images/front-matter/hands-sheet-fan.png'))).toString('base64');
const browser=await chromium.launch();
try {
 const page=await browser.newPage({viewport:{width:794,height:1123}});
 await page.setContent(html,{waitUntil:'networkidle'});
 await page.evaluate(image=>{
  document.querySelector('.fan img').src=image;
  document.querySelector('footer span:last-child').textContent='';
 },image);
 await page.evaluate(()=>document.fonts.ready);
 await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
 if(!await page.evaluate(()=>document.fonts.check('900 20px Inter')))throw Error('Inter font unavailable');
 await fs.mkdir(path.join(root,'public/front-matter'),{recursive:true});
 await page.pdf({path:path.join(root,'public/front-matter/cover-A4.pdf'),format:'A4',printBackground:true,preferCSSPageSize:true});
}finally{await browser.close();}
