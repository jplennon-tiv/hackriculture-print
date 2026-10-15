// Reflow only relocated openings/topic pages. Saved crop/Troubles PDFs are reused.
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {readBookContent,renderOpeningPages,root,sha256} from './lib/book-content.mjs';
import {bookLayoutRevision} from '../../hackriculture-data/lib/book-layout.mjs';
import {renderSectionOpeners} from './lib/section-openers.mjs';
import {buildNavigationOverlays} from './lib/book-navigation.mjs';
import {topicHeadings} from './lib/book-review-refinements.mjs';
const dir='docs/publication/whole-book-order-preview',scratch='tmp/pdfs/whole-book-order-preview';
const base='http://127.0.0.1:5173';
for(const d of [dir,scratch])fs.mkdirSync(path.join(root,d),{recursive:true});
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const book=readBookContent(),plan=json('docs/publication/contents-update/ASSEMBLY-PROPOSAL.json'),edition=plan.editions.imperial;
const tocChecks=json('docs/publication/contents-update/CHECKS.json');
if(tocChecks.bookRevision!==book.revision)throw Error('Contents copy changed: refresh the contents before assembly');
const openingApproval=json('docs/publication/combined-guides-opening/APPROVAL.json');
const openingReference='docs/publication/combined-guides-opening/references/approved-2026-10-15';
for(const [file,hash] of Object.entries(openingApproval.frozen))if(sha256(fs.readFileSync(path.join(root,file)))!==hash)throw Error('Approved opener changed: '+file);
const openingChecks=json(openingReference+'/CHECKS.json');
if(openingChecks.bookRevision!==book.revision)throw Error('Book copy changed since opener approval');
const backCover=json('docs/publication/publication-copy/integration/CHECKS.json');
if(backCover.bookRevision!==book.revision)throw Error('Refresh back-cover copy before assembly');
const protectedFiles=tocChecks.protectedFiles;
const verify=()=>{for(const f of protectedFiles)if(sha256(fs.readFileSync(path.join(root,f.path)))!==f.sha256)throw Error('Approved source changed: '+f.path);};verify();
const collection=json('docs/publication/topic-pages/techniques-expansion/COLLECTION-APPROVAL.json');
const cultivation=json('docs/publication/topic-pages/cultivation-dig-no-dig/APPROVAL.json');
const stock=json('docs/assets/vegetable-guru-stock/ARTWORK.json');
const art=id=>'/docs/assets/vegetable-guru-stock/assets/'+stock.assets.find(x=>x.id===id).file;
const inputs={...plan.approvedGuides.inputs,...backCover.inputs,...openingApproval.frozen},assets={};
const read=p=>{const b=fs.readFileSync(path.join(root,p));inputs[p]=sha256(b);return b.toString();};
// The shared contents label owns this requested book-only heading adaptation.
const introductionLabel=book.data.contents.expanded.gettingStarted.entries.find(x=>x.source==='technique:why-grow')?.label;
const introductionHeading=introductionLabel?.split(' — ');
if(introductionHeading?.length!==2)throw Error('Expected Introduction title and subtitle in the shared contents label');
const groups=[
 {id:'opening',body:renderOpeningPages(book.data,'imperial').body,css:dir+'/opening-pages.css',folios:[1,2],keep:'.title-page,.publication',base:base+'/'},
 {id:'section-openers',body:renderSectionOpeners(book.data,'imperial',edition,{omit:['varieties']}),css:dir+'/section-openers.css',folios:edition.sectionOpeners.filter(d=>d.source!=='opening:varieties').map(d=>d.startPage),base:base+'/'},
 {id:'techniques',headingOverrides:{...topicHeadings,'why-grow':{lines:introductionHeading}},html:read('docs/publication/topic-pages/techniques-expansion/imperial.html'),css:collection.frozenReference+'/draft.css',folios:collection.pageIds.map(id=>edition.additions.find(x=>x.source==='technique:'+id).startPage),base:base+'/docs/publication/topic-pages/techniques-expansion/'},
 {id:'cultivation',headingOverrides:topicHeadings,html:read('docs/publication/topic-pages/cultivation-dig-no-dig/imperial.html'),css:cultivation.frozenReference+'/draft.css',folios:edition.additions.filter(x=>x.source.startsWith('cultivation:')).map(x=>x.startPage),base:base+'/docs/publication/topic-pages/cultivation-dig-no-dig/'}
];
for(const g of groups)if(g.headingOverrides)g.folioOverrides=Object.fromEntries(Object.values(topicHeadings).map(h=>[edition.additions.find(d=>d.source===h.source).startPage,h]));
read('docs/publication/vegetable-guru-opening-pages/opening-pages.css');
read('scripts/prepare-whole-book-preview.mjs');read('scripts/lib/book-review-refinements.mjs');
const checks={status:'Whole-book ordering preview components; imperial only',bookRevision:book.revision,copyInputs:book.inputs,protectedFiles,inputs,assets,backCover,components:[{id:'combined-guides-opening',pdf:openingReference+'/opening.pdf',sha256:openingChecks.sha256,html:openingReference+'/opening.html',folios:[9],dom:[openingChecks.checks],approval:'docs/publication/combined-guides-opening/APPROVAL.json'}],guideReexports:0};
const browser=await chromium.launch();
try{
 const page=await browser.newPage();await page.route('**/@vite/client',r=>r.abort());
 for(const g of groups){
  read(g.css);
  const html=g.html?g.html.replace('<meta charset="utf-8">',`<meta charset="utf-8"><base href="${g.base}">`).replace('href="draft.css"',`href="/${g.css}"`):`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><base href="${g.base}"><link rel="stylesheet" href="/${g.css}"></head><body>${g.body}</body></html>`;
  const file=dir+'/'+g.id+'.html';fs.writeFileSync(path.join(root,file),html);
  await page.goto(base+'/'+file);await page.emulateMedia({media:'print'});
  const evidence=await page.evaluate(({g,artwork})=>{
   if(g.keep)document.querySelectorAll('.sheet').forEach(s=>{if(!s.matches(g.keep))s.remove();});
   const sheets=[...document.querySelectorAll('.sheet')];if(sheets.length!==g.folios.length)throw Error('Wrong component page count');
   const changes=sheets.map((s,i)=>{
    const content=s.querySelector('.page-content,.content'),before=content.innerText;
    const folio=g.folios[i];s.dataset.folio=folio;s.classList.toggle('verso',folio%2===0);
    const footer=s.querySelector('footer');if(footer){footer.firstElementChild.textContent='THE VEGETABLE GURU';footer.lastElementChild.textContent='IMPERIAL · '+folio;}
    if(g.id==='opening'&&folio===3){s.querySelector('.harvest').src=artwork.H3;s.querySelector('.about .tile img').src=artwork.S1;}
    let headingChange,editionPlacement;
    const replacement=g.headingOverrides?.[s.id]||g.folioOverrides?.[folio];
    if(replacement){
     const heading=content.querySelector('h1'),sourceHeading=heading.innerText;
     if(replacement.before&&sourceHeading.replace(/\s+/g,' ')!==replacement.before.replace(/\s+/g,' '))throw Error('Source heading changed: '+folio);
     const rest=content.innerText.replace(sourceHeading,'');
     heading.replaceChildren(document.createTextNode(replacement.lines[0]));
     if(replacement.lines[1]){const emphasis=document.createElement('span');emphasis.textContent=replacement.lines[1];if(replacement.source)heading.append(document.createTextNode(' '));heading.append(emphasis);}
     if(content.innerText.replace(heading.innerText,'')!==rest)throw Error('Topic body changed beyond requested heading');
     headingChange={sourceHeading,replacementHeading:heading.innerText,copySource:replacement.source?'scripts/lib/book-review-refinements.mjs#'+replacement.source:'contents.expanded.gettingStarted.entries[technique:why-grow].label'};
     if(replacement.source){
      s.classList.add('unified-topic-heading');
      heading.classList.add('review-change');heading.dataset.change='Topic and coloured qualifier share a line wherever they fit';
      const eyebrow=content.querySelector('.eyebrow');
      headingChange.sourceEyebrow=eyebrow.innerText;eyebrow.textContent=replacement.eyebrow;
      headingChange.replacementEyebrow=eyebrow.innerText;
      if(headingChange.sourceEyebrow!==headingChange.replacementEyebrow){eyebrow.classList.add('review-change');eyebrow.dataset.change='Same running title throughout each topic';}
     }
    }else if(g.id==='opening'&&folio===2){
     const edition=content.querySelector('.facts>div:last-child dd');
     const unit=document.createElement('span');unit.textContent='Imperial edition · ';unit.className='review-change';unit.dataset.change='Edition stated once near the front';
     edition.prepend(unit);editionPlacement={text:'Imperial edition',retainedMetadata:edition.innerText.replace('Imperial edition','').trim()};
    }else if(content.innerText!==before)throw Error('Body wording changed');
    return {folio,id:s.id||g.id+'-'+i,bodyText:content.innerText,...(headingChange?{headingChange}: {}),...(editionPlacement?{editionPlacement}:{})};
   });
   const style=document.createElement('style');style.textContent='@page{size:185mm 240mm;margin:0} @media print{.sheet{margin:0!important}.sheet:last-child{break-after:auto}} .about .tile img{object-fit:contain} .sheet.unified-topic-heading h1{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:.22em;row-gap:0;font-size:42px;line-height:1.04;margin:2.5mm 0 3mm;color:#173e2c} .sheet.unified-topic-heading h1 span{display:inline-block;white-space:nowrap;font-size:30px;line-height:1.04;margin:0;color:#a44007}';document.head.append(style);
   return changes;
  },{g,artwork:Object.fromEntries(['H3','S1'].map(id=>[id,art(id)]))});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const dom=await page.evaluate(()=>[...document.querySelectorAll('.sheet')].map(s=>{
   const b=s.getBoundingClientRect(),content=s.querySelector('.page-content,.content').getBoundingClientRect();
   const footer=s.querySelector('footer')?.getBoundingClientRect(),source=s.querySelector('.source-note')?.getBoundingClientRect();
   const bottom=Math.max(content.bottom,source?.bottom||0),gap=((footer?.top||b.bottom-30)-bottom)*25.4/96;
   if(gap<3)throw Error('Component footer collision '+s.dataset.folio+': '+gap);
   const sourceGap=source?(source.top-content.bottom)*25.4/96:null;
   if(sourceGap!==null&&sourceGap<1)throw Error('Body/source-note collision '+s.dataset.folio+': '+sourceGap);
   let topicHeading;
   if(s.classList.contains('unified-topic-heading')){
    const h=s.querySelector('h1'),qualifier=h.querySelector('span'),hs=getComputedStyle(h),qs=getComputedStyle(qualifier);
    const hr=h.getBoundingClientRect(),qr=qualifier.getBoundingClientRect(),range=document.createRange();range.selectNodeContents(h.firstChild);const tr=range.getBoundingClientRect();
    const lineCount=hr.height>42*1.04+1?2:1;
    if(Math.abs(hr.height-(lineCount===1?42:42+30)*1.04)>1)throw Error('Unexpected topic heading height: '+s.dataset.folio);
    if(qr.right>hr.right+1||qr.width>hr.width+1)throw Error('Qualifier overflow: '+s.dataset.folio);
    if(lineCount===2&&tr.width+qr.width+parseFloat(hs.columnGap)<=hr.width-1)throw Error('Unnecessary topic heading wrap: '+s.dataset.folio);
    topicHeading={runningTitle:s.querySelector('.eyebrow').innerText,firstLine:h.firstChild.textContent.trim(),qualifier:qualifier.textContent,lineCount,firstLinePx:parseFloat(hs.fontSize),qualifierPx:parseFloat(qs.fontSize),firstColour:hs.color,qualifierColour:qs.color};
   }
   const blocks=[...s.querySelectorAll('h1,h2,h3,p,li,figcaption,td,th,dd,dt,footer')].filter(e=>!e.querySelector('p,li')).map(e=>{const r=e.getBoundingClientRect();if(e.scrollWidth>e.clientWidth+1)throw Error('Overflow: '+e.textContent);return {text:e.innerText,left:(r.left-b.left)*25.4/96,top:(r.top-b.top)*25.4/96,right:(r.right-b.left)*25.4/96,bottom:(r.bottom-b.top)*25.4/96};});
   const changes=[...s.querySelectorAll('.review-change')].map(e=>{const r=e.getBoundingClientRect();return {description:e.dataset.change,text:e.innerText,left:(r.left-b.left)*25.4/96,top:(r.top-b.top)*25.4/96,right:(r.right-b.left)*25.4/96,bottom:(r.bottom-b.top)*25.4/96};});
   return {folio:Number(s.dataset.folio),footerClearanceMm:gap,sourceNoteClearanceMm:sourceGap,...(topicHeading?{topicHeading}:{}),blocks,changes,images:[...s.querySelectorAll('img')].map(i=>i.src)};
  }));
  fs.writeFileSync(path.join(root,file),await page.content());
  const pdf=scratch+'/'+g.id+'.pdf';await page.pdf({path:path.join(root,pdf),width:'185mm',height:'240mm',preferCSSPageSize:true,printBackground:true});
  for(const src of dom.flatMap(d=>d.images)){const p=new URL(src).pathname;const f=p.startsWith('/images/')||p.startsWith('/fonts/')?'public'+p:p.slice(1);assets[f]=sha256(fs.readFileSync(path.join(root,f)));}
  checks.components.push({id:g.id,pdf,sha256:sha256(fs.readFileSync(path.join(root,pdf))),html:file,folios:g.folios,evidence,dom});
  console.log(g.id+': '+g.folios.length+' pages, body wording preserved, requested headings and physical gutters applied');
 }
 const {navigation,...footers}=await buildNavigationOverlays();checks.footers=footers;checks.navigation=navigation;
 if(checks.components.flatMap(c=>c.evidence||[]).filter(e=>e.headingChange?.copySource.startsWith('scripts/lib/book-review-refinements')).length!==16)throw Error('Expected all sixteen technique headings');
 verify();if(bookLayoutRevision()!==book.revision)throw Error('Book copy changed during assembly preparation');
 fs.writeFileSync(path.join(root,dir,'COMPONENT-CHECKS.json'),JSON.stringify(checks,null,2)+'\n');
}finally{await browser.close();}
