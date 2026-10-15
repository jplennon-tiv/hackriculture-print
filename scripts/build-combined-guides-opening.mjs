import fs from 'node:fs/promises';
import {chromium} from 'playwright';
import {readBookContent,sha256} from './lib/book-content.mjs';
import {renderGuideKey} from './lib/book-guide-key.mjs';
import {applyReadableGuideExamples} from './lib/guide-example-widgets.mjs';
const dir='docs/publication/combined-guides-opening',tmp='tmp/pdfs/combined-guides-opening',base='http://127.0.0.1:5173';
await fs.mkdir(dir,{recursive:true});await fs.mkdir(tmp,{recursive:true});
const book=readBookContent(),opener=book.data.book.sectionOpeners.find(s=>s.id==='varieties');
const baseline=JSON.parse(await fs.readFile('docs/publication/whole-book-order-preview/CHECKS.json'));
const guards={...book.inputs,...book.assets,[baseline.pdf]:baseline.sha256};
for(const key of ['radish','broccoli']){const p=`../hackriculture-data/vegetables/${key}/${key}.json`;guards[p]=sha256(await fs.readFile(p));}
for(const [p,h]of Object.entries(guards))if(sha256(await fs.readFile(p))!==h)throw Error('Source changed: '+p);
const {body}=renderGuideKey(book.data,'imperial',9);
await fs.writeFile(`${dir}/opening.html`,`<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><title>Vegetable Guides · combined opening</title><link rel="stylesheet" href="/${dir}/opening.css"></head><body>${body}</body></html>`);
const browser=await chromium.launch();let checks,widgetExamples;const widgetSources={};
try{
 const page=await browser.newPage();
 for(const slug of ['radish','broccoli']){
  const url=`${base}/print/vegetable/${slug}?units=metric`;
  await page.goto(url,{waitUntil:'networkidle'});await page.waitForFunction(()=>document.body.dataset.printReady==='true');
  widgetSources[slug]=await page.evaluate(slug=>({url:location.href,calendar:slug==='radish'?document.querySelector('.front .calendar').outerHTML:null,needs:slug==='radish'?document.querySelector('.front .needs').outerHTML:null,difficulty:slug==='broccoli'?document.querySelector('.header-difficulty').outerHTML:null}),slug);
 }
 for(const source of Object.values(widgetSources))for(const html of [source.calendar,source.needs,source.difficulty])for(const match of (html||'').matchAll(/src="([^"]+)"/g)){const p='public'+match[1];guards[p]=sha256(await fs.readFile(p));}
 await page.route('**/@vite/client',r=>r.abort());
 await page.goto(`${base}/${dir}/opening.html`);await page.emulateMedia({media:'print'});
 const sourceText=await page.evaluate(()=>[...document.querySelectorAll('.key-calendar>p,.key-scale>p')].map(e=>e.textContent));
 await page.evaluate(opener=>{
  const sheet=document.querySelector('.sheet');sheet.classList.add('combined-opening');
  const content=sheet.querySelector('.content'),oldHeader=sheet.querySelector('.key-header');
  const header=document.createElement('header');header.className='opening-title';
  const title=document.createElement('h1');title.textContent=opener.heading.text;const span=document.createElement('span');span.textContent=opener.heading.emphasis;title.append(span);header.append(title);
  const art=document.createElement('img');art.src=opener.illustrations[0].src;art.alt=opener.illustrations[0].alt;header.append(art);
  oldHeader.replaceWith(header);
  const panel=document.createElement('aside');panel.className='how-panel';
  const label=document.createElement('h2');label.className='panel-heading';label.textContent='How to use the guides';panel.append(label);
  for(const section of [...content.querySelectorAll('.key-calendar,.key-scale')])panel.append(section);
  const calendar=panel.querySelector('.key-calendar'),calendarArt=document.createElement('div');calendarArt.className='calendar-art-row';
  calendarArt.append(calendar.querySelector('.key-calendar-example'),calendar.querySelector('.key-climates'));calendar.append(calendarArt);
  for(const section of panel.querySelectorAll('.key-scale')){
   const copy=document.createElement('div');copy.className='scale-copy';
   copy.append(section.querySelector('h2'),...section.querySelectorAll(':scope>p'));section.prepend(copy);
  }
  content.append(panel);
  const footer=sheet.querySelector('footer');footer.firstElementChild.textContent='VEGETABLE GUIDES';footer.lastElementChild.textContent='9';
 },opener);
 widgetExamples=await page.evaluate(applyReadableGuideExamples,widgetSources);
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
 checks=await page.evaluate(sourceText=>{
  const mm=96/25.4,s=document.querySelector('.sheet'),b=s.getBoundingClientRect();
  const box=e=>{const r=e.getBoundingClientRect();return {left:(r.left-b.left)/mm,top:(r.top-b.top)/mm,right:(r.right-b.left)/mm,bottom:(r.bottom-b.top)/mm};};
  const ps=[...s.querySelectorAll('.key-calendar>p,.scale-copy>p')];
  if(JSON.stringify(ps.map(e=>e.textContent))!==JSON.stringify(sourceText))throw Error('Explanation changed');
  const images=[...s.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),...box(i),loaded:!!i.naturalWidth}));
  if(images.length!==10||images.some(i=>!i.loaded))throw Error('Missing instructional image');
  const faded=[...s.querySelectorAll('.native-needs,.native-needs *, .track i')].filter(e=>Number(getComputedStyle(e).opacity)<1);
  if(faded.length)throw Error('Example still has faded elements');
  const oldCaptures=[...s.querySelectorAll('img')].filter(i=>/radish-calendar|difficulty-capture|core-needs-capture/.test(i.src));
  if(oldCaptures.length)throw Error('Flattened capture remains');
  if([...s.querySelectorAll('.native-needs img')].some(i=>Math.abs(i.getBoundingClientRect().width-24)>.1))throw Error('Core icon size override failed');
  for(const e of s.querySelectorAll('.native-calendar,.native-calendar *, .native-needs,.native-needs *, .native-difficulty,.native-difficulty *'))if(e.scrollWidth>e.clientWidth+1)throw Error('Widget overflow: '+e.textContent);
  const blocks=[...s.querySelectorAll('h1,h2,h3,p,figcaption,.key-swatches')].map(e=>({text:e.textContent,...box(e),fontPx:parseFloat(getComputedStyle(e).fontSize),overflow:e.scrollWidth>e.clientWidth+1}));
  if(blocks.some(e=>e.overflow||e.left<16||e.right>178))throw Error('Text overflow '+JSON.stringify(blocks.filter(e=>e.overflow||e.left<16||e.right>178)));
  const panel=box(s.querySelector('.how-panel')),footer=box(s.querySelector('footer'));
  const headingStyle=getComputedStyle(s.querySelector('.panel-heading'));
  const panelHeading={fontPx:parseFloat(headingStyle.fontSize),colour:headingStyle.color,textAlign:headingStyle.textAlign};
  if(panelHeading.fontPx!==30||panelHeading.colour!=='rgb(164, 64, 7)'||panelHeading.textAlign!=='center')throw Error('Panel heading treatment missing');
  if(s.innerText.includes('Use the calendar and scales to compare crops and plan their care.'))throw Error('Removed introductory sentence remains');
  if(panel.bottom>footer.top-3)throw Error('Panel too tall: '+JSON.stringify({panel,footer,sections:[...s.querySelectorAll('.panel-heading,.panel-intro,.key-calendar,.key-scale,.scale-art,.key-calendar-example,.key-climates')].map(e=>({class:e.className,...box(e)}))}));
  if(ps.some(e=>parseFloat(getComputedStyle(e).fontSize)!==14))throw Error('Body size changed');
  return {folio:9,side:'right',panel,panelHeading,removedPanelIntro:true,footer,footerGapMm:footer.top-panel.bottom,blocks,images,bodyParagraphs:sourceText};
 },sourceText);
 await fs.writeFile(`${dir}/opening.html`,await page.content());
 await page.pdf({path:`${tmp}/opening.pdf`,preferCSSPageSize:true,printBackground:true});
}finally{await browser.close();}
for(const img of checks.images){const p=img.src.startsWith('/images/')?'public'+img.src:img.src.slice(1);if(!guards[p])guards[p]=sha256(await fs.readFile(p));}
for(const [p,h]of Object.entries(guards))if(sha256(await fs.readFile(p))!==h)throw Error('Source changed: '+p);
const implementation=Object.fromEntries(await Promise.all(['scripts/build-combined-guides-opening.mjs','scripts/lib/guide-example-widgets.mjs',`${dir}/opening.css`,'scripts/lib/book-guide-key.mjs','docs/publication/guide-key/guide-key.css','docs/publication/vegetable-guru-entry-pages/entry-pages.css'].map(async p=>[p,sha256(await fs.readFile(p))])));
await fs.writeFile(`${dir}/CHECKS.json`,JSON.stringify({date:'2026-10-15',status:'Combined opener proposal; full book unchanged',bookRevision:book.revision,inputs:guards,implementation,widgetSources,widgetExamples,pdf:`${tmp}/opening.pdf`,sha256:sha256(await fs.readFile(`${tmp}/opening.pdf`)),checks,omissions:['Section number/eyebrow','Choose it. Grow it. Enjoy it. strapline','Opener introduction and closing guide-count sentence','H5 how-to decorative header','Use the calendar and scales to compare crops and plan their care.'],preserved:'All three how-to explanations, six original instructional illustrations and three original guide icons; three screenshot examples rebuilt from the original guide DOM, retaining dates and ratings; 10.5 pt body retained.',placement:'Blank 8 / combined opener 9, then first vegetable 10–11; requested by John to match Troubles.'},null,2)+'\n');
console.log(JSON.stringify({panel:checks.panel,footerGapMm:checks.footerGapMm}));
