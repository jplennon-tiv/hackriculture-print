import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {readCollection} from '../../../hackriculture-data/lib/records.mjs';
import {root, sharedRoot, sha256} from './book-content.mjs';
import {sectionNames, sectionLabel} from './book-review-refinements.mjs';

const range = (start,end) => start===end?String(start):`${start}–${end}`;
const escape = s => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const normal = s => s.normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');
// Literal printed names and ordinary singular/plural forms, not family inference.
const names = {
  artichoke_jerusalem:['artichoke jerusalem','jerusalem artichoke','jerusalem artichokes'],
  artichoke_globe:['artichoke globe','globe artichoke','globe artichokes'],
  bean_broad:['bean broad','broad bean','broad beans'], bean_french:['bean french','french bean','french beans'], bean_runner:['bean runner','runner bean','runner beans'],
  beet_leaf:['beet leaf','leaf beet','spinach beet'],
  onion_shallot:['onion','onions','shallot','shallots'],
  marrow_courgette:['marrow','marrows','courgette','courgettes'],
  squash_pumpkin:['squash','squashes','pumpkin','pumpkins'],
  salsify_scorzonera:['salsify','scorzonera'], potato:['potato','potatoes'],
  tomato_greenhouse:['tomato greenhouse','greenhouse tomato','greenhouse tomatoes'],
  tomato_outdoor:['tomato outdoor','outdoor tomato','outdoor tomatoes'],
  cucumber_greenhouse:['cucumber greenhouse','greenhouse cucumber','greenhouse cucumbers'],
  cucumber_outdoor:['cucumber outdoor','outdoor cucumber','outdoor cucumbers'],
};
export function cropMention(text,key,crop,source) {
  // Source notes and footer labels do not count as a useful mention in the page.
  const body=text.split(/\bJohn:/i)[0];const value=normal(body);
  let terms=names[key]||[normal(crop.name),normal(crop.name)+'s'];
  if(source.startsWith('technique:')||source.startsWith('cultivation:')) {
    // Generic tomato/cucumber prose counts only in a compatible setting.
    if(key.endsWith('_outdoor')&&source.startsWith('technique:greenhouse-'))return null;
    if(key.startsWith('tomato_'))terms=[...terms,'tomato','tomatoes'];
    if(key.startsWith('cucumber_'))terms=[...terms,'cucumber','cucumbers'];
  }
  for(const term of terms){const match=new RegExp('\\b'+term.replaceAll(' ','\\s+')+'\\b').exec(value);if(match)return {term,excerpt:value.slice(Math.max(0,match.index-65),match.index+term.length+100)};}
  return null;
}

export function readNavigationSources(edition) {
  const sources=[...edition.documents.filter(d=>d.type==='trouble').map(d=>({source:'trouble:'+d.key,pdf:d.pdf,sha256:d.sha256})),...edition.additions.filter(d=>d.source!=='technique:why-grow')];
  const paths=[...new Set(sources.map(d=>d.pdf))];
  for(const d of sources)if(sha256(fs.readFileSync(path.resolve(root,d.pdf)))!==d.sha256)throw Error('Navigation source changed: '+d.pdf);
  const python=process.env.BOOK_PYTHON||'/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
  const extracted=JSON.parse(execFileSync(python,['-c',`import sys,json,logging,pdfplumber
logging.getLogger('pdfminer').setLevel(logging.ERROR)
out={}
for file in json.load(sys.stdin):
 with pdfplumber.open(file) as pdf:out[file]=[p.extract_text(x_tolerance=1,y_tolerance=2) or '' for p in pdf.pages]
print(json.dumps(out))`],{input:JSON.stringify(paths),encoding:'utf8',cwd:root,maxBuffer:8*1024*1024}));
  return {texts:Object.fromEntries(sources.map(d=>[d.source,d.sourcePage?[extracted[d.pdf][d.sourcePage-1]]:extracted[d.pdf]])),inputs:Object.fromEntries(sources.map(d=>[d.pdf,d.sha256]))};
}

