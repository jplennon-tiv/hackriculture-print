import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const dir=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(dir,'../../../..');
const copyPath=path.resolve(root,'../hackriculture-resources/summaries/cultivation-dig-no-dig/copy.json');
const copy=JSON.parse(await fs.readFile(copyPath,'utf8'));
const rel=path.relative(root,dir).split(path.sep).join('/');
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formats=['imperial','metric'];
const all=[];
for(const units of formats){
  const text=s=>escape(s.replace(/\{(\w+)\}/g,(_,key)=>copy.measurements[key][units]));
  const footer=(folio)=>`<footer><span>THE VEGETABLE GURU · DRAFT</span><span>${units.toUpperCase()} · ${folio}</span></footer>`;
  const source=`<p class="source-note">${text(copy.sourceNote)}</p>`;
  const a=copy.overview;
  const overview=`<section class="sheet overview" data-folio="149"><div class="page-content">
    <header><p class="eyebrow">${text(copy.section)} · Cultivation</p><h1>${text(a.title)}<span>${text(a.subtitle)}</span></h1><p class="lead">${text(a.lead)}</p></header>
    <figure class="comparison"><img src="assets/comparison-v2.png" alt="Two equally healthy beds: compost mixed into topsoil on the left, and a surface layer on the right."><figcaption>${a.diagramCaptions.map(c=>`<div><h3>${text(c.title)}</h3><p>${text(c.text)}</p></div>`).join('')}</figcaption></figure>
    <section class="matrix"><h2>${text(a.matrixTitle)}</h2><table><colgroup><col><col><col><col></colgroup><thead><tr>${a.columns.map(c=>`<th scope="col">${text(c)}</th>`).join('')}</tr></thead><tbody>${a.rows.map(r=>`<tr aria-label="${text(r.label)}">${['digPro','digCon','noDigPro','noDigCon'].map(key=>`<td>${text(r[key])}</td>`).join('')}</tr>`).join('')}</tbody></table></section>
    <section class="closing"><h2>${text(a.closingTitle)}</h2><p>${text(a.closing)}</p></section>
    </div>${footer(149)}</section>`;
  const method=(key,folio,asset,alt)=>{
    const p=copy[key];
    return `<section class="sheet method ${folio%2===0?'verso':''}" data-folio="${folio}"><div class="page-content">
      <header><p class="eyebrow">${text(copy.section)} · Cultivation</p><h1>${text(p.title)}<span>${text(p.method)}</span></h1><p class="lead">${text(p.lead)}</p><p class="kit"><b>You need:</b> ${text(p.kit)}</p></header>
      <figure class="sequence"><img src="assets/${asset}" alt="${escape(alt)}"></figure>
      <div class="steps">${p.steps.map((step,i)=>`<section class="step"><h3><span class="number">${i+1}</span>${text(step.title)}</h3><p>${text(step.text)}</p></section>`).join('')}</div>
      <section class="care"><h2>${text(p.careTitle)}</h2><p>${text(p.care)}</p></section>
      <aside class="caution"><h2>${text(p.cautionTitle)}</h2><p>${text(p.caution)}</p></aside>
      </div>${folio===151?source:''}${footer(folio)}</section>`;
  };
  const html=`<!doctype html><html lang="en-GB"><meta charset="utf-8"><title>${escape(copy.topic)} | ${units} draft</title><link rel="stylesheet" href="draft.css"><main>${overview}${method('noDig',150,'no-dig-sequence-v1.png','Three stages: overlapping cardboard; surface compost; newly planted bed.')}${method('digging',151,'digging-sequence-v1.png','Three stages: save soil from the first trench; turn successive strips; fill, rake and plant.')}</main></html>`;
  await fs.writeFile(path.join(dir,units+'.html'),html);
}
const browser=await chromium.launch();
try{
  for(const units of formats){
    const page=await browser.newPage({viewport:{width:1400,height:1100}});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
    await page.goto(`http://127.0.0.1:5173/${rel}/${units}.html`);
    await page.emulateMedia({media:'print'});
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
    const checks=await page.evaluate(()=>{
      const mm=96/25.4;
      const round=n=>Math.round(n*1000)/1000;
      return {
        fonts:[...document.fonts].map(f=>({family:f.family,status:f.status})),
        images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0,width:i.naturalWidth,height:i.naturalHeight})),
        pages:[...document.querySelectorAll('.sheet')].map(s=>{
          const bounds=s.getBoundingClientRect(),foot=s.querySelector('footer').getBoundingClientRect();
          const content=s.querySelector('.page-content').getBoundingClientRect();
          const source=s.querySelector('.source-note')?.getBoundingClientRect();
          const blocks=[...s.querySelectorAll('h1,h2,h3,p,th,td,footer,img')].map(e=>{
            const r=e.getBoundingClientRect();
            return {tag:e.tagName,text:e.innerText||e.getAttribute('src'),leftMm:round((r.left-bounds.left)/mm),rightMm:round((r.right-bounds.left)/mm),topMm:round((r.top-bounds.top)/mm),bottomMm:round((r.bottom-bounds.top)/mm),fontPt:round(parseFloat(getComputedStyle(e).fontSize)*.75)};
          });
          return {folio:Number(s.dataset.folio),contentBottomMm:round((content.bottom-bounds.top)/mm),footerTopMm:round((foot.top-bounds.top)/mm),footerGapMm:round((foot.top-Math.max(content.bottom,source?.bottom||0))/mm),sourceGapMm:source?round((source.top-content.bottom)/mm):null,blocks,text:s.innerText,copyBlocks:[...s.querySelectorAll('.page-content p,.page-content h1,.page-content h2,.page-content h3,.page-content th,.page-content td,.source-note,footer')].map(e=>e.innerText)};
        })
      };
    });
    const violations=[];
    for(const p of checks.pages){
      if(p.footerGapMm<3)violations.push(`folio ${p.folio}: footer gap ${p.footerGapMm}mm`);
      if(p.sourceGapMm!==null&&p.sourceGapMm<2)violations.push(`folio ${p.folio}: source collision ${p.sourceGapMm}mm`);
      const left=p.folio%2===0?8:17,right=p.folio%2===0?168:177;
      for(const b of p.blocks)if(b.leftMm<left-.15||b.rightMm>right+.15||b.topMm<5||b.bottomMm>233)violations.push(`folio ${p.folio}: unsafe ${b.tag}`);
    }
    const record={units,errors,violations,...checks};all.push(record);
    await fs.writeFile(path.join(dir,'DOM-CHECKS.json'),JSON.stringify({copyPath,status:'Draft, not approved or assembled',results:all},null,2)+'\n');
    if(errors.length||checks.images.some(i=>!i.loaded)||checks.fonts.some(f=>f.status!=='loaded')||violations.length)throw Error(JSON.stringify({units,errors,violations}));
    const output=path.join(root,'output/pdf/topic-pages',`cultivation-dig-no-dig-${units}-draft.pdf`);
    await fs.mkdir(path.dirname(output),{recursive:true});
    await page.pdf({path:output,preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
    await fs.writeFile(path.resolve(path.dirname(copyPath),`summary-${units}.txt`),`DRAFT: ${copy.topic}\nGenerated from copy.json; edit that source, then rebuild.\n\n`+checks.pages.map(p=>`PROPOSED FOLIO ${p.folio}\n\n${p.text}`).join('\n\n\n')+'\n');
    console.log(JSON.stringify({units,output,pages:checks.pages.map(p=>({folio:p.folio,contentBottomMm:p.contentBottomMm,footerGapMm:p.footerGapMm,sourceGapMm:p.sourceGapMm}))}));
    await page.close();
  }
}finally{await browser.close();}
