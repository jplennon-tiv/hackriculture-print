// One-crop derivative of exact approved HTML. Does not recreate or alter the approved baseline.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {readRecord} from '../../../../../../hackriculture-data/lib/records.mjs';
import {measureMockup} from '../../../../../src/print/book/sowing-planting-mockups/layout.mjs';
const revision='artichoke_jerusalem_varieties',key='artichoke_jerusalem';
const dir=`docs/publication/sowing-rollout/revisions/${revision}`,pdfDir=`output/pdf/sowing-rollout/revisions/${revision}`;
const specPath=`src/print/book/sowing-rollout/revisions/${revision}.json`;
if(await fs.access(dir+'/APPROVAL.json').then(()=>true,()=>false))throw Error('Preserve the approved revision; use a new derivative.');
const spec=JSON.parse(await fs.readFile(specPath,'utf8')),sha=b=>createHash('sha256').update(b).digest('hex');
const original=spec.approvedBaseline.directory;
if(sha(await fs.readFile(original+'/APPROVAL.json'))!==spec.approvedBaseline.approvalSha256)throw Error('Approval changed.');
const approval=JSON.parse(await fs.readFile(original+'/APPROVAL.json','utf8'));
for(const [file,hash] of Object.entries(approval.files))if(sha(await fs.readFile(file))!==hash)throw Error('Approved file changed: '+file);
const masterFile=`../hackriculture-data/vegetables/${key}/${key}.json`;
if(sha(await fs.readFile(masterFile))!==spec.masterSha256)throw Error('Master changed.');
const master=readRecord('vegetables',key);
if(master.varieties.GERARD.text!==spec.additionalVarieties[0].sourceText)throw Error('Source advice changed.');
const beforeChecks=JSON.parse(await fs.readFile(original+'/checks/'+key+'.json','utf8'));
const browser=await chromium.launch(),results={},checks={date:'2026-11-10',status:'For review',scope:spec.scope,approvedBaseline:spec.approvedBaseline,specSha256:sha(await fs.readFile(specPath)),masterSha256:spec.masterSha256};
try{
 for(const unit of ['imperial','metric']){
  const page=await browser.newPage({viewport:{width:1100,height:1200}});
  await page.goto('http://127.0.0.1:5173/'+original+'/'+key+'-'+unit+'.html',{waitUntil:'load'});
  await page.emulateMedia({media:'print'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const preservation=await page.evaluate(({varietyColumns,additionalVarieties})=>{
   const f=document.querySelector('.front'),back=document.querySelector('.back');
   const fingerprint=()=>{const c=f.cloneNode(true);c.querySelector('.varieties').remove();return c.outerHTML;};
   const before={frontOther:fingerprint(),back:back.outerHTML,images:[...document.images].map(i=>i.getAttribute('src')),varieties:[...f.querySelectorAll('.varieties article')].map(e=>e.textContent)};
   const grid=f.querySelector('.varieties>div'),template=grid.firstElementChild;
   if(grid.children.length!==3)throw Error('Expected the three approved varieties.');
   for(const v of additionalVarieties){const e=template.cloneNode(true);e.querySelector('h3').textContent=v.name;e.querySelector('p').textContent=v.text;e.querySelector('small')?.remove();grid.append(e);}
   grid.style.setProperty('grid-template-columns','repeat(6,1fr)','important');
   [...grid.children].forEach(e=>e.style.setProperty('grid-column','span '+6/varietyColumns,'important'));
   const same={frontOutsideVarietiesExact:before.frontOther===fingerprint(),practicalPageExact:before.back===back.outerHTML,originalVarietyTextExact:before.varieties.every((s,i)=>s===grid.children[i].textContent),allImagePathsExact:JSON.stringify(before.images)===JSON.stringify([...document.images].map(i=>i.getAttribute('src')))};
   if(Object.values(same).some(x=>!x))throw Error('Unexpected change outside the permitted edit.');
   return same;
  },spec);
  const measurements=await page.evaluate(measureMockup);
  const proof=await page.evaluate(()=>{
   const all=s=>[...document.querySelectorAll(s)];
   const box=e=>{const r=e.getBoundingClientRect(),s=e.closest('.sheet').getBoundingClientRect();return[r.left-s.left,r.top-s.top,r.right-s.left,r.bottom-s.top].map(v=>v*.75);};
   const sample=e=>({text:e.innerText,box:box(e)});
   return{actions:all('.fact-grid [data-action]').map(sample),additionalFacts:all('.fact-grid [data-added-fact]').map(sample),varieties:all('.varieties article').map(sample),methods:all('.sowing-method').map(sample),art:all('.planting img').map(e=>e.getAttribute('src')),pests:all('.pests tbody tr').map(e=>e.querySelector('th,strong')?.textContent),nav:all('.recto nav a').map(sample),text:all('.sheet').map(e=>e.innerText)};
  });
  const gaps=measurements.pages.map(p=>p.footerGapMm);
  if(measurements.pages.length!==2||Math.min(...gaps)<3||!measurements.fontsReady||measurements.images.some(i=>!i.loaded)||proof.varieties.length!==4||proof.pests.length!==3)throw Error('Invalid fit/content coverage.');
  const pdf=pdfDir+'/'+key+'-'+unit+'.pdf';
  await page.pdf({path:pdf,preferCSSPageSize:true,printBackground:true});
  await fs.writeFile(dir+'/'+key+'-'+unit+'.html',await page.content());
  results[unit]={...beforeChecks[unit],...proof,pdf,gaps,amendments:spec,approvedSourceHtmlSha256:approval.files[original+'/'+key+'-'+unit+'.html'],masterHash:spec.masterSha256};
  checks[unit]={...preservation,gaps,varieties:4,pests:3,measurements};
  console.log(unit,JSON.stringify({gaps,...preservation}));await page.close();
 }
}finally{await browser.close();}
for(const [file,hash] of Object.entries(approval.files))if(sha(await fs.readFile(file))!==hash)throw Error('Approved source mutated.');
if(sha(await fs.readFile(masterFile))!==spec.masterSha256)throw Error('Master mutated.');
checks.approvedSourcesUnchanged=true;checks.canonicalRecordUnchanged=true;
await fs.writeFile(dir+'/checks/'+key+'.json',JSON.stringify(results,null,2)+'\n');
await fs.writeFile(dir+'/CHECKS.json',JSON.stringify(checks,null,2)+'\n');