export function resolveNavigation(edition, vegetables, troubles, texts) {
  const decisions=[],pages=[];
  const techniques=edition.additions.filter(d=>d.source!=='technique:why-grow');
  for(const d of edition.documents) {
    if(d.type!=='vegetable') {for(let i=0;i<d.physicalPages;i++)pages.push({folio:d.startPage+i,label:sectionNames.trouble.toUpperCase(),links:[]});continue;}
    const crop=vegetables[d.key];if(!crop)throw Error('Missing crop: '+d.key);
    const groups=Object.entries(troubles).filter(([,t])=>t.applies_to?.includes(d.key)).map(([key])=>key);
    const candidates=groups.map(key=>{const doc=edition.documents.find(d=>d.type==='trouble'&&d.key===key);if(!doc)throw Error('Missing Troubles destination: '+key);return {...doc,source:'trouble:'+key,kind:sectionNames.trouble};}).concat(techniques.map(t=>({...t,kind:sectionNames.technique})));
    const matches=[];
    for(const candidate of candidates){
      const sourcePages=texts[candidate.source];if(!sourcePages||sourcePages.length!==candidate.physicalPages)throw Error('Missing page text: '+candidate.source);
      for(let i=0;i<sourcePages.length;i++){const mention=cropMention(sourcePages[i],d.key,crop,candidate.source);if(mention)matches.push({source:candidate.source,offset:i,folio:candidate.startPage+i,kind:candidate.kind,...mention});}
    }
    const links=[];
    for(const kind of [sectionNames.trouble,sectionNames.technique]){
      const selected=matches.filter(m=>m.kind===kind).sort((a,b)=>a.folio-b.folio);
      for(let i=0;i<selected.length;i++){
        const evidence=[selected[i]];while(i+1<selected.length&&selected[i+1].folio===selected[i].folio+1)evidence.push(selected[++i]);
        const first=evidence[0],last=evidence.at(-1);links.push({source:first.source,offset:first.offset,label:kind,start:first.folio,end:last.folio,text:`${kind} ${range(first.folio,last.folio)}`,evidence});
      }
    }
    decisions.push({key:d.key,crop:crop.name,troubleMembership:groups,links,omission:links.length?null:'No destination page explicitly names this crop in a relevant context.'});
    for(let i=0;i<d.physicalPages;i++)pages.push({folio:d.startPage+i,label:sectionNames.vegetable.toUpperCase(),crop:crop.name,category:crop.category,key:d.key,offset:i,links:i?links:[],newHeading:i===1?`Growing guide · ${crop.name}`:null,existingNamedContinuation:i>1});
  }
  const blanks=new Set([...edition.extraBlanks.map(b=>b.page),...edition.documents.flatMap(d=>d.blankFoliosAfter)]);
  for(let folio=2;folio<=edition.plannedEvenTotal;folio++) {
    if(blanks.has(folio)||pages.some(p=>p.folio===folio))continue;
    pages.push({folio,label:sectionLabel(folio,edition),links:[],isIndex:folio>=edition.index.startPage});
  }
  pages.sort((a,b)=>a.folio-b.folio);
  return {pages,decisions};
}

