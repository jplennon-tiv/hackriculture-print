// DOM-only pagination refresh. Does not export a catalogue or alter gardening data.
import fs from 'node:fs/promises';import {chromium} from 'playwright';import {makeBookEdition,paginationSourceSignature} from '../src/print/bookPagination.ts';
const vegetables=JSON.parse(await fs.readFile('../hackriculture-data/generated/master/vegetables.json','utf8'));
const troubles=JSON.parse(await fs.readFile('../hackriculture-data/generated/master/troubles.json','utf8'));
const families=Object.keys(JSON.parse(await fs.readFile('../hackriculture-data/vegetable_groups.json','utf8')));
const v=Object.entries(vegetables).sort(([,a],[,b])=>families.indexOf(a.category)-families.indexOf(b.category)||a.name.localeCompare(b.name,'en')).map(([key,r])=>({key,label:r.name}));
const t=Object.entries(troubles).sort(([,a],[,b])=>a.source_heading.localeCompare(b.source_heading,'en')).map(([key,r])=>({key,label:r.source_heading}));
const b=await chromium.launch(),editions={};
try{const page=await b.newPage({viewport:{width:794,height:1123}});for(const units of ['metric','imperial']){const counts={};for(const {key}of t){await page.goto(`http://127.0.0.1:5173/print/trouble/${key}?units=${units}&pagination=measure`,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);const r=await page.evaluate(()=>({error:document.body.dataset.printError,pages:document.querySelectorAll('.editorial-trouble>div:last-child>.sheet').length}));if(r.error)throw Error(r.error);counts[key]=r.pages;}editions[units]=makeBookEdition(v,t,counts);console.log(units,editions[units].totalPages+' numbered pages');}}finally{await b.close()}
await fs.writeFile('src/print/bookPagination.json',JSON.stringify({version:1,sourceSignature:await paginationSourceSignature(vegetables,troubles),editions},null,2)+'\n');
console.log('Updated bookPagination.json. Rebuild contents: node docs/front-matter/entry-pages/build.mjs');
