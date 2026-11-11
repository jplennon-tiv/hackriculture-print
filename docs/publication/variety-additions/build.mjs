import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {readRecord} from '../../../../hackriculture-data/lib/records.mjs';
import {measureMockup} from '../../../src/print/book/sowing-planting-mockups/layout.mjs';
const dir='docs/publication/variety-additions',sha=b=>createHash('sha256').update(b).digest('hex');
if(await fs.access(dir+'/APPROVAL.json').then(()=>true,()=>false))throw Error('Preserve approved set; create a new derivative.');
const spec=JSON.parse(await fs.readFile('src/print/book/variety-additions.json','utf8'));
const verify=async c=>{
 if(sha(await fs.readFile(c.approval))!==c.approvalSha256)throw Error('Approval changed '+c.key);
 for(const s of Object.values(c.sourceUnits))for(const t of ['html','pdf','image'])if(sha(await fs.readFile(s[t]))!==s.hashes[t])throw Error('Approved source changed '+s[t]);
 if(sha(await fs.readFile(`../hackriculture-data/vegetables/${c.key}/${c.key}.json`))!==c.masterSha256)throw Error('Master changed '+c.key);
 const record=readRecord('vegetables',c.key);for(const v of c.additions)if(JSON.stringify(v.sourcePath.reduce((o,k)=>o[k],record))!==JSON.stringify(v.sourceValue))throw Error('Source advice changed '+v.name);
};
const browser=await chromium.launch(),all=[];
try{
 for(const c of spec.crops.filter(c=>!process.argv.slice(2).length||process.argv.slice(2).includes(c.key))){
  await verify(c);const pair={key:c.key,name:c.name,folios:c.folios,layout:c.layout,units:{}};
  for(const u of ['imperial','metric']){
   const p=await browser.newPage({viewport:{width:1100,height:1200}});
   await p.goto('http://127.0.0.1:5173/'+c.sourceUnits[u].html,{waitUntil:'load'});
   await p.emulateMedia({media:'print'});
   await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
   const preservation=await p.evaluate(({additions,layout})=>{
    const f=document.querySelector('.front'),b=document.querySelector('.back'),grid=f.querySelector('.varieties>div');
    const fingerprint=()=>{const clone=f.cloneNode(true);clone.querySelector('.varieties').remove();return clone.outerHTML;};
    const before={front:fingerprint(),back:b.outerHTML,entries:[...grid.children].map(e=>e.innerHTML),images:[...document.images].map(i=>i.getAttribute('src'))};
    for(const v of additions){const e=grid.firstElementChild.cloneNode(true);e.querySelector('h3').textContent=v.name;e.querySelector('p').textContent=v.text;let s=e.querySelector('small');if(v.type){if(!s){s=document.createElement('small');e.querySelector('h3').after(s);}s.textContent=v.type;}else{s?.remove();}grid.append(e);}
    grid.style.setProperty('grid-template-columns',layout==='four-across'?'repeat(8,1fr)':'repeat(6,1fr)','important');
    [...grid.children].forEach((e,i)=>e.style.setProperty('grid-column','span '+(layout==='balanced-five'&&i>=3?3:2),'important'));
    const check={frontOutsideVarietiesExact:before.front===fingerprint(),practicalPageExact:before.back===b.outerHTML,originalVarietyHtmlExact:before.entries.every((v,i)=>v===grid.children[i].innerHTML),allImagePathsExact:JSON.stringify(before.images)===JSON.stringify([...document.images].map(i=>i.getAttribute('src')))};
    if(Object.values(check).some(v=>!v))throw Error('Preservation failure');return check;
   },c);
   const measurements=await p.evaluate(measureMockup);
   const proof=await p.evaluate(()=>[...document.querySelectorAll('.front .varieties article')].map(e=>{const r=e.getBoundingClientRect(),s=e.closest('.sheet').getBoundingClientRect();return{text:e.innerText,box:[r.left-s.left,r.top-s.top,r.right-s.left,r.bottom-s.top].map(v=>v*.75),font:getComputedStyle(e.querySelector('p')).fontSize};}));
   const gaps=measurements.pages.map(p=>p.footerGapMm);
   if(measurements.pages.length!==2||gaps[0]<3||!measurements.fontsReady||measurements.images.some(i=>!i.loaded))throw Error(c.key+' '+u+' invalid fit '+JSON.stringify(gaps));
   const raw=`tmp/variety-additions/${c.key}-${u}-p1.pdf`,html=`${dir}/${c.key}-${u}.html`,pdf=`output/pdf/variety-additions/${c.key}-${u}.pdf`;
   await p.pdf({path:raw,pageRanges:'1',preferCSSPageSize:true,printBackground:true});
   await fs.writeFile(html,await p.content());
   pair.units[u]={html,pdf,raw,source:c.sourceUnits[u],preservation,gaps,measurements,varieties:proof};
   console.log(c.key,u,gaps.map(n=>n.toFixed(2)).join(' / '));await p.close();
  }
  await verify(c);all.push(pair);await fs.writeFile(`${dir}/checks/${c.key}.json`,JSON.stringify(pair,null,2)+'\n');
 }
}finally{await browser.close();}
const complete=await Promise.all(spec.crops.map(c=>fs.readFile(`${dir}/checks/${c.key}.json`,'utf8').then(JSON.parse)));
await fs.writeFile(dir+'/CHECKS.json',JSON.stringify({date:spec.date,status:'For review',specSha256:sha(await fs.readFile('src/print/book/variety-additions.json')),approvedSourcesUnchanged:true,canonicalRecordsUnchanged:true,crops:complete},null,2)+'\n');
