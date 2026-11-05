import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {applyConventional} from '../src/print/book/sowing-planting-mockups/conventional/layout.mjs';
import {measureMockup} from '../src/print/book/sowing-planting-mockups/layout.mjs';
const base='http://127.0.0.1:5173',dir='docs/publication/sowing-planting-mockups/conventional',out='output/pdf/sowing-planting-mockups/conventional';
const copy='src/print/book/sowing-planting-mockups/conventional/copy.json',data=JSON.parse(await fs.readFile(copy)),inputs={},records=[];
const sha=b=>createHash('sha256').update(b).digest('hex'),track=async p=>inputs[p]=sha(await fs.readFile(p));
for(const p of [copy,'scripts/build-sowing-conventional-trial.mjs','src/print/book/sowing-planting-mockups/conventional/layout.mjs','src/print/book/sowing-planting-mockups/conventional/trial.css','output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'])await track(p);
for(const crop of data.crops)await track(`../hackriculture-data/vegetables/${crop.key}/${crop.key}.json`);
const browser=await chromium.launch();
try{for(const unit of ['imperial','metric'])for(const crop of data.crops){
 const source=`docs/publication/sowing-planting-mockups/${crop.key}-${unit}-source.html`;await track(source);
 const page=await browser.newPage({viewport:{width:1100,height:1200}});await page.goto(`${base}/${source}`,{waitUntil:'networkidle'});await page.emulateMedia({media:'print'});
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
 await page.addStyleTag({content:await fs.readFile('src/print/book/sowing-planting-mockups/conventional/trial.css','utf8')});
 const result=await page.evaluate(applyConventional,{crop,unit});
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
 const measured=await page.evaluate(measureMockup);
 measured.paragraphs=await page.evaluate(()=>[...document.querySelectorAll('.sowing-method')].map(e=>{const s=e.closest('.sheet'),r=e.getBoundingClientRect(),b=s.getBoundingClientRect();return {page:[...document.querySelectorAll('.sheet')].indexOf(s),text:e.innerText,boxPt:[r.left-b.left,r.top-b.top,r.right-b.left,r.bottom-b.top].map(v=>v*.75)};}));
 if(measured.pages.some(p=>p.footerGapMm<2.9)||/\b(?:undefined|NaN)\b/.test(measured.text.join('\n')))throw Error('Invalid final proof: '+crop.key+'/'+unit);
 const pdf=`${out}/${crop.key}-${unit}.pdf`;await page.pdf({path:pdf,preferCSSPageSize:true,printBackground:true});await fs.writeFile(`${dir}/${crop.key}-${unit}.html`,await page.content());
 records.push({key:crop.key,unit,pdf,source,...result,...measured});console.log(JSON.stringify({key:crop.key,unit,pages:result.trial.pages,twoPageGap:result.trial.selected.gap,gaps:measured.pages.map(p=>p.footerGapMm)}));await page.close();
}}finally{await browser.close();}
for(const [p,h]of Object.entries(inputs))if(sha(await fs.readFile(p))!==h)throw Error('Protected input changed: '+p);
await fs.writeFile(`${dir}/CHECKS.json`,JSON.stringify({status:'Second trial; not installed',inputs,records},null,2)+'\n');
