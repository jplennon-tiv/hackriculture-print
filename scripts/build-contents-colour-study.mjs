// Author-requested colour experiments; saved contents, numbering and guide files stay intact.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {readBookContent} from './lib/book-content.mjs';
const dir='docs/publication/contents-colour-study',tmp='tmp/pdfs/contents-colour-study';
const sha=b=>createHash('sha256').update(b).digest('hex');
const book=readBookContent(),themes=JSON.parse(await fs.readFile('src/print/familyThemes.json'));
const cropThemes=book.data.contents.families.flatMap(f=>f.entries.map(e=>({label:e.label,key:e.key,...themes.find(t=>t.id===f.id)})));
if(cropThemes.length!==44||cropThemes.some(c=>!c.deep))throw Error('Incomplete category mapping');
const variants=[{id:'coloured-text',letter:'A',name:'Coloured crop names'},{id:'bracketed-categories',letter:'B',name:'Categories in brackets'},{id:'tinted-rows',letter:'C',name:'Pale category stripes'}];
const inputs={...book.inputs};
for(const p of ['docs/publication/contents-update/imperial.html','docs/publication/contents-update/metric.html','docs/publication/contents-update/contents.css','src/print/familyThemes.json','output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf'])inputs[p]=sha(await fs.readFile(p));
for(const p of [dir,tmp,'output/pdf/contents-colour-study'])await fs.mkdir(p,{recursive:true});
const browser=await chromium.launch(),results=[];
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const unit of ['imperial','metric'])for(const variant of variants){
  await page.goto(`http://127.0.0.1:5173/docs/publication/contents-update/${unit}.html`);await page.emulateMedia({media:'print'});await page.evaluate(()=>document.fonts.ready);
  const baseline=await page.evaluate(()=>({rows:[...document.querySelectorAll('li')].map(e=>e.textContent),images:[...document.images].map(i=>i.getAttribute('src')),second:document.querySelectorAll('.sheet')[1].outerHTML}));
  await page.evaluate(({cropThemes,variant,dir})=>{
   document.querySelector('link[rel=stylesheet]').href=`/${dir}/study.css`;document.body.className=variant.id;
   for(const row of document.querySelectorAll('.sheet[data-folio="4"] li[data-toc]')){
    const theme=cropThemes.find(c=>c.label===row.dataset.toc);if(!theme)throw Error('Missing category: '+row.dataset.toc);
    row.classList.add('crop-row');row.dataset.category=theme.group;
    for(const k of ['deep','soft','wash','paper'])row.style.setProperty('--'+k,theme[k]);
    const title=row.firstElementChild;title.classList.add('crop-name');
    if(variant.id==='bracketed-categories'){
     const category=document.createElement('span');category.className='category';category.textContent=' ('+theme.group+')';title.append(category);
    }
   }
  },{cropThemes,variant,dir});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const checks=await page.evaluate(baseline=>{
   if(document.querySelectorAll('.sheet')[1].outerHTML!==baseline.second)throw Error('Second contents page changed');
   const now=[...document.querySelectorAll('li')].map(e=>{const c=e.cloneNode(true);for(const s of c.querySelectorAll('.category'))s.remove();return c.textContent;});
   if(JSON.stringify(now)!==JSON.stringify(baseline.rows))throw Error('Contents text/order/reference changed');
   if(JSON.stringify([...document.images].map(i=>i.getAttribute('src')))!==JSON.stringify(baseline.images))throw Error('Artwork changed');
   const sheets=[...document.querySelectorAll('.sheet')].map(s=>{
    const b=s.getBoundingClientRect(),mm=96/25.4,footer=s.querySelector('footer').getBoundingClientRect();
    const box=e=>{const r=e.getBoundingClientRect();return {left:(r.left-b.left)/mm,top:(r.top-b.top)/mm,right:(r.right-b.left)/mm,bottom:(r.bottom-b.top)/mm};};
    const rows=[...s.querySelectorAll('li')].map(e=>({label:e.dataset.toc||null,category:e.dataset.category||null,text:e.textContent,fontPt:parseFloat(getComputedStyle(e).fontSize)*.75,...box(e),overflow:e.scrollWidth>e.clientWidth+1}));
    const blocks=[...s.querySelectorAll('li>span,h1,.contents-section>span,footer')].map(e=>({text:e.textContent,...box(e)}));
    const footerGap=(footer.top-s.querySelector('.content').getBoundingClientRect().bottom)/mm;
    if(rows.some(e=>e.overflow||e.fontPt!==10.5)||footerGap<3)throw Error('Rows or footer do not fit: '+JSON.stringify({rows:rows.filter(e=>e.overflow),footerGap}));
    const images=[...s.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),...box(i),loaded:!!i.naturalWidth}));
    if(images.some(i=>!i.loaded))throw Error('Missing image');
    return {folio:Number(s.dataset.folio),rows,blocks,images,footerGapMm:footerGap};
   });
   return {sheets,labels:document.querySelectorAll('.crop-row').length,images:document.images.length,originalRowsRetained:true,secondPageUnchanged:true};
  },baseline);
  const file=`${dir}/${variant.id}-${unit}.html`;
  let html=await page.content();html=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,'');
  await fs.writeFile(file,html);
  const pdf=`${tmp}/${variant.id}-${unit}.pdf`;await page.pdf({path:pdf,preferCSSPageSize:true,printBackground:true});
  results.push({...variant,unit,html:file,pdf,...checks});
  console.log(JSON.stringify({variant:variant.letter,unit,footerGaps:checks.sheets.map(s=>s.footerGapMm),wrappedRows:checks.sheets[0].rows.filter(r=>r.bottom-r.top>7).map(r=>r.label)}));
 }
 if(errors.length)throw Error(errors.join('\n'));
 for(const [p,h]of Object.entries(inputs))if(sha(await fs.readFile(p))!==h)throw Error('Source changed: '+p);
 await fs.writeFile(`${dir}/CHECKS.json`,JSON.stringify({date:'2026-10-30',status:'Three separate contents experiments; none approved or installed',inputs,cropThemes:cropThemes.map(({key,label,group,id})=>({key,label,group,id})),results,bodyPt:10.5,mainBookChanged:false,howToChanged:false,sharedJsonChanged:false},null,2)+'\n');
}finally{await browser.close();}