export async function buildNavigationOverlays() {
  const dir='docs/publication/whole-book-order-preview',scratch='tmp/pdfs/whole-book-order-preview';
  const planPath='docs/publication/contents-update/ASSEMBLY-PROPOSAL.json';
  const plan=JSON.parse(fs.readFileSync(path.join(root,planPath),'utf8'));
  const vegetables=readCollection('vegetables',sharedRoot),troubles=readCollection('troubles',sharedRoot);
  const source=readNavigationSources(plan.editions.imperial);
  const navigation=resolveNavigation(plan.editions.imperial,vegetables,troubles,source.texts);
  const inputPaths=[planPath,'scripts/lib/book-navigation.mjs','scripts/lib/book-review-refinements.mjs','public/fonts/richer-a-1.woff2','public/fonts/richer-a-6.woff2','src/print/familyThemes.json',...Object.keys(vegetables).map(k=>`../hackriculture-data/vegetables/${k}/${k}.json`),...Object.keys(troubles).map(k=>`../hackriculture-data/troubles/${k}/${k}.json`)];
  const inputs={...source.inputs,...Object.fromEntries(inputPaths.map(p=>[p,sha256(fs.readFileSync(path.resolve(root,p)))]))};
  const themes=JSON.parse(fs.readFileSync(path.join(root,'src/print/familyThemes.json'),'utf8'));
  for(const p of navigation.pages)p.theme=themes.find(t=>t.group===p.category)||themes.find(t=>t.id==='other');
  const body=navigation.pages.map(p=>`<section class="sheet" data-folio="${p.folio}">${p.newHeading?`<div class="crop-name" style="color:${p.theme.ink}" data-change="Combined growing-guide and crop heading"><span class="heading-text">Growing guide · <span style="color:${p.theme.deep}">${escape(p.crop)}</span></span></div>`:''}<footer style="left:${p.folio%2?17:8}mm;right:${p.folio%2?8:17}mm"><span class="section-label ${p.label!=='THE VEGETABLE GURU'?'change':''}" data-change="Section name matches contents and openers">${p.label}</span>${p.links.length?`<nav class="change" data-change="Reference labels match section names; destinations unchanged"><span>See also: </span>${p.links.map(l=>`<a href="#folio-${l.start}" data-source="${escape(l.source)}" data-target="${l.start}">${escape(l.text)}</a>`).join('<span class="separator"> · </span>')}</nav>`:''}<span class="folio change" data-change="Edition label moved to publication page">${p.folio}</span></footer></section>`).join('');
  const html=`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><style>@font-face{font-family:Lilita;src:url('/fonts/richer-a-1.woff2');font-weight:400}@font-face{font-family:Nunito;src:url('/fonts/richer-a-6.woff2');font-weight:100 1000}*{box-sizing:border-box}body{margin:0;background:transparent}.sheet{position:relative;width:185mm;height:240mm;break-after:page;background:transparent}.sheet:last-child{break-after:auto}.crop-name{position:absolute;left:17mm;top:6.5mm;width:135mm;white-space:nowrap;font:400 28.5pt/1.05 Lilita;letter-spacing:-.35px}.heading-text{display:inline-block}footer{position:absolute;bottom:8mm;display:flex;align-items:baseline;gap:3mm;color:#173e2c;font:900 9.4px/1.4 Nunito;letter-spacing:.7px}.section-label,.folio{white-space:nowrap}.folio{margin-left:auto}nav{white-space:nowrap;font:800 7.5pt/1.3 Nunito;letter-spacing:0}nav a{color:#a44007;text-decoration:none}.separator{color:#173e2c}@page{size:185mm 240mm;margin:0}</style></head><body>${body}</body></html>`;
  const htmlPath=dir+'/footers.html',pdf=scratch+'/footers.pdf';
  fs.mkdirSync(path.join(root,scratch),{recursive:true});fs.writeFileSync(path.join(root,htmlPath),html);
  const browser=await chromium.launch();let dom;
  try {
    const page=await browser.newPage();await page.route('**/@vite/client',r=>r.abort());
    await page.goto('http://127.0.0.1:5173/'+htmlPath);await page.emulateMedia({media:'print'});await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(()=>document.querySelectorAll('.crop-name').forEach(h=>{let size=28.5;const text=h.querySelector('.heading-text');while(text.getBoundingClientRect().width>h.clientWidth&&size>19){size-=.25;h.style.fontSize=size+'pt';}if(text.getBoundingClientRect().width>h.clientWidth+.5)throw Error('Combined heading overflow');h.dataset.fontSizePt=size;}));
    dom=await page.evaluate(()=>[...document.querySelectorAll('.sheet')].map(s=>{
      const b=s.getBoundingClientRect(),f=s.querySelector('footer'),fr=f.getBoundingClientRect();
      const rect=e=>{const r=e.getBoundingClientRect();return {left:(r.left-b.left)*25.4/96,top:(r.top-b.top)*25.4/96,right:(r.right-b.left)*25.4/96,bottom:(r.bottom-b.top)*25.4/96};};
      const children=[...f.children];for(let i=0;i<children.length;i++){const r=children[i].getBoundingClientRect();if(r.right>fr.right+.5||children[i].scrollWidth>children[i].clientWidth+1)throw Error('Navigation overflow '+s.dataset.folio);if(i&&r.left<children[i-1].getBoundingClientRect().right+4)throw Error('Navigation collision '+s.dataset.folio);}
      const heading=s.querySelector('.crop-name');if(heading&&rect(heading).bottom>18)throw Error('Crop label is too tall '+s.dataset.folio);
      return {folio:Number(s.dataset.folio),label:s.querySelector('.section-label').textContent,heading:heading?{text:heading.textContent,sourceHeading:'Growing & harvesting',fontSizePt:Number(heading.dataset.fontSizePt),...rect(heading)}:null,footer:rect(f),changes:[...s.querySelectorAll('.change')].map(e=>({description:e.dataset.change,text:e.textContent,...rect(e)})),links:[...s.querySelectorAll('nav a')].map(a=>({source:a.dataset.source,target:Number(a.dataset.target),text:a.textContent,...rect(a)}))};
    }));
    for(const p of dom){const planned=navigation.pages.find(n=>n.folio===p.folio);p.isIndex=Boolean(planned.isIndex);p.links=p.links.map((l,i)=>({...planned.links[i],...l}));}
    await page.pdf({path:path.join(root,pdf),preferCSSPageSize:true,printBackground:true});
  } finally {await browser.close();}
  for(const [p,h] of Object.entries(inputs))if(sha256(fs.readFileSync(path.resolve(root,p)))!==h)throw Error('Navigation input changed: '+p);
  const receipt={date:'2026-10-15',status:'Section labels and edition placement for review; approved crop-title highlights removed',inputs,decisions:navigation.decisions,pages:dom,newCropLabels:dom.filter(x=>x.heading).length,existingNamedContinuations:navigation.pages.filter(x=>x.existingNamedContinuation).map(x=>({folio:x.folio,crop:x.crop})),crossReferenceLinks:dom.reduce((n,x)=>n+x.links.length,0),changedFolios:dom.filter(x=>x.changes.length).map(x=>x.folio),priorApproval:'references/navigation-approved-2026-10-15/APPROVAL.json',approvedHighlightsRemoved:true,referencePolicy:'Only destination pages explicitly naming the crop; no generic recommendations or index fallback.',scope:'Current imperial whole-book preview only. No source guide export or shared-data mutation.'};
  fs.writeFileSync(path.join(root,dir,'NAVIGATION.json'),JSON.stringify(receipt,null,2)+'\n');
  return {pdf,sha256:sha256(fs.readFileSync(path.join(root,pdf))),pages:navigation.pages,navigation:receipt};
}
