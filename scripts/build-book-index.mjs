import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {resolveIndex,hash} from './lib/book-index.mjs';
import {root,escapeHtml as esc} from './lib/book-content.mjs';
import {bookLayoutRevision} from '../../hackriculture-data/lib/book-layout.mjs';

const args=process.argv.slice(2);
if(args.some(a=>!['--topic-map=','--plan=','--review-dir=','--output-dir=','--start-page=','--book-pdf='].some(k=>a.startsWith(k))&&a!=='--integrated'))throw Error('Unknown index build option');
const option=name=>args.find(a=>a.startsWith(name+'='))?.slice(name.length+1);
const resolved=resolveIndex({planPath:option('--plan'),topicMapPath:option('--topic-map')});
if(!resolved.identicalEditionReferences)throw Error('Edition pagination differs: separate unit indexes are required before export. No existing proof overwritten.');
const integrated=args.includes('--integrated'),startPage=Number(option('--start-page')||1),bookPdf=option('--book-pdf');
if(!Number.isInteger(startPage)||startPage<1)throw Error('Invalid index start folio');
if(integrated&&(!option('--review-dir')||!option('--output-dir')||!option('--topic-map')||!bookPdf))throw Error('Integrated index needs separate output directories and a topic map');
const relative=option('--review-dir')||'docs/publication/book-index';
const dir=path.join(root,relative),out=path.join(root,option('--output-dir')||'output/pdf/book-index');
await fs.mkdir(dir,{recursive:true});
await fs.mkdir(out,{recursive:true});
await fs.writeFile(path.join(dir,'RESOLVED.json'),JSON.stringify(resolved,null,2)+'\n');
const entries=resolved.editions.imperial,byId=new Map(entries.map(e=>[e.id,e]));
const items=entries.map(e=>({id:e.id,letter:(e.sortAs||e.term)[0].toUpperCase(),html:`<p class="entry" id="entry-${esc(e.id)}"><span class="term">${esc(e.term)}</span>${e.see?` <span class="crossref"><em>see</em> <a href="#entry-${esc(e.see)}">${esc(byId.get(e.see).term)}</a></span>`:`<span class="references">${e.displayReferences.map(ref=>`<a href="${integrated?esc(bookPdf)+'#page='+(parseInt(ref.label,10)+2):'/'+esc(ref.pdf)+'#page='+ref.page}" target="_blank">${esc(ref.label)}</a>`).join(', ')}</span>`}${e.seeAlso?.length?` <span class="crossref"><em>see also</em> ${e.seeAlso.map(id=>esc(byId.get(id).term)).join('; ')}</span>`:''}</p>`}));
const legend=resolved.temporaryTopicReferences?'Review key: number = book · T = techniques · C = cultivation. T/C references are temporary.':'Page numbers follow the supplied book assembly and topic-page map.';
const header=range=>`<header><h1>${esc(resolved.heading)}<span>${range}</span></h1>${integrated?'':`<p class="legend">${esc(legend)}</p>`}</header>`;
const stylesheet=integrated?'docs/publication/whole-book-order-preview/index.css':'docs/publication/book-index/index.css';
const shell=body=>`<!doctype html><html lang="en-GB"><meta charset="utf-8"><title>The Vegetable Guru · Index proof</title><link rel="stylesheet" href="/${stylesheet}"><main>${body}</main></html>`;
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1000,height:1100}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
 await fs.writeFile(path.join(dir,'index.html'),shell(`<section class="sheet">${header('A–Z')}<div class="columns"><div class="column" id="measure"><h2 class="letter">A</h2>${items.map(x=>x.html).join('')}</div><div></div></div></section>`));
 await page.goto('http://127.0.0.1:5173/'+relative+'/index.html',{waitUntil:'networkidle'});await page.emulateMedia({media:'print'});await page.evaluate(()=>document.fonts.ready);
 const m=await page.evaluate(()=>{const col=document.querySelector('#measure'),letter=col.querySelector('.letter'),cs=getComputedStyle(letter),rect=letter.getBoundingClientRect();const probe=letter.cloneNode(true);col.append(probe);const gap=parseFloat(getComputedStyle(probe).marginTop);probe.remove();return {heights:[...col.querySelectorAll('.entry')].map(e=>e.getBoundingClientRect().height+parseFloat(getComputedStyle(e).marginBottom)),letterHeight:rect.height+parseFloat(cs.marginBottom),letterGap:gap,top:col.getBoundingClientRect().top,maxBottom:222*96/25.4};});
 const maxHeight=m.maxBottom-m.top;
 function pack(limit){const cols=[];let col=[],height=0,last='';
  for(let i=0;i<items.length;i++){
   const item=items[i],newLetter=item.letter!==last,heading=newLetter||!col.length;
   let extra=m.heights[i]+(heading?m.letterHeight+(col.length?m.letterGap:0):0);
   // Keep short alphabetic sections intact instead of leaving one isolated entry.
   let groupEnd=i+1;while(groupEnd<items.length&&items[groupEnd].letter===item.letter)groupEnd++;
   if(newLetter && col.length && groupEnd-i<=4){
    const groupHeight=m.heights.slice(i,groupEnd).reduce((a,b)=>a+b,0)+m.letterHeight+m.letterGap;
    if(height+groupHeight>limit){cols.push(col);col=[];height=0;extra=m.heights[i]+m.letterHeight;}
   }
   if(col.length && height+extra>limit){cols.push(col);col=[];height=0;extra=m.heights[i]+m.letterHeight;}
   const continued=!newLetter&&!col.length;
   col.push({...item,heading:newLetter||!col.length,continued});height+=extra;last=item.letter;
  }
  if(col.length)cols.push(col);return cols;
 }
 const minimum=pack(maxHeight),pageCount=Math.ceil(minimum.length/2);
 if(pageCount>4)throw Error(`Index needs ${pageCount} pages at readable size; inspect curation/layout before expanding.`);
 // Balance every column at its actual measured height; never shrink body text.
 const desired=pageCount*2;let lo=maxHeight*.5,hi=maxHeight;
 for(let i=0;i<16;i++){const mid=(lo+hi)/2;if(pack(mid).length<=desired)hi=mid;else lo=mid;}
 const columns=pack(hi+.2),pages=[];
 for(let i=0;i<columns.length;i+=2){const pair=columns.slice(i,i+2),n=pages.length+1;const letters=pair.flat().map(x=>x.letter),range=letters[0]===letters.at(-1)?letters[0]:letters[0]+'–'+letters.at(-1);
  const folio=startPage+n-1;
  pages.push(`<section class="sheet ${folio%2===0?'verso':''}" data-page="${n}">${header(range)}<div class="columns">${pair.map(col=>`<div class="column">${col.map(x=>(x.heading?`<h2 class="letter">${x.letter}${x.continued?'<span class="continued">continued</span>':''}</h2>`:'')+x.html).join('')}</div>`).join('')}</div><footer><span>THE VEGETABLE GURU</span><span>${integrated?'IMPERIAL':'INDEX PROOF'} · ${folio}</span></footer></section>`);
 }
 await fs.writeFile(path.join(dir,'index.html'),shell(pages.join('')));await page.reload({waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 const checks=await page.evaluate(()=>[...document.querySelectorAll('.sheet')].map(s=>{const box=s.getBoundingClientRect(),footer=s.querySelector('footer').getBoundingClientRect();const blocks=[...s.querySelectorAll('h1,h2,p,footer')].map(e=>{const q=e.getBoundingClientRect();return {text:e.innerText,left:(q.left-box.left)*25.4/96,top:(q.top-box.top)*25.4/96,right:(q.right-box.left)*25.4/96,bottom:(q.bottom-box.top)*25.4/96,fontPt:parseFloat(getComputedStyle(e).fontSize)*.75};});return {page:Number(s.dataset.page),entryIds:[...s.querySelectorAll('.entry')].map(e=>e.id.slice(6)),columnBottoms:[...s.querySelectorAll('.column')].map(c=>c.lastElementChild.getBoundingClientRect().bottom),footerGapMm:(footer.top-Math.max(...[...s.querySelectorAll('.column')].map(c=>c.lastElementChild.getBoundingClientRect().bottom)))*25.4/96,blocks};}));
 if(checks.flatMap(c=>c.entryIds).join('|')!==items.map(i=>i.id).join('|'))throw Error('Index entry order/coverage changed during pagination');
 for(const c of checks){if(c.footerGapMm<3)throw Error('Index footer collision');for(const b of c.blocks){if(b.left<4.9||b.right>180.1||b.bottom>233||b.top<5)throw Error('Index unsafe text');}}
 if(errors.length)throw Error(errors.join('\n'));
 if(bookLayoutRevision()!==resolved.sourceRevision)throw Error('Editable book copy changed during index generation; reload before export.');
 for(const [file,evidence] of Object.entries(resolved.inputs))if(hash(await fs.readFile(path.join(root,file)))!==evidence.sha256)throw Error('Source proof changed during indexing: '+file);
 const pdf=path.join(out,'vegetable-guru-index-draft.pdf');await page.pdf({path:pdf,preferCSSPageSize:true,printBackground:true});
 const report={date:new Date().toISOString().slice(0,10),status:integrated?'Current numeric index component; fit passed; actual PDF and visual checks recorded with full-book integration':'Standalone index component; checks recorded separately',entries:entries.length,crossReferences:entries.filter(e=>e.see).length,pages:checks.length,bodyTypePt:9.45,identicalEditionReferences:true,temporaryTopicReferences:resolved.temporaryTopicReferences,sourcePdfsChecked:Object.keys(resolved.inputs).length,sourceRevision:resolved.sourceRevision,copySha256:resolved.copySha256,pdf:{path:path.relative(root,pdf),sha256:hash(await fs.readFile(pdf))},dom:checks,errors};
 await fs.writeFile(path.join(dir,'CHECKS.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({pages:checks.length,entries:entries.length,bodyTypePt:9.45,columnHeightsTargetMm:hi*25.4/96,footerGaps:checks.map(c=>c.footerGapMm)}));
}finally{await browser.close();}
