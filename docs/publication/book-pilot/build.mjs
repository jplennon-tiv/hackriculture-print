// Bounded, isolated POD study: rendered approved copy, no canonical/template writes.
import fs from 'node:fs/promises';
import {existsSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {pageTwoCopy} from './page-two-copy.mjs';
import {readCollection,revision} from '../../../../hackriculture-data/lib/records.mjs';

const root=path.resolve(import.meta.dirname,'../../..');
const out=import.meta.dirname;
if(existsSync(path.join(out,'DESIGN-APPROVAL.json'))){
 throw Error('Approved compact-book reference is frozen. Develop a separate book renderer/output path; see docs/BOOK-PRINT-STYLE.md.');
}
const base='http://127.0.0.1:5173';
const pdfOut=path.join(root,'output/pdf/publication-book-pilot');
const sourceRevision=revision();
const v=readCollection('vegetables').kale;
assert.equal(v.ai_print_layout.status,'approved');
const css=await fs.readFile(path.join(out,'pilot.css'),'utf8');
await fs.mkdir(pdfOut,{recursive:true});
await fs.mkdir(path.join(root,'tmp/pdfs/publication-book-pilot'),{recursive:true});
await fs.writeFile(path.join(root,'tmp/pdfs/publication-book-pilot/blank.html'),'<!doctype html><html><head><title>Isolated print renderer</title></head><body></body></html>');
const browser=await chromium.launch();
const results=[];
const measureOnly=process.argv.includes('--measure-only');
try{
 const page=await browser.newPage({viewport:{width:1100,height:1200}});
 for(const unit of ['imperial','metric']){
  const captured={};
  for(const [kind,route,selector]of [['vegetable','vegetable/kale','.rich-print'],['trouble','trouble/carrot_and_parsnip_troubles','.editorial-trouble']]){
   await page.goto(`${base}/print/${route}?units=${unit}`,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
   captured[kind]=await page.evaluate(selector=>{
    if(document.body.dataset.printError)throw Error(document.body.dataset.printError);
    const el=document.querySelector(selector).cloneNode(true);
    if(selector==='.editorial-trouble'){
     const source=el.querySelector('.measure');
     const entries=[...source.querySelectorAll('[data-source-entry]')];
     entries.slice(6).forEach(e=>e.remove());
     el.querySelector(':scope>div:last-child').replaceChildren();
    }
    return {html:el.outerHTML,css:[...document.querySelectorAll('style')].map(e=>e.textContent).join('\n'),warnings:JSON.parse(document.body.dataset.printWarnings??'[]'),revision:document.body.dataset.printRevision};
   },selector);
   assert.deepEqual(captured[kind].warnings,[]);
  }
  for(const format of ['compact']){
   const [w,h]=format==='a4'?[210,297]:[185,240];
   const name=`${format}-${unit}`;
   // A new document clears the live route's React/Vite work before reflow.
   await page.goto(`${base}/tmp/pdfs/publication-book-pilot/blank.html`);
   await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><base href="${base}/"><title>POD size pilot — ${format} — ${unit}</title><style>${captured.vegetable.css}\n${captured.trouble.css}\n${css}\n:root{--trim-width:${w}mm;--trim-height:${h}mm}@page{size:${w}mm ${h}mm;margin:0}</style></head><body class="${format==='compact'?'compact-study':'a4-study'}">${captured.vegetable.html}${captured.trouble.html}</body></html>`);
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
   const result=await page.evaluate(async({format,unit,edits})=>{
    const rich=document.querySelector('.rich-print'),trouble=document.querySelector('.editorial-trouble');
    // Book-only consolidation: retain the full source; remove repeated display copy.
    const consolidations=[];
    const counts=()=>Object.fromEntries(Object.entries({facts:'.fact-grid article',varieties:'.varieties article',keyRisks:'.key-risks article',pestRows:'.pests tbody tr',plantingStages:'.stages article',finalTips:'.tips>div',topReminders:'.remember>div'}).map(([k,sel])=>[k,rich.querySelectorAll(sel).length]));
    const originalCounts=counts();
    const measurementRows=[...rich.querySelector('.measurements').children];
    const factValues=[...rich.querySelectorAll('.fact-grid p')].map(e=>e.textContent.trim());
    for(const row of measurementRows.slice(0,3)){
     const copy=row.cloneNode(true);copy.querySelector('b').remove();
     const value=copy.textContent.trim();
     if(!factValues.includes(value))throw Error('Repeated measurement differs from Quick Facts: '+value);
     consolidations.push({kind:'Repeated measurement',removed:row.textContent,retainedIn:'Quick facts',value});row.remove();
    }
    for(const {selector,expected,proposed,label} of edits){
     const el=rich.querySelector(selector);
     if(!el||el.textContent!==expected)throw Error('Source changed; review book summary: '+selector);
     consolidations.push({kind:'Page-two book summary',selector,removed:expected,replacement:proposed});
     if(label)el.replaceChildren(el.querySelector('b'),document.createTextNode(' '+proposed.slice(label.length).trim()));
     else el.textContent=proposed;
    }
    const facts=rich.querySelector('.fact-grid'),items=[...facts.children];
    for(const ids of [[0,1,2,3,4,6],[5,7]]){const col=document.createElement('div');col.className='fact-column';col.append(...ids.map(i=>items[i]));facts.append(col);}
    const originals=[...rich.querySelectorAll('p,li,td,th,h2,h3,.measurements')].map(e=>e.textContent.trim()).filter(Boolean).sort();
    const originalImages=[...rich.querySelectorAll('img')].map(e=>e.getAttribute('src')).sort();
    // Remove only runtime spacing additions: source text and illustrations stay intact.
    rich.querySelectorAll('[style]').forEach(e=>{e.style.removeProperty('margin-top');e.style.removeProperty('margin-bottom');if(e.tagName==='TR')e.style.removeProperty('height');});
    const front=rich.querySelector('.front'),back=rich.querySelector('.back');
    const repeatedEyebrow=back.querySelector('header>.eyebrow');
    consolidations.push({kind:'Requested redundant header removal',removed:repeatedEyebrow.textContent});
    repeatedEyebrow.remove();
    const sheets=[...rich.querySelectorAll('.sheet')];
    const parity=()=>[...document.querySelectorAll('.sheet:not([data-template])')].filter(e=>!e.closest('.measure')).forEach((p,i)=>p.classList.toggle('verso',i%2===0));
    parity();
    const source=trouble.querySelector('.measure'),output=trouble.querySelector(':scope>div:last-child');
    const originalsTrouble=[...source.querySelectorAll('[data-source-entry]')].map(e=>({key:e.dataset.key,text:e.textContent,images:[...e.querySelectorAll('img')].map(i=>i.getAttribute('src'))}));
    if(format==='compact')for(const entry of source.querySelectorAll('[data-source-entry]')){
     // Give the heading the full column width, then let advice wrap around
     // complete artwork without a fixed-height illustration row.
     const img=entry.querySelector('.diagnostic');
     if(img)entry.querySelector('.advice').prepend(img);
    }
    // Compact book columns: paginate whole entries, no count quota or padded
    // cards. The live A4 paginator remains unchanged.
    function paginateEditorial(source,output){
     output.replaceChildren();const template=source.querySelector('[data-template]');
     const originals=[...source.querySelectorAll('[data-source-entry]')];
     const pages=[];let current,column,columnIndex;
     function addPage(){current=template.cloneNode(true);current.removeAttribute('data-template');
      if(pages.length){current.classList.replace('opening','continuation');current.querySelector('.intro')?.remove();}
      current.classList.toggle('verso',(sheets.length+pages.length)%2===0);
      output.append(current);pages.push(current);columnIndex=0;column=current.querySelectorAll('[data-column]')[columnIndex];}
     const fits=e=>e.getBoundingClientRect().bottom<=current.querySelector('footer').getBoundingClientRect().top-14;
     addPage();for(const original of originals){const entry=original.cloneNode(true);entry.removeAttribute('data-source-entry');column.append(entry);
      if(!fits(entry)){entry.remove();if(columnIndex===0){columnIndex=1;column=current.querySelectorAll('[data-column]')[columnIndex];}else addPage();column.append(entry);if(!fits(entry))throw Error('Whole diagnostic entry cannot fit: '+entry.dataset.key);}
     }
     // John's book refinement: align outer text edges with space between
     // natural-height entries, after content-first packing is complete.
     pages.forEach(p=>p.querySelector('.columns').classList.add('align-ends'));
     return pages.length;
    }
    // Account for the global recto/verso position while measuring the excerpt.
    source.querySelector('[data-template]').classList.toggle('verso',sheets.length%2===0);
    paginateEditorial(source,output);parity();
    const finalTrouble=[...output.querySelectorAll('.entry')].map(e=>({key:e.dataset.key,text:e.textContent,images:[...e.querySelectorAll('img')].map(i=>i.getAttribute('src'))}));
    source.remove();
    const all=[...document.querySelectorAll('.sheet')];
    all.forEach((p,i)=>{
     p.dataset.pilotPage=String(i+1);
     p.querySelector('footer').innerHTML=`<span>BOOK PILOT · ${format==='a4'?'A4':'185 × 240 mm'} · ${unit.toUpperCase()}</span><span>${p.closest('.rich-print')?'KALE':'TROUBLES SAMPLE'} · ${i+2}</span>`;
    });
    const finalText=[...rich.querySelectorAll('p,li,td,th,h2,h3,.measurements')].map(e=>e.textContent.trim()).filter(Boolean).sort();
    const finalImages=[...rich.querySelectorAll('img')].map(e=>e.getAttribute('src')).sort();
    const checks=all.map(p=>{
     const box=p.getBoundingClientRect(),footer=p.querySelector('footer').getBoundingClientRect();
     const textEdge=(el,edge)=>{
      if(!el)return null;
      const range=document.createRange();range.selectNodeContents(el);
      const edges=[...range.getClientRects()].filter(r=>r.width&&r.height).map(r=>r[edge]);
      return edges.length?+(Math[edge==='top'?'min':'max'](...edges)-box.top).toFixed(3):null;
     };
     const troubleColumns=[...p.querySelectorAll('[data-column]')].map(e=>({widthMm:+(e.getBoundingClientRect().width/3.77952756).toFixed(2),keys:[...e.querySelectorAll('.entry')].map(a=>a.dataset.key),topTextPx:textEdge(e.firstElementChild?.querySelector('.crops'),'top'),bottomTextPx:textEdge(e.lastElementChild?.querySelector('.advice section:last-child p'),'bottom')}));
     const content=p.querySelector('.content-end')?.getBoundingClientRect().bottom??Math.max(...[...p.querySelectorAll('.entry')].map(e=>e.getBoundingClientRect().bottom));
     const textOverflow=[];const walker=document.createTreeWalker(p,NodeFilter.SHOW_TEXT);
     while(walker.nextNode()){
      const n=walker.currentNode;if(!n.textContent.trim())continue;
      const range=document.createRange();range.selectNodeContents(n);
      for(const r of range.getClientRects())if(r.width&&r.height&&(r.left<box.left+1||r.right>box.right-1||r.top<box.top||r.bottom>box.bottom))textOverflow.push(n.textContent.trim().slice(0,60));
     }
     const header=p.querySelector('header'),title=header?.querySelector('h1'),nav=header?.querySelector('.navigation'),badge=header?.querySelector('.header-difficulty');
     if(nav&&title&&title.getBoundingClientRect().bottom>nav.getBoundingClientRect().top-2)textOverflow.push('Header title overlaps navigation');
     if(badge&&title&&title.getBoundingClientRect().right>badge.getBoundingClientRect().left-4&&title.getBoundingClientRect().bottom>badge.getBoundingClientRect().top-2)textOverflow.push('Header title overlaps difficulty badge');
     return {troubleColumns,columnSections:[...p.querySelectorAll('.growing-columns>div>section')].map(e=>({name:e.className,heightPx:e.getBoundingClientRect().height})),sections:[...p.children].map(e=>({tag:e.className||e.tagName,heightMm:+(e.getBoundingClientRect().height/3.77952756).toFixed(2)})),page:Number(p.dataset.pilotPage),kind:p.closest('.rich-print')?'vegetable':'trouble',classes:p.className,widthMm:+(box.width/3.77952756).toFixed(2),heightMm:+(box.height/3.77952756).toFixed(2),footerGapMm:+((footer.top-content)/3.77952756).toFixed(2),textOverflow,
      bodyPt:[...new Set([...p.querySelectorAll('.growing-columns li,.advice p,.intro,.fact-grid p,.varieties p,.pests td')].map(e=>+(parseFloat(getComputedStyle(e).fontSize)*.75).toFixed(2)))].sort((a,b)=>a-b),
      diagnosticSlots:[...p.querySelectorAll('.diagnostic')].map(e=>({widthPx:e.width,heightPx:e.height,fit:getComputedStyle(e).objectFit}))};
    });
    return {format,unit,consolidations,counts:counts(),selectionCountsPreserved:JSON.stringify(counts())===JSON.stringify(originalCounts),pages:checks,vegetableTextPreservedAfterListedConsolidations:JSON.stringify(originals)===JSON.stringify(finalText),vegetableImagesPreserved:JSON.stringify(originalImages)===JSON.stringify(finalImages),troubleEntriesPreserved:JSON.stringify(originalsTrouble)===JSON.stringify(finalTrouble),troubleKeys:finalTrouble.map(e=>e.key),fonts:document.fonts.status,missingImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)};
   },{format,unit,edits:pageTwoCopy(unit)});
   assert.equal(result.vegetableTextPreservedAfterListedConsolidations,true);
   assert.equal(result.selectionCountsPreserved,true);
   assert.equal(result.vegetableImagesPreserved,true);
   assert.equal(result.troubleEntriesPreserved,true);
   assert.equal(result.troubleKeys.length,6);
   assert.equal(new Set(result.troubleKeys).size,6);
   assert.deepEqual(result.missingImages,[]);
   assert.equal(result.fonts,'loaded');
   if(measureOnly){await page.locator('.rich-print .back').screenshot({path:path.join(root,'tmp/pdfs/publication-book-pilot',unit+'-draft.png')});await page.locator('.editorial-trouble .sheet').first().screenshot({path:path.join(root,'tmp/pdfs/publication-book-pilot',unit+'-trouble-draft.png')});console.log(JSON.stringify(result));continue;}
   for(const p of result.pages){assert.deepEqual(p.textOverflow,[]);assert(p.footerGapMm>=3,`${name} page ${p.page}: only ${p.footerGapMm} mm footer clearance`);}
   for(const p of result.pages.filter(p=>p.kind==='trouble'))for(const edge of ['topTextPx','bottomTextPx']){
    const values=p.troubleColumns.map(c=>c[edge]);
    assert(values.every(v=>Number.isFinite(v)),`Missing column text edge: ${edge}`);
    assert(Math.max(...values)-Math.min(...values)<=.1,`${name}: ${edge} differs between columns`);
   }
   const html=await page.content();
   await fs.writeFile(path.join(out,name+'.html'),html.replace(`<base href="${base}/">`,'').replaceAll('src="/','src="../../../public/').replaceAll('url("/fonts/','url("../../../public/fonts/').replaceAll("url('/fonts/","url('../../../public/fonts/").replaceAll('url(/fonts/','url(../../../public/fonts/'));
   const bytes=await page.pdf({width:`${w}mm`,height:`${h}mm`,preferCSSPageSize:true,printBackground:true,scale:1,margin:{top:0,bottom:0,left:0,right:0}});
   await fs.writeFile(path.join(pdfOut,name+'.pdf'),bytes);
   result.physicalPages=(bytes.toString('latin1').match(/\/Type\s*\/Page\b/g)??[]).length;
   assert.equal(result.physicalPages,result.pages.length,'Physical PDF pagination differs from DOM');
   result.sha256=createHash('sha256').update(bytes).digest('hex');
   results.push(result);
   console.log(JSON.stringify(result));
  }
 }
 assert.equal(revision(),sourceRevision,'Canonical data changed during pilot');
 if(!measureOnly)await fs.writeFile(path.join(out,'CHECKS.json'),JSON.stringify({checkedAt:new Date().toISOString(),sourceRevision,canonicalUnchanged:true,scope:'Kale complete guide; first six Carrot and Parsnip Troubles conditions, excerpt only',results},null,2)+'\n');
}finally{await browser.close();}
