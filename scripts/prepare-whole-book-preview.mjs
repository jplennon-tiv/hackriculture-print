// Reflow only relocated openings/topic pages. Saved crop/Troubles PDFs are reused.
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {readBookContent,renderOpeningPages,renderEntryPages,root,sha256} from './lib/book-content.mjs';
import {bookLayoutRevision} from '../../hackriculture-data/lib/book-layout.mjs';
import {renderSectionOpeners} from './lib/section-openers.mjs';
const dir='docs/publication/whole-book-order-preview',scratch='tmp/pdfs/whole-book-order-preview';
const base='http://127.0.0.1:5173';
for(const d of [dir,scratch])fs.mkdirSync(path.join(root,d),{recursive:true});
const json=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const book=readBookContent(),plan=json('docs/publication/contents-update/ASSEMBLY-PROPOSAL.json'),edition=plan.editions.imperial;
const tocChecks=json('docs/publication/contents-update/CHECKS.json');
if(tocChecks.bookRevision!==book.revision)throw Error('Contents copy changed: refresh the contents before assembly');
const protectedFiles=tocChecks.protectedFiles;
const verify=()=>{for(const f of protectedFiles)if(sha256(fs.readFileSync(path.join(root,f.path)))!==f.sha256)throw Error('Approved source changed: '+f.path);};verify();
const collection=json('docs/publication/topic-pages/techniques-expansion/COLLECTION-APPROVAL.json');
const cultivation=json('docs/publication/topic-pages/cultivation-dig-no-dig/APPROVAL.json');
const stock=json('docs/assets/vegetable-guru-stock/ARTWORK.json');
const art=id=>'/docs/assets/vegetable-guru-stock/assets/'+stock.assets.find(x=>x.id===id).file;
const inputs={},assets={};
const read=p=>{const b=fs.readFileSync(path.join(root,p));inputs[p]=sha256(b);return b.toString();};
const themes=json('src/print/familyThemes.json');
const entry=renderEntryPages(book.data,'imperial',plan,themes);
const groups=[
 {id:'opening',body:renderOpeningPages(book.data,'imperial').body,css:'docs/publication/vegetable-guru-opening-pages/opening-pages.css',folios:[1,2,3],base:base+'/'},
 {id:'how-to',body:entry.body,css:'docs/publication/vegetable-guru-entry-pages/entry-pages.css',folios:[10,11],keep:'.how-calendar,.how-scales',base:base+'/'},
 {id:'section-openers',body:renderSectionOpeners(book.data,'imperial',edition),css:dir+'/section-openers.css',folios:edition.sectionOpeners.map(d=>d.startPage),base:base+'/'},
 {id:'techniques',html:read('docs/publication/topic-pages/techniques-expansion/imperial.html'),css:collection.frozenReference+'/draft.css',folios:collection.pageIds.map(id=>edition.additions.find(x=>x.source==='technique:'+id).startPage),base:base+'/docs/publication/topic-pages/techniques-expansion/'},
 {id:'cultivation',html:read('docs/publication/topic-pages/cultivation-dig-no-dig/imperial.html'),css:cultivation.frozenReference+'/draft.css',folios:edition.additions.filter(x=>x.source.startsWith('cultivation:')).map(x=>x.startPage),base:base+'/docs/publication/topic-pages/cultivation-dig-no-dig/'}
];
const checks={status:'Whole-book ordering preview components; imperial only',bookRevision:book.revision,copyInputs:book.inputs,protectedFiles,inputs,assets,components:[],guideReexports:0};
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
    if(g.id==='how-to')s.querySelector('header img').src=artwork[i===0?'H5':'H6'];
    if(content.innerText!==before)throw Error('Body wording changed');
    return {folio,id:s.id||g.id+'-'+i,bodyText:before};
   });
   const style=document.createElement('style');style.textContent='@page{size:185mm 240mm;margin:0} @media print{.sheet{margin:0!important}.sheet:last-child{break-after:auto}} .about .tile img{object-fit:contain}';document.head.append(style);
   return changes;
  },{g,artwork:Object.fromEntries(['H3','S1','H5','H6'].map(id=>[id,art(id)]))});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const dom=await page.evaluate(()=>[...document.querySelectorAll('.sheet')].map(s=>{
   const b=s.getBoundingClientRect(),content=s.querySelector('.page-content,.content').getBoundingClientRect();
   const footer=s.querySelector('footer')?.getBoundingClientRect(),source=s.querySelector('.source-note')?.getBoundingClientRect();
   const bottom=Math.max(content.bottom,source?.bottom||0),gap=((footer?.top||b.bottom-30)-bottom)*25.4/96;
   if(gap<3)throw Error('Component footer collision '+s.dataset.folio+': '+gap);
   const blocks=[...s.querySelectorAll('h1,h2,h3,p,li,figcaption,td,th,dd,dt,footer')].filter(e=>!e.querySelector('p,li')).map(e=>{const r=e.getBoundingClientRect();if(e.scrollWidth>e.clientWidth+1)throw Error('Overflow: '+e.textContent);return {text:e.innerText,left:(r.left-b.left)*25.4/96,top:(r.top-b.top)*25.4/96,right:(r.right-b.left)*25.4/96,bottom:(r.bottom-b.top)*25.4/96};});
   return {folio:Number(s.dataset.folio),footerClearanceMm:gap,blocks,images:[...s.querySelectorAll('img')].map(i=>i.src)};
  }));
  fs.writeFileSync(path.join(root,file),await page.content());
  const pdf=scratch+'/'+g.id+'.pdf';await page.pdf({path:path.join(root,pdf),width:'185mm',height:'240mm',preferCSSPageSize:true,printBackground:true});
  for(const src of dom.flatMap(d=>d.images)){const p=new URL(src).pathname;const f=p.startsWith('/images/')||p.startsWith('/fonts/')?'public'+p:p.slice(1);assets[f]=sha256(fs.readFileSync(path.join(root,f)));}
  checks.components.push({id:g.id,pdf,sha256:sha256(fs.readFileSync(path.join(root,pdf))),html:file,folios:g.folios,evidence,dom});
  console.log(g.id+': '+g.folios.length+' pages, wording preserved, physical gutters updated');
 }
 const footerFolios=edition.documents.flatMap(d=>Array.from({length:d.physicalPages},(_,i)=>({folio:d.startPage+i,label:d.type==='vegetable'?'GROWING GUIDES':'TROUBLESHOOTING GUIDES'})));
 const footerHtml=`<!doctype html><html><head><meta charset="utf-8"><style>@font-face{font-family:Nunito;src:url('/fonts/richer-a-6.woff2');font-weight:100 1000}*{box-sizing:border-box}body{margin:0;background:transparent}.sheet{position:relative;width:185mm;height:240mm;break-after:page;background:transparent}.sheet:last-child{break-after:auto}footer{position:absolute;bottom:8mm;display:flex;justify-content:space-between;color:#173e2c;font:900 9.4px/1.4 Nunito;letter-spacing:.7px}@page{size:185mm 240mm;margin:0}</style></head><body>${footerFolios.map(x=>`<section class="sheet"><footer style="left:${x.folio%2?17:8}mm;right:${x.folio%2?8:17}mm"><span>${x.label}</span><span>IMPERIAL · ${x.folio}</span></footer></section>`).join('')}</body></html>`;
 fs.writeFileSync(path.join(root,dir,'footers.html'),footerHtml);await page.goto(base+'/'+dir+'/footers.html');await page.evaluate(()=>document.fonts.ready);
 const footerPdf=scratch+'/footers.pdf';await page.pdf({path:path.join(root,footerPdf),preferCSSPageSize:true,printBackground:true});checks.footers={pdf:footerPdf,sha256:sha256(fs.readFileSync(path.join(root,footerPdf))),pages:footerFolios};
 verify();if(bookLayoutRevision()!==book.revision)throw Error('Book copy changed during assembly preparation');
 fs.writeFileSync(path.join(root,dir,'COMPONENT-CHECKS.json'),JSON.stringify(checks,null,2)+'\n');
}finally{await browser.close();}
