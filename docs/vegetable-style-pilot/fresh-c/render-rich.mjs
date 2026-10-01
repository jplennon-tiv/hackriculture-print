import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {readCollection} from '../../../../hackriculture-data/lib/records.mjs';
const root=new URL('./',import.meta.url),models=JSON.parse(await fs.readFile(new URL('RICH-CONTENT.json',root),'utf8')).models;
const d=readCollection('vegetables').carrot;
const browser=await chromium.launch(),results=[];
try{
 const page=await browser.newPage({viewport:{width:850,height:1180},deviceScaleFactor:1.5});
 for(const units of ['metric','imperial']){
  await page.goto(new URL(`a-rich-${units}.html`,root).href,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{await document.fonts.ready;await document.fonts.load('400 80px "Lilita One"');await document.fonts.load('400 13px "Nunito Sans"');await Promise.all([...document.images].map(i=>i.decode()));});
  const m=models[units],text=(await page.locator('body').innerText()).replace(/\s+/g,' ');
  const expected=[m.intro,...m.facts.flatMap(f=>[f.label,f.value]),...m.varieties.flatMap(v=>[v.name,v.text]),...m.risks.flatMap(r=>[r.name,r.text]),...m.pests.flatMap(p=>[p.name,...p.values]),...m.tips.map(t=>t.text),...m.planting.flatMap(p=>[p.title,p.text]),...d.ai_print_extracts.sections.key_notes.value.flatMap(x=>[x.title,x.body])];
  for(const k of ['soil_facts','looking_after_the_crop','harvesting','sowing_notes'])for(const row of d.ai_print_extracts.sections[k].value)expected.push(typeof row.text==='string'?row.text:row.text[units]);
  for(const s of expected)assert(text.includes(s.replace(/\s+/g,' ')),units+': missing '+s);
  const measure=await page.evaluate(()=>({fonts:document.fonts.check('400 80px "Lilita One"')&&document.fonts.check('400 13px "Nunito Sans"'),images:[...document.images].every(i=>i.complete&&i.naturalWidth),pages:[...document.querySelectorAll('.sheet')].map(e=>{const r=e.getBoundingClientRect(),f=e.querySelector('footer').getBoundingClientRect();const blocks=[...e.querySelectorAll('p,h2,h3,li,td,th')];return {width:r.width,height:r.height,lastTextBottom:Math.max(...blocks.map(e=>e.getBoundingClientRect().bottom-r.top)),footerTop:f.top-r.top,outside:blocks.filter(e=>{const b=e.getBoundingClientRect();return b.bottom>f.top-6||b.left<r.left||b.right>r.right}).map(e=>e.innerText.slice(0,90))}})}));
  assert(measure.fonts&&measure.images);
  for(let i=0;i<2;i++)await page.locator('.sheet').nth(i).screenshot({path:new URL(`a-rich-${units}-${i+1}.png`,root).pathname});
  results.push({units,checkedSourceStrings:expected.length,...measure});
 }
 await fs.writeFile(new URL('RICH-CHECKS.json',root),JSON.stringify({scope:'Both-unit browser layout and content-parity checks; no PDF export.',results},null,2)+'\n');
 console.log(JSON.stringify(results,null,2));
 assert(results.every(r=>r.pages.every(p=>!p.outside.length)),'Text extends into footer or beyond page');
}finally{await browser.close()}
