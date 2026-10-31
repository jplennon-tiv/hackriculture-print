// Revised trial: return the key beside the basket with the existing lighter peach wash.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const source='docs/publication/contents-colour-study',dir=`${source}/key-preview`,tmp='tmp/pdfs/contents-colour-study/key-preview';
const sha=b=>createHash('sha256').update(b).digest('hex');
const approval=JSON.parse(await fs.readFile(`${source}/APPROVAL.json`));
for(const {path,sha256} of approval.files)if(sha(await fs.readFile(path))!==sha256)throw Error('Approved source changed: '+path);
const themes=JSON.parse(await fs.readFile('src/print/familyThemes.json'));
const themeSource=await fs.readFile('src/print/familyTheme.ts','utf8');
const troubleFamilies=Object.fromEntries([...themeSource.match(/export const troubleFamilies[^=]*=\{([^}]+)\}/)[1].matchAll(/(\w+):'([^']+)'/g)].map(m=>[m[1],m[2]]));
const troubleKey=label=>label.toLowerCase().replace(/&/g,'and').replace(/,/g,'').replace(/\s+/g,'_').replace(/^turnip_swede_and_radish$/,'turnip_swede_radish')+'_troubles';
const inputs={};
for(const p of [...approval.files.map(f=>f.path),`${source}/APPROVAL.json`,'src/print/familyThemes.json','src/print/familyTheme.ts','docs/publication/contents-update/contents.css','docs/publication/vegetable-guru-entry-pages/entry-pages.css','output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'])inputs[p]=sha(await fs.readFile(p));
for(const p of [dir,tmp,'output/pdf/contents-colour-study'])await fs.mkdir(p,{recursive:true});
const browser=await chromium.launch(),results=[];
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const unit of ['imperial','metric']){
  await page.goto(`http://127.0.0.1:5173/${source}/coloured-text-${unit}.html`);
  await page.emulateMedia({media:'print'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const baseline=await page.evaluate(()=>({rows:[...document.querySelectorAll('li')].map(e=>({text:e.textContent,box:JSON.stringify(e.getBoundingClientRect().toJSON())})),first:document.querySelectorAll('.sheet')[0].outerHTML,images:[...document.images].map(i=>({src:i.getAttribute('src'),art:i.dataset.artwork}))}));
  const troubleRows=await page.locator('.sheet[data-folio="5"] .contents-grid>section:first-child li').evaluateAll(rows=>rows.map(r=>r.dataset.toc));
  const troubleThemes=troubleRows.map(label=>{const key=troubleKey(label),theme=themes.find(t=>t.group===troubleFamilies[key]);if(!theme)throw Error('Missing Troubles mapping: '+label);return {label,key,group:theme.group,deep:theme.deep};});
  if(troubleThemes.length!==14)throw Error('Expected 14 Troubles entries');
  await page.evaluate(({themes,troubleThemes,dir})=>{
   document.querySelector('link[rel=stylesheet]').href=`/${dir}/key.css`;
   for(const row of document.querySelectorAll('.sheet[data-folio="5"] .contents-grid>section:first-child li')){
    const theme=troubleThemes.find(t=>t.label===row.dataset.toc);
    row.classList.add('trouble-row');row.dataset.category=theme.group;row.style.setProperty('--deep',theme.deep);row.firstElementChild.classList.add('trouble-name');
   }
   const panel=document.createElement('aside');panel.className='category-key-panel';panel.style.setProperty('--key-fill',themes.find(t=>t.id==='roots').wash);
   const title=document.createElement('h3');title.className='category-key-title';title.textContent='Category colours';
   const key=document.createElement('div');key.className='category-key';key.setAttribute('aria-label','Vegetable category colours');
   for(const theme of themes){
    const item=document.createElement('div');item.className='category-key-item';item.style.setProperty('--deep',theme.deep);
    const swatch=document.createElement('span');swatch.className='category-key-swatch';swatch.setAttribute('aria-hidden','true');
    const label=document.createElement('span');label.className='category-key-label';label.textContent=theme.group;
    item.append(swatch,label);key.append(item);
   }
   panel.append(title,key);
   const art=document.querySelector('.sheet[data-folio="5"] .contents-lower-art');
   art.querySelector('[data-artwork="H5"]').replaceWith(panel);
  },{themes,troubleThemes,dir});
  await page.evaluate(()=>document.fonts.ready);
  // Wait for the new stylesheet and its imported rules to finish applying.
  await page.waitForFunction(()=>getComputedStyle(document.querySelector('.category-key')).display==='grid');
  const checks=await page.evaluate(baseline=>{
   if(document.querySelectorAll('.sheet')[0].outerHTML!==baseline.first)throw Error('Approved A first page changed');
   const rows=[...document.querySelectorAll('li')].map(e=>({text:e.textContent,box:JSON.stringify(e.getBoundingClientRect().toJSON())}));
   if(JSON.stringify(rows)!==JSON.stringify(baseline.rows))throw Error('Existing row text or positions changed');
   if(JSON.stringify([...document.images].map(i=>({src:i.getAttribute('src'),art:i.dataset.artwork})))!==JSON.stringify(baseline.images.filter(i=>i.art!=='H5')))throw Error('Unexpected artwork change');
   const sheets=[...document.querySelectorAll('.sheet')].map(s=>{
    const b=s.getBoundingClientRect(),mm=96/25.4;
    const box=e=>{const r=e.getBoundingClientRect();return {left:(r.left-b.left)/mm,top:(r.top-b.top)/mm,right:(r.right-b.left)/mm,bottom:(r.bottom-b.top)/mm};};
    const footerGapMm=(s.querySelector('footer').getBoundingClientRect().top-s.querySelector('.content').getBoundingClientRect().bottom)/mm;
    const key=[...s.querySelectorAll('.category-key-item')].map(e=>({text:e.textContent,fontPt:parseFloat(getComputedStyle(e).fontSize)*.75,colour:getComputedStyle(e).color,...box(e),overflow:e.scrollWidth>e.clientWidth+1}));
    if(footerGapMm<3||key.some(k=>k.overflow||Math.abs(k.fontPt-8)>.01))throw Error('Key does not fit');
    const troubleRows=[...s.querySelectorAll('.trouble-row')].map(e=>({text:e.textContent,category:e.dataset.category,colour:getComputedStyle(e).color,fontPt:parseFloat(getComputedStyle(e).fontSize)*.75,...box(e),overflow:e.scrollWidth>e.clientWidth+1}));
    if(troubleRows.some(r=>r.overflow||r.fontPt!==10.5))throw Error('Troubles row does not fit');
    const panel=s.querySelector('.category-key-panel');
    if(panel&&[...panel.children].some(e=>e.getBoundingClientRect().bottom>panel.getBoundingClientRect().bottom))throw Error('Key panel overflow');
    const keyPlacement=panel?{...box(panel),background:getComputedStyle(panel).backgroundColor,paletteToken:'roots.wash',besideHarvest:panel.parentElement.classList.contains('contents-lower-art')}:null;
    if(keyPlacement&&(!keyPlacement.besideHarvest||Math.abs(keyPlacement.bottom-keyPlacement.top-34)>.1))throw Error('Key placement incorrect');
    return {folio:Number(s.dataset.folio),footerGapMm,key,keyPlacement,troubleRows,blocks:[...s.querySelectorAll('li>span,h1,.contents-section>span,footer,.category-key-title,.category-key-label')].map(e=>({text:e.textContent,...box(e)})),images:[...s.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),...box(i),loaded:!!i.naturalWidth}))};
   });
   return {sheets,originalRowTextAndPositionsRetained:true,firstPageUnchanged:true};
  },baseline);
  const html=`${dir}/${unit}.html`,pdf=`${tmp}/${unit}.pdf`;
  await fs.writeFile(html,(await page.content()).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''));
  await page.pdf({path:pdf,preferCSSPageSize:true,printBackground:true});
  results.push({unit,html,pdf,troubleThemes,...checks});
  console.log(JSON.stringify({unit,footerGapsMm:checks.sheets.map(s=>s.footerGapMm),keyItems:checks.sheets[1].key.length}));
 }
 if(errors.length)throw Error(errors.join('\n'));
 for(const [p,h]of Object.entries(inputs))if(sha(await fs.readFile(p))!==h)throw Error('Source changed: '+p);
 await fs.writeFile(`${dir}/CHECKS.json`,JSON.stringify({date:'2026-10-30',status:'Option A approved; lower key panel restored with paler peach background for review',inputs,results,keyFontPt:8,keyLayout:'Four rows of two categories in the lower panel beside H6 harvest; existing roots.wash background',intentionalArtworkChange:'H5 seedlings replaced by key panel; retain both header images and H6 harvest basket',mainBookChanged:false,howToChanged:false,sharedJsonChanged:false},null,2)+'\n');
}finally{await browser.close();}
