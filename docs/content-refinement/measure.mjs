import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../..');
const vegetables=JSON.parse(await fs.readFile(path.join(root,'../hackriculture-data/generated/master/vegetables.json')));
const browser=await chromium.launch();const rows=[];
try{
 const page=await browser.newPage({viewport:{width:1000,height:1200}});
 for(const key of Object.keys(vegetables))for(const unit of ['metric','imperial']){
 await page.goto(`http://127.0.0.1:5173/print/vegetable/${key}?units=${unit}`);
 await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
 const r=await page.evaluate(()=>({error:document.body.dataset.printError??'',warnings:JSON.parse(document.body.dataset.printWarnings??'[]'),report:JSON.parse(document.querySelector('.rich-print').dataset.editorialReport),pages:[...document.querySelectorAll('.rich-print .sheet')].map(p=>({gapMm:+((p.querySelector('footer').getBoundingClientRect().top-p.querySelector('.content-end').getBoundingClientRect().bottom)/3.77952756).toFixed(1),classes:p.className,columns:[...p.querySelectorAll('.growing-columns>div')].map(c=>{const e=c.lastElementChild;return +(e.getBoundingClientRect().bottom-c.getBoundingClientRect().top).toFixed(1)}),bodyWords:p.innerText.split(/\s+/).length}))}));
 rows.push({key,unit,...r});
 }
 await fs.writeFile(path.join(import.meta.dirname,'BASELINE.json'),JSON.stringify(rows,null,2)+'\n');
 console.log(rows.filter(r=>r.unit==='metric').map(r=>`${r.key}: P1 ${r.pages[0].gapMm}mm / P2 ${r.pages[1].gapMm}mm; cols ${r.pages[1].columns.join('/')}px${r.error?' ERROR '+r.error:''}`).join('\n'));
}finally{await browser.close();}
