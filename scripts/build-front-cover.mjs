// Approved cover C: preserve its composition; batch copies this saved PDF.
import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'..');
const dir=path.join(root,'docs/front-matter/cover-studies');
const browser=await chromium.launch();
try {
 const page=await browser.newPage({viewport:{width:794,height:1123},deviceScaleFactor:2});
 await page.goto(pathToFileURL(path.join(dir,'preview-c.html')).href);
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
 const missing=await page.evaluate(()=>[...document.images].filter(i=>!i.naturalWidth).length);
 if(missing)throw Error('Cover artwork missing');
 const bytes=await page.pdf({format:'A4',printBackground:true,preferCSSPageSize:true});
 const pages=(bytes.toString('latin1').match(/\/Type\s*\/Page\b/g)??[]).length;
 if(pages!==1)throw Error(`Cover spans ${pages} pages`);
 await fs.mkdir(path.join(root,'public/front-matter'),{recursive:true});
 await fs.writeFile(path.join(root,'public/front-matter/cover-A4.pdf'),bytes);
 await page.locator('.cover').screenshot({path:path.join(dir,'c-with-previews.png')});
 console.log('Cover C installed: one A4 page; all images loaded.');
}finally{await browser.close();}
