import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {topicHeadings} from './lib/book-review-refinements.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const overlap=process.argv.includes('--overlap');
const baseDir='docs/publication/top-tip-panels';
const dir=baseDir+(overlap?'/overlap':''),out='output/pdf/top-tip-panels'+(overlap?'/overlap':'');
const cssPath='docs/publication/topic-pages/techniques-expansion/references/collection-approved-2026-10-12/draft.css';
const panels=[
 {id:'plot-layout',folio:152,selector:'.closing',title:'Keep the middle within reach',source:'expansion'},
 {id:'plot-layout-branching',folio:153,selector:'.planning-note',title:'Give the paths a shape that suits the ground…',source:'expansion'},
 {id:'compost-use',folio:155,selector:'.closing',title:'Put it back to work',source:'reader'},
 {id:'sowing',folio:160,selector:'.closing',title:'A small experiment: mixed salad leaves',source:'reader'},
 {id:'greenhouse-no-dig-seasons',folio:165,selector:'.greenhouse-care',title:'The regular jobs',source:'reader'}
];
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFile(path.join(root,p),'utf8');const inputs={};
async function source(p){const b=await fs.readFile(path.join(root,p));inputs[p]=sha(b);return b.toString();}
await fs.mkdir(path.join(root,dir),{recursive:true});await fs.mkdir(path.join(root,out),{recursive:true});
const base='http://127.0.0.1:5173/';
const topTipCss=await source(baseDir+'/top-tip.css')+(overlap?'\n'+await source(dir+'/overlap.css'):'');await source(cssPath);
await source('scripts/lib/book-review-refinements.mjs');
const unified=`.sheet.unified-topic-heading h1{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:.22em;row-gap:0;font-size:42px;line-height:1.04;margin:2.5mm 0 3mm;color:#173e2c}.sheet.unified-topic-heading h1 span{display:inline-block;white-space:nowrap;font-size:30px;line-height:1.04;margin:0;color:#a44007}`;
const svg={
 ribbon:'<svg viewBox="0 0 108 32" aria-hidden="true"><path class="fold" d="M4 24L12 32L12 23Z"/><path class="main" d="M0 3L108 0L99 14L108 28L4 30L8 16Z"/></svg>',
 splash:'<svg viewBox="0 0 108 34" aria-hidden="true"><path class="main" d="M5 12L1 6L17 5L22 1L34 4L45 0L57 3L70 0L77 4L94 2L94 7L106 9L102 15L108 21L99 25L101 31L84 29L75 34L63 30L50 34L39 30L24 33L20 28L6 29L9 23L0 20Z"/></svg>'
};
const browser=await chromium.launch();const results=[];
try{
 for(const units of ['imperial','metric']){
  const expansion=await source(`docs/publication/topic-pages/techniques-expansion/${units}.html`);
  const reader=await source(`docs/publication/reader-edit-pass/techniques/${units}.html`);
  for(const variant of (overlap?['baseline','ribbon']:['baseline','ribbon','splash'])){
   const page=await browser.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+' '+r.url());});
   await page.goto(base+'docs/publication/topic-pages/techniques-expansion/'+units+'.html',{waitUntil:'networkidle'});
   await page.emulateMedia({media:'print'});
   const sourceText=await page.evaluate(({expansion,reader,panels,topicHeadings,cssPath,unified,topTipCss,variant,svg,base})=>{
    const parse=s=>new DOMParser().parseFromString(s,'text/html');
    const originals={expansion:parse(expansion),reader:parse(reader)},texts={};
    document.querySelectorAll('script').forEach(e=>e.remove());
    document.head.innerHTML='<meta charset="utf-8"><title>Top tip · '+variant+'</title><link rel="stylesheet" href="/'+cssPath+'">';
    const style=document.createElement('style');style.textContent=unified+'\n'+topTipCss;document.head.append(style);
    const main=document.createElement('main');document.body.replaceChildren(main);
    for(const p of panels){
     const source=originals[p.source],original=source.getElementById(p.id);if(!original)throw Error('Missing '+p.id);
     const s=document.importNode(original,true);s.classList.remove('reader-change');s.querySelectorAll('.reader-change').forEach(e=>e.classList.remove('reader-change'));
     const h=topicHeadings[p.id];s.classList.add('unified-topic-heading');s.classList.toggle('verso',p.folio%2===0);s.dataset.folio=p.folio;
     s.querySelector('.eyebrow').textContent=h.eyebrow;
     const title=s.querySelector('h1');title.replaceChildren(document.createTextNode(h.lines[0]+' '));const qualifier=document.createElement('span');qualifier.textContent=h.lines[1];title.append(qualifier);
     const footer=s.querySelector('footer');footer.firstElementChild.textContent='GROWING TECHNIQUES';footer.lastElementChild.textContent=p.folio;
     const assetBase=source.querySelector('base')?.href||base+'docs/publication/topic-pages/techniques-expansion/';
     for(const image of s.querySelectorAll('img'))image.src=new URL(image.getAttribute('src'),assetBase).href;
     main.append(s);texts[p.id]=s.textContent;
     const panel=s.querySelector(p.selector);if(!panel||getComputedStyle(panel).backgroundColor==='transparent')throw Error('Missing panel '+p.id);
     if(variant!=='baseline'){
      panel.classList.add('top-tip-panel','tip-'+variant);
      const badge=document.createElement('span');badge.className='top-tip-badge';badge.innerHTML=svg[variant]+'<span>Top tip</span>';panel.prepend(badge);
     }
    }
    return texts;
   },{expansion,reader,panels,topicHeadings,cssPath,unified,topTipCss,variant,svg,base});
   await page.waitForLoadState('networkidle');
   await page.evaluate(async()=>{await Promise.all([document.fonts.load('42px Lilita'),document.fonts.load('12.6px Nunito')]);await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
   const checks=await page.evaluate(({panels,sourceText})=>{
    const mm=96/25.4;const near=(a,b)=>Math.abs(a-b)<.1;
    return panels.map(p=>{
     const s=document.getElementById(p.id),bounds=s.getBoundingClientRect(),panel=s.querySelector(p.selector),b=panel.getBoundingClientRect(),badge=panel.querySelector('.top-tip-badge'),bg=badge?.getBoundingClientRect();
     const content=s.querySelector('.page-content').getBoundingClientRect(),source=s.querySelector('.source-note').getBoundingClientRect(),footer=s.querySelector('footer').getBoundingClientRect();
     const oldBadges=[...s.querySelectorAll('.top-tip-badge')].map(x=>{const parent=x.parentNode,next=x.nextSibling;x.remove();return {x,parent,next};});
     const textUnchanged=s.textContent===sourceText[p.id];for(const {x,parent,next} of oldBadges)parent.insertBefore(x,next);
     const textBoxes=[...s.querySelectorAll('h1,h2,h3,p,figcaption,footer,img,.top-tip-badge>span')].map(e=>{const r=e.getBoundingClientRect();return {tag:e.tagName,text:e.innerText||e.alt||'',left:(r.left-bounds.left)/mm,right:(r.right-bounds.left)/mm,top:(r.top-bounds.top)/mm,bottom:(r.bottom-bounds.top)/mm,overflow:e.scrollWidth>e.clientWidth+1};});
     const collisions=[];
     if(bg){for(const e of s.querySelectorAll('h1,h2,h3,p,figcaption,img')){
      const range=document.createRange();range.selectNodeContents(e);
      for(const r of range.getClientRects())if(r.left<bg.right&&r.right>bg.left&&r.top<bg.bottom&&r.bottom>bg.top)collisions.push(e.textContent);
     }}
     return {folio:p.folio,id:p.id,title:p.title,textUnchanged,bodyFontPt:parseFloat(getComputedStyle(panel.querySelector('p')).fontSize)*.75,sourceGapMm:(source.top-content.bottom)/mm,footerGapMm:(footer.top-Math.max(source.bottom,content.bottom))/mm,panelMm:{left:(b.left-bounds.left)/mm,top:(b.top-bounds.top)/mm,width:b.width/mm,height:b.height/mm},badgeMm:bg?{left:(bg.left-bounds.left)/mm,top:(bg.top-bounds.top)/mm,width:bg.width/mm,height:bg.height/mm}:null,collisions,textBoxes};
    });
   },{panels,sourceText});
   const violations=[];
   for(const c of checks){
    if(!c.textUnchanged)violations.push(c.id+': text changed');
    if(c.sourceGapMm<1||c.footerGapMm<3)violations.push(c.id+': footer/source clearance');
    if(c.bodyFontPt!==9.45)violations.push(c.id+': body size');
    if(c.collisions.length)violations.push(c.id+': badge overlaps text '+c.collisions.join('; '));
    if(c.badgeMm&&(c.badgeMm.left<5||c.badgeMm.left+c.badgeMm.width>180))violations.push(c.id+': decoration too close to trim');
    const left=c.folio%2?17:8,right=left+160;
    for(const b of c.textBoxes)if(b.left<left-.2||b.right>right+.2||b.top<5||b.bottom>233||b.overflow)violations.push(c.id+': unsafe '+b.tag+' '+b.text.slice(0,35));
   }
   const fonts=await page.evaluate(()=>[...document.fonts].map(f=>({family:f.family,status:f.status})));
   const html=`${dir}/${variant}-${units}.html`,pdf=`${out}/${variant}-${units}.pdf`;
   await fs.writeFile(path.join(root,html),await page.content());
   await page.pdf({path:path.join(root,pdf),preferCSSPageSize:true,printBackground:true});
   const result={variant,units,html,pdf,sha256:sha(await fs.readFile(path.join(root,pdf))),checks,fonts,errors,violations};results.push(result);
   await fs.writeFile(path.join(root,dir,'CHECKS.json'),JSON.stringify({status:'Unapproved design comparisons; full book unchanged',panels,inputs,results},null,2)+'\n');
   console.log(JSON.stringify({variant,units,violations,pages:checks.map(c=>({folio:c.folio,sourceGapMm:c.sourceGapMm,footerGapMm:c.footerGapMm}))}));
   await page.close();
   if(errors.length||violations.length||fonts.some(f=>f.status!=='loaded'))throw Error('Proof checks failed: '+variant+' '+units);
  }
 }
}finally{await browser.close();}
for(const [p,h] of Object.entries(inputs))if(sha(await fs.readFile(path.join(root,p)))!==h)throw Error('Source changed during proof: '+p);
