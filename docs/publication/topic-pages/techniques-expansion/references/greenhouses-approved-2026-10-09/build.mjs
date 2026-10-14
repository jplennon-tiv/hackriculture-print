import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const dir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(dir,'../../../..');
const copyPath=path.resolve(root,'../hackriculture-resources/summaries/techniques-expansion/copy.json');
const copy=JSON.parse(await fs.readFile(copyPath,'utf8'));
const rel=path.relative(root,dir).split(path.sep).join('/');
const focusArg=process.argv.find(a=>a.startsWith('--pages='));
const focusIds=focusArg?focusArg.slice(8).split(','):[];
const focusIndexes=focusIds.map(id=>{const i=copy.pages.findIndex(p=>p.id===id);if(i<0)throw Error(`Unknown page: ${id}`);return i;});
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const all=[];
for(const units of ['imperial','metric']){
 const t=s=>escape(s.replace(/\{(\w+)\}/g,(_,key)=>copy.measurements[key][units]));
 const blocks=p=>p.blocks?`<div class="blocks ${p.blocks.length===2?'two':''}">${p.blocks.map(b=>`<section class="block"><h2>${t(b.title)}</h2><p>${t(b.text)}</p></section>`).join('')}</div>`:'';
 const hero=p=>`<figure class="hero"><img src="assets/${p.image}" alt="${t(p.imageAlt)}">${p.caption?`<figcaption>${t(p.caption)}</figcaption>`:''}</figure>`;
 const closing=p=>p.closing?`<aside class="closing"><h2>${t(p.closing.title)}</h2><p>${t(p.closing.text)}</p></aside>`:'';
 const layoutOptions=p=>`<div class="layout-options-list">${p.options.map(o=>`<section class="layout-option"><figure><img src="assets/${o.image}" alt="${t(o.imageAlt)}"><figcaption>${t(o.caption)}</figcaption></figure><div><h2>${t(o.title)}</h2><p>${t(o.text)}</p></div></section>`).join('')}</div>`;
 const greenhouseOptions=p=>`<div class="greenhouse-options-list">${p.options.map(o=>`<section class="greenhouse-option"><figure><img src="assets/${o.image}" alt="${t(o.imageAlt)}"><figcaption>${t(o.caption)}</figcaption></figure><div><h2>${t(o.title)}</h2>${o.paragraphs.map(s=>`<p>${t(s)}</p>`).join('')}</div></section>`).join('')}</div>`;
 const greenhouseNoDig=p=>`<div class="greenhouse-options-list">${p.options.map(o=>`<section class="no-dig-method"><h2>${t(o.title)}</h2><p class="method-intro">${t(o.paragraphs[0])}</p><div class="greenhouse-option"><figure><img src="assets/${o.image}" alt="${t(o.imageAlt)}"><figcaption>${t(o.caption)}</figcaption></figure><div>${o.paragraphs.slice(1).map(s=>`<p>${t(s)}</p>`).join('')}</div></div></section>`).join('')}</div>`;
 const greenhouseSeasons=p=>`<section class="season-sequence"><h2>${t(p.seasonsTitle)}</h2><div>${p.seasons.map(s=>`<section><h3>${t(s.title)}</h3><p>${t(s.text)}</p></section>`).join('')}</div></section><aside class="greenhouse-care"><h2>${t(p.careTitle)}</h2><div>${p.care.map(s=>`<section><h3>${t(s.title)}</h3><p>${t(s.text)}</p></section>`).join('')}</div></aside>`;
 const branching=p=>`<section class="branching-method"><h2>${t(p.methodTitle)}</h2><figure><img src="assets/${p.image}" alt="${t(p.imageAlt)}"><div class="diagram-captions">${p.imageCaptions.map(c=>`<p>${t(c)}</p>`).join('')}</div></figure><div class="branch-copy">${p.bodyParagraphs.map(s=>`<p>${t(s)}</p>`).join('')}</div></section>`;
 const steps=p=>`<section class="steps-section">${p.stepsTitle?`<h2>${t(p.stepsTitle)}</h2>`:''}<div class="steps">${p.steps.map((s,i)=>`<section class="step"><h3>${p.layout==='sowing'?'':`<span class="number">${i+1}</span>`}${t(s.title)}</h3><p>${t(s.text)}</p></section>`).join('')}</div></section>`;
 const svgText=(x,y,s,extra='')=>`<text x="${x}" y="${y}" ${extra}>${t(s)}</text>`;
 const plot=p=>`<figure class="diagram"><h2>${t(p.diagramTitle)}</h2><svg viewBox="0 0 605 196" role="img" aria-label="Plan of growing beds with a main path along the south edge and short access paths pointing north">
 <defs><marker id="tip" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#a44007"/></marker></defs>
 <rect x="116" y="10" width="358" height="140" rx="5" fill="#a9632d"/><path d="M126 25H464" stroke="#c38d51" stroke-width="9"/>
 <path d="M212 148V50M330 148V50" stroke="#f3d6a2" stroke-width="30"/>
 <rect x="116" y="144" width="358" height="27" fill="#f3d6a2"/>
 ${[147,177,258,287,380,413,449].map(x=>[42,77,112].map(y=>`<ellipse cx="${x}" cy="${y}" rx="9" ry="6" fill="#9acc49"/><path d="M${x-4} ${y+3}L${x+4} ${y-3}" stroke="#32734a" stroke-width="2"/>`).join('')).join('')}
 <path d="M61 70V24" stroke="#064d32" stroke-width="3"/><path d="M54 34L61 22L68 34" fill="none" stroke="#064d32" stroke-width="3"/>${svgText(61,15,p.labels.north,'text-anchor="middle"')}
 ${svgText(6,106,p.labels.bed,'class="fine"')}<path d="M84 101H129" stroke="#53613d"/>
 ${svgText(498,42,p.labels.shortPath,'class="fine"')}<path d="M490 39L333 45" stroke="#53613d"/>
 ${svgText(486,100,p.labels.reach,'class="fine"')}<path d="M480 83H448M352 83H385" stroke="#a44007" stroke-width="2" marker-end="url(#tip)"/>
 ${svgText(295,162,p.labels.mainPath,'text-anchor="middle" class="fine"')}
 <path d="M502 162H478" stroke="#a44007" stroke-width="2" marker-end="url(#tip)"/>${svgText(509,165,p.labels.entry,'class="fine"')}
 ${svgText(295,192,p.labels.sun,'text-anchor="middle" class="fine"')}
 </svg><figcaption>${t(p.diagramCaption)}</figcaption></figure>`;
 const base=p=>`<figure class="diagram"><h2>${t(p.diagramTitle)}</h2><svg viewBox="0 0 300 238" role="img" aria-label="Greenhouse footprint with equal diagonals, central path and clear doorway">
 <rect x="52" y="30" width="196" height="166" fill="#e6edd0" stroke="#064d32" stroke-width="5"/>
 <rect x="61" y="40" width="65" height="145" fill="#b87642"/><rect x="175" y="40" width="64" height="145" fill="#b87642"/>
 <path d="M130 195H171" stroke="#fff8e9" stroke-width="9"/><path d="M55 33L245 193M245 33L55 193" stroke="#a44007" stroke-width="2" stroke-dasharray="6 4"/>
 ${svgText(150,18,p.labels.diagonal,'text-anchor="middle"')}${svgText(91,82,p.labels.bed,'text-anchor="middle" class="dark"')}${svgText(150,145,p.labels.path,'text-anchor="middle" class="fine"')}
 ${svgText(150,227,p.labels.door,'text-anchor="middle"')}<path d="M150 213V191" stroke="#064d32" stroke-width="2"/>
 <path d="M11 195V30M5 30H17M5 195H17" stroke="#064d32"/><text x="24" y="130" transform="rotate(-90 24 130)" class="fine">${t(p.labels.base)}</text>
 </svg></figure>`;
 const rotation=p=>`<figure class="diagram"><h2>${t(p.diagramTitle)}</h2><div class="rotation-row">${p.rotation.map((r,i)=>`${i?'<span class="arrow" aria-hidden="true">→</span>':''}<div><p class="year">${t(r.year)}</p><img src="/images/heroes/richer-a/${r.asset}" alt="${t(r.crop)}"><h3>${t(r.crop)}</h3></div>`).join('')}</div><figcaption>${t(p.diagramCaption)}</figcaption></figure>`;
 const cycle=p=>`<figure class="diagram"><h2>${t(p.diagramTitle)}</h2><svg viewBox="0 0 570 100" role="img" aria-label="Grow, harvest, compost, return to soil, then grow again">
 ${p.cycle.map((s,i)=>`<rect x="${i*145}" y="10" width="133" height="43" rx="21" fill="${i%2?'#ffe1b7':'#d6ea9b'}"/>${svgText(i*145+66,37,s,'text-anchor="middle"')}${i<3?`<path d="M${i*145+136} 31h7l-4 -4m4 4l-4 4" stroke="#a44007" stroke-width="2" fill="none"/>`:''}`).join('')}
 <path d="M504 58V81H66V59m0 0l-5 6m5 -6l5 6" fill="none" stroke="#a44007" stroke-width="2"/>
 </svg><figcaption>${t(p.diagramCaption)}</figcaption></figure>`;
 const pages=copy.pages.map((p,index)=>{
  let content='';
  if(p.layout==='layout-options')content=layoutOptions(p)+closing(p);
  else if(p.layout==='layout-branching')content=branching(p)+`<aside class="planning-note"><p>${t(p.lead)}</p></aside>`+blocks(p)+closing(p);
  else if(p.layout==='plot-plan')content=plot(p)+blocks(p)+closing(p);
  else if(p.layout==='greenhouse-choose')content=blocks(p)+`<div class="base-row">${base(p)}${steps(p)}</div>`;
  else if(p.layout==='greenhouse-options')content=greenhouseOptions(p)+closing(p);
  else if(p.layout==='greenhouse-seasons')content=greenhouseNoDig(p)+greenhouseSeasons(p);
  else if(p.layout==='rotation')content=rotation(p)+blocks(p)+`<section class="families"><h2>${t(p.familiesTitle)}</h2><table><tbody>${p.families.map(row=>`<tr><th scope="row">${t(row[0])}</th><td>${t(row[1])}</td></tr>`).join('')}</tbody></table></section>`+closing(p);
  else if(p.layout==='organic')content=cycle(p)+blocks(p)+closing(p);
  else if(p.layout==='compost-bins')content=hero(p)+`<div class="stages">${p.stages.map(s=>`<section><h3>${t(s.title)}</h3><p>${t(s.text)}</p></section>`).join('')}</div>`+blocks(p)+steps(p);
  else if(p.layout==='sowing')content=hero(p)+steps(p)+closing(p);
  else content=hero(p)+blocks(p)+closing(p);
  return `<section class="sheet ${p.layout} ${index%2?'verso':''}" id="${p.id}" data-folio="${index+1}"><div class="page-content"><header><p class="eyebrow">${t(p.section)}</p><h1>${t(p.title)}<span>${t(p.subtitle)}</span></h1>${p.layout==='layout-branching'||!p.lead?'':`<p class="lead">${t(p.lead)}</p>`}</header>${content}${p.footnote?`<p class="footnote">${t(p.footnote)}</p>`:''}</div><p class="source-note">${t(p.source)}</p><footer><span>THE VEGETABLE GURU · REVIEW DRAFT</span><span>${units.toUpperCase()} · ${index+1}</span></footer></section>`;
 }).join('');
 await fs.writeFile(path.join(dir,units+'.html'),`<!doctype html><html lang="en-GB"><meta charset="utf-8"><title>The Vegetable Guru · Extra pages · ${units} draft</title><link rel="stylesheet" href="draft.css"><main>${pages}</main></html>`);
}
const browser=await chromium.launch();
try{
 for(const units of ['imperial','metric']){
  const page=await browser.newPage({viewport:{width:1400,height:1100}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
  await page.goto(`http://127.0.0.1:5173/${rel}/${units}.html`,{waitUntil:'networkidle'});await page.emulateMedia({media:'print'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const checks=await page.evaluate(()=>{
   const mm=96/25.4,round=n=>Math.round(n*1000)/1000;
   return {fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0,width:i.naturalWidth,height:i.naturalHeight,effectiveDpi:Math.round(Math.max(i.naturalWidth/(i.width/96),i.naturalHeight/(i.height/96)))})),pages:[...document.querySelectorAll('.sheet')].map(s=>{
    const bounds=s.getBoundingClientRect(),foot=s.querySelector('footer').getBoundingClientRect(),content=s.querySelector('.page-content').getBoundingClientRect(),source=s.querySelector('.source-note').getBoundingClientRect();
    const blocks=[...s.querySelectorAll('h1,h2,h3,p,th,td,figcaption,footer,img,svg text')].map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName.toUpperCase(),transform:e.getAttribute('transform'),text:e.innerText||e.textContent||e.getAttribute('src'),leftMm:round((r.left-bounds.left)/mm),rightMm:round((r.right-bounds.left)/mm),topMm:round((r.top-bounds.top)/mm),bottomMm:round((r.bottom-bounds.top)/mm),fontPt:round(parseFloat(getComputedStyle(e).fontSize)*.75)};});
    return {folio:Number(s.dataset.folio),id:s.id,contentBottomMm:round((content.bottom-bounds.top)/mm),footerTopMm:round((foot.top-bounds.top)/mm),footerGapMm:round((foot.top-Math.max(content.bottom,source.bottom))/mm),sourceGapMm:round((source.top-content.bottom)/mm),blocks,text:s.innerText};
   })};
  });
  const violations=[];
  for(const p of checks.pages){
   if(p.footerGapMm<3)violations.push(`${p.id}: footer gap ${p.footerGapMm}mm`);
   if(p.sourceGapMm<2)violations.push(`${p.id}: source gap ${p.sourceGapMm}mm`);
   const left=p.folio%2===0?8:17,right=p.folio%2===0?168:177;
   for(const b of p.blocks)if(b.leftMm<left-.15||b.rightMm>right+.15||b.topMm<5||b.bottomMm>233)violations.push(`${p.id}: unsafe ${b.tag}`);
  }
  all.push({units,errors,violations,...checks});await fs.writeFile(path.join(dir,'DOM-CHECKS.json'),JSON.stringify({copyPath,status:'Draft; no book integration',results:all},null,2)+'\n');
  if(errors.length||checks.images.some(i=>!i.loaded)||checks.fonts.some(f=>f.status!=='loaded')||violations.length)throw Error(JSON.stringify({units,errors,violations}));
  const output=focusIds.length?path.join(root,'tmp/pdfs',`techniques-expansion-${units}-focused.pdf`):path.join(root,'output/pdf/topic-pages',`techniques-expansion-${units}-draft.pdf`);await fs.mkdir(path.dirname(output),{recursive:true});
  await page.pdf({path:output,preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false,...(focusIndexes.length?{pageRanges:focusIndexes.map(i=>i+1).join(',')}:{})});
  await fs.writeFile(path.resolve(path.dirname(copyPath),`summary-${units}.txt`),`DRAFT: Extra opening and Growing Techniques pages\nGenerated from copy.json; edit that source and rebuild. Review pagination only.\n\n`+checks.pages.map(p=>`REVIEW PAGE ${p.folio}\n\n${p.text}`).join('\n\n\n')+'\n');
  console.log(JSON.stringify({units,output,pages:checks.pages.map(p=>({id:p.id,bottom:p.contentBottomMm,sourceGap:p.sourceGapMm}))}));await page.close();
 }
}finally{await browser.close();}
