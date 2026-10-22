import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {topicHeadings} from './lib/book-review-refinements.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const allCultivation=process.argv.includes('--cultivation-headings');
const name=allCultivation?'cultivation-headings':'digging-order';
const dir='docs/publication/'+name,out='output/pdf/'+name;
const ids=allCultivation?['overview','no-dig','digging','digging-finish']:['digging','digging-finish'];
const firstFolio=allCultivation?156:158;
const sourceDir='docs/publication/topic-pages/cultivation-dig-no-dig';
const layout='src/print/book/digging-order/layout.css';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const inputs={};
async function read(p,expected){const b=await fs.readFile(path.join(root,p));const h=sha(b);if(expected&&h!==expected)throw Error('Changed source: '+p);inputs[p]=h;return b.toString();}
const approval=JSON.parse(await read(sourceDir+'/APPROVAL.json'));
for(const f of approval.files.filter(f=>/copy\.json$|draft\.css$|\/assets\//.test(f.path)))await read(f.path,f.sha256);
await read('scripts/lib/book-review-refinements.mjs');
const copy=JSON.parse(await read(sourceDir+'/references/approved-2026-10-08/copy.json'));
const editPath='src/print/book/final-text-edits/digging.json';
const edit=allCultivation?JSON.parse(await read(editPath)):null;
if(edit&&(edit.beforeLead!==copy.digging.lead||edit.beforeDoubleTitle!==copy.digging.doubleTitle))throw Error('Digging replacement source differs');
const cssPath=sourceDir+'/references/approved-2026-10-08/draft.css';
const css=await read(layout);
await fs.mkdir(path.join(root,dir),{recursive:true});await fs.mkdir(path.join(root,out),{recursive:true});
const browser=await chromium.launch();const results=[];
try{
 for(const units of ['imperial','metric']){
  const sourceHtml=sourceDir+'/'+units+'.html';await read(sourceHtml);
  const page=await browser.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  await page.goto('http://127.0.0.1:5173/'+sourceHtml,{waitUntil:'networkidle'});await page.emulateMedia({media:'print'});
  await page.evaluate(({cssPath,css,headings,copy,edit,ids,firstFolio})=>{
   document.querySelectorAll('script').forEach(e=>e.remove());
   const a=document.querySelector('.digging-start'),b=document.querySelector('.digging-finish');
   if(!a||!b)throw Error('Missing digging source pages');
   if(a.querySelector('.single-dig p').textContent!==copy.digging.single||a.querySelector('.continued').textContent!==copy.digging.continued)throw Error('Source copy differs');
   if(edit){
    if(a.querySelector('.lead').textContent!==edit.beforeLead||a.querySelector('.double-dig h2').textContent!==edit.beforeDoubleTitle)throw Error('Digging copy source differs');
    if(/<(?!\/?b>)/.test(edit.lead))throw Error('Only bold markup is supported in the supplied lead');
    a.querySelector('.lead').innerHTML=edit.lead;
    a.querySelector('.double-dig h2').textContent=edit.doubleTitle;
   }
   for(const [nodes,steps] of [[a.querySelectorAll('.double-dig .step'),copy.digging.steps],[b.querySelectorAll('.finish-steps .step'),copy.diggingFinish.steps]]){
    if(nodes.length!==steps.length)throw Error('Step count differs');
    nodes.forEach((n,i)=>{if(n.querySelector('p').textContent!==steps[i].text)throw Error('Step source differs');});
   }
   const selected=ids.length===4?[document.querySelector('.overview'),document.querySelector('.method'),a,b]:[a,b];
   if(selected.some(s=>!s))throw Error('Missing cultivation source page');
   document.querySelector('main').replaceChildren(...selected);
   document.querySelector('link[rel=stylesheet]').href='/'+cssPath;
   const style=document.createElement('style');style.textContent=css;document.head.append(style);
   for(const [i,s] of selected.entries()){
    const id=ids[i],folio=firstFolio+i;
    s.id=id;s.dataset.folio=folio;s.classList.toggle('verso',folio%2===0);s.classList.add('unified-topic-heading');
    const h=headings[id];s.querySelector('.eyebrow').textContent=h.eyebrow;
    const title=s.querySelector('h1');title.replaceChildren(document.createTextNode(h.lines[0]+' '));const span=document.createElement('span');span.textContent=h.lines[1];title.append(span);
    const f=s.querySelector('footer');f.firstElementChild.textContent='GROWING TECHNIQUES';f.lastElementChild.textContent=folio;
    for(const i of s.querySelectorAll('img'))i.setAttribute('src',new URL(i.getAttribute('src').replace('assets/','references/approved-2026-10-08/assets/'),document.URL).href);
   }
  },{cssPath,css,headings:topicHeadings,copy,edit,ids,firstFolio});
  await page.waitForLoadState('networkidle');
  await page.evaluate(async()=>{await Promise.all([document.fonts.load('42px Lilita'),document.fonts.load('12.6px Nunito')]);await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const checks=await page.evaluate(()=>{
   const a=document.querySelector('.digging-start'),b=document.querySelector('.digging-finish');
   const signatures=()=>[...document.querySelectorAll('.sheet h1,.sheet h2,.sheet h3,.sheet p,.sheet h1>span,.sheet .number')].map(e=>JSON.stringify([e.textContent,getComputedStyle(e).fontSize,getComputedStyle(e).lineHeight])).sort();
   const removed=a.querySelector('.continued').textContent;a.querySelector('.continued').remove();
   const before=signatures();
   const single=a.querySelector('.single-dig'),finish=b.querySelector('.finish-steps');
   a.querySelector('.double-dig').append(finish);b.querySelector('header').after(single);
   if(JSON.stringify(signatures())!==JSON.stringify(before))throw Error('Copy or type changed during move');
   const mm=96/25.4;
   return {removed,boldLead:[...a.querySelectorAll('.lead b')].map(e=>({text:e.textContent,weight:getComputedStyle(e).fontWeight})),fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),images:[...document.images].map(i=>({src:i.src,loaded:i.complete&&i.naturalWidth>0})),pages:[...document.querySelectorAll('.sheet')].map(s=>{
    const r=s.getBoundingClientRect(),content=s.querySelector('.page-content').getBoundingClientRect(),footer=s.querySelector('footer').getBoundingClientRect(),source=s.querySelector('.source-note')?.getBoundingClientRect();
    return {folio:Number(s.dataset.folio),text:s.innerText,heading:{text:s.querySelector('h1').innerText,mainColour:getComputedStyle(s.querySelector('h1')).color,qualifierColour:getComputedStyle(s.querySelector('h1 span')).color},bodyToFooterMm:(footer.top-content.bottom)/mm,footerGapMm:(footer.top-Math.max(content.bottom,source?.bottom||0))/mm,sourceGapMm:source?(source.top-content.bottom)/mm:null,stepNumbers:[...s.querySelectorAll('.double-dig .number')].map(e=>e.textContent),blocks:[...s.querySelectorAll('h1,h2,h3,p,footer,img')].map(e=>{const b=e.getBoundingClientRect();return {tag:e.tagName,text:e.innerText||e.alt,left:(b.left-r.left)/mm,right:(b.right-r.left)/mm,top:(b.top-r.top)/mm,bottom:(b.bottom-r.top)/mm,fontPt:parseFloat(getComputedStyle(e).fontSize)*.75,overflow:e.scrollWidth>e.clientWidth+1};})};
   })};
  });
  const violations=[];
  for(const p of checks.pages){
   if(p.footerGapMm<3||(p.sourceGapMm!==null&&p.sourceGapMm<2))violations.push('Footer/source clearance '+p.folio);
   const left=p.folio%2?17:8;
   for(const b of p.blocks)if(b.left<left-.15||b.right>left+160+.15||b.top<5||b.bottom>233||b.overflow)violations.push('Unsafe block '+p.folio+' '+b.text.slice(0,45));
  }
  if(checks.pages.find(p=>p.folio===158).stepNumbers.join(',')!=='1,2,3,4,5')violations.push('Double digging incomplete on page 158');
  if(edit&&(checks.boldLead.map(e=>e.text).join('|')!=='Single digging|Double digging'||checks.boldLead.some(e=>Number(e.weight)<700)))violations.push('Missing requested bold emphasis');
  if(errors.length||violations.length||checks.fonts.some(f=>f.status!=='loaded')||checks.images.some(i=>!i.loaded))throw Error(JSON.stringify({errors,violations,checks}));
  const html=dir+'/'+units+'.html',pdf=out+'/digging-'+units+'.pdf';
  await fs.writeFile(path.join(root,html),await page.content());await page.pdf({path:path.join(root,pdf),preferCSSPageSize:true,printBackground:true});
  results.push({units,pdf,sha256:sha(await fs.readFile(path.join(root,pdf))),html,htmlSha256:sha(await fs.readFile(path.join(root,html))),checks,errors,violations});
  console.log(JSON.stringify({units,pages:checks.pages.map(p=>({folio:p.folio,footerGapMm:p.footerGapMm,sourceGapMm:p.sourceGapMm,stepNumbers:p.stepNumbers}))}));await page.close();
 }
}finally{await browser.close();}
for(const [p,h] of Object.entries(inputs))if(sha(await fs.readFile(path.join(root,p)))!==h)throw Error('Source changed: '+p);
await fs.writeFile(path.join(root,dir,'CHECKS.json'),JSON.stringify({date:'2026-10-18',status:'Author-requested cultivation derivative for review',authority:allCultivation?'Retain requested Cultivation headings and digging order; apply John’s exact introduction, bold emphasis and double-digging heading.':'Swap double and single digging so all double-digging instructions fit on the first page.',inputs,results,unchangedBodyCopyAndTypePreserved:true,copyEdits:edit?editPath:null,omitted:'Obsolete navigation sentence: Finish the bed on the next page.',fullBookChanged:false},null,2)+'\n');
// Register individual placements while retaining earlier final edits.
const manifestPath=path.join(root,'docs/publication/final-text-edits/MANIFEST.json');
const manifest=JSON.parse(await fs.readFile(manifestPath,'utf8'));
const edits=ids.map((id,i)=>({source:'cultivation:'+id,folio:firstFolio+i,id,copy:edit&&id==='digging'?editPath:allCultivation?'scripts/lib/book-review-refinements.mjs':layout,proofs:results.map(r=>({units:r.units,pdf:r.pdf,sha256:r.sha256,sourcePage:i+1,physicalPages:1,sourcePdfPages:ids.length,html:r.html,htmlSha256:r.htmlSha256}))}));
manifest.status='Author-requested copy and layout derivatives; see individual approval records';
manifest.inputs={...manifest.inputs,...inputs};
manifest.edits=[...manifest.edits.filter(e=>!edits.some(n=>n.source===e.source)),...edits].sort((a,b)=>a.folio-b.folio);
await fs.writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
