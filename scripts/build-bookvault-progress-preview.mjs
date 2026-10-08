// Rough, imperial-only screen review. Never writes approved sources or guide PDFs.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {readBookContent, escapeHtml} from './lib/book-content.mjs';

const root=path.resolve(import.meta.dirname,'..');
const relative='docs/publication/bookvault-progress-preview';
const dir=path.join(root,relative), scratch=path.join(root,'tmp/pdfs/bookvault-progress-preview');
const base=process.env.BASE_URL||'http://127.0.0.1:5173';
const bookContent=readBookContent();
const hash=b=>createHash('sha256').update(b).digest('hex');
const approved=JSON.parse(await fs.readFile(path.join(root,'docs/redesign-rollout/APPROVAL.json'),'utf8')).compactEntryPages.files;
const verify=async()=>{for(const f of approved)if(hash(await fs.readFile(path.join(root,f.path)))!==f.sha256)throw Error('Approved source changed: '+f.path)};
await verify();
await fs.mkdir(dir,{recursive:true});await fs.mkdir(scratch,{recursive:true});
const stock=JSON.parse(await fs.readFile(path.join(root,'docs/assets/vegetable-guru-stock/ARTWORK.json'),'utf8'));
const asset=id=>stock.assets.find(a=>a.id===id);
const art=id=>'/docs/assets/vegetable-guru-stock/assets/'+asset(id).file;
const sources={};
const remember=async f=>sources[f]=hash(await fs.readFile(path.join(root,f)));
const receipt={status:'Rough screen preview, not production approval',units:'imperial',sources,openingPages:[],artworkAllocation:{3:['H3','S1'],4:['H1'],5:['H2'],6:['H5'],7:['H6']},protectedApprovedFiles:approved};
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:1400,height:1100}});
 await page.route('**/@vite/client',r=>r.abort());
 for(const [name,folder,css,expected] of [['opening','vegetable-guru-opening-pages','opening-pages.css',3],['entry','vegetable-guru-entry-pages','entry-pages.css',4]]){
  const source=`docs/publication/book-layout-working/${name}/imperial.html`;
  const proof=JSON.parse(await fs.readFile(path.join(root,`docs/publication/book-layout-working/${name}/CHECKS.json`),'utf8'));
  const current=proof.results.find(r=>r.units==='imperial');
  if(proof.bookContent.revision!==bookContent.revision||!current||hash(await fs.readFile(path.join(root,source)))!==current.htmlSha256)throw Error('Rebuild current JSON opening proofs first: npm run book:build');
  await remember(source);await remember(`docs/publication/${folder}/${css}`);
  await page.goto(base+'/'+source);
  const sourceText=await page.locator('body').innerText();
  const sourceToc=await page.locator('[data-toc]').evaluateAll(items=>items.map(e=>({label:e.dataset.toc,folio:Number(e.querySelector('.page-ref').textContent)})));
  const body=await page.evaluate(({name,artwork})=>{
   if(name==='opening'){
    document.querySelector('[data-folio="3"] .harvest').src=artwork.H3;
    document.querySelector('[data-folio="3"] .harvest').alt='Summer harvest of courgettes';
    document.querySelector('[data-folio="3"] .about .tile img').src=artwork.S1;
    document.querySelector('[data-folio="3"] .about .tile img').alt='Beans and blossom';
   }else{
    for(const [folio,id] of [[4,'H1'],[5,'H2'],[6,'H5'],[7,'H6']]){
     const image=document.querySelector(`[data-folio="${folio}"] header img`);image.src=artwork[id];image.alt='Vegetable Guru stock illustration '+id;
    }
   }
   return document.body.innerHTML;
  },{name,artwork:Object.fromEntries(['H1','H2','H3','H5','H6','S1'].map(id=>[id,art(id)]))});
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(bookContent.data.book.title)} — rough ${name} pages</title><link rel="stylesheet" href="/docs/publication/${folder}/${css}"><style>@page{size:185mm 240mm;margin:0}.about .tile img{object-fit:contain}@media print{body{margin:0}.sheet{margin:0}.sheet:last-child{break-after:auto}}</style></head><body>${body}</body></html>`;
  await fs.writeFile(path.join(dir,name+'-imperial.html'),html);
  await page.goto(base+'/'+relative+'/'+name+'-imperial.html');
  await page.emulateMedia({media:'print'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))});
  if(await page.locator('body').innerText()!==sourceText)throw Error('Opening text changed: '+name);
  if(await page.locator('.sheet').count()!==expected)throw Error('Unexpected opening count');
  const geometry=await page.locator('.sheet').evaluateAll(sheets=>sheets.map(sheet=>{
   const rect=sheet.getBoundingClientRect(),content=sheet.querySelector('.content').getBoundingClientRect(),footer=sheet.querySelector('footer')?.getBoundingClientRect()||{top:rect.bottom-30};
   return {folio:Number(sheet.dataset.folio),contentBottom:content.bottom-rect.top,footerTop:footer.top-rect.top,clearancePx:footer.top-content.bottom,images:[...sheet.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0}))};
  }));
  for(const p of geometry)if(p.clearancePx<0||p.images.some(i=>!i.loaded))throw Error('Opening page fit/image failure: '+p.folio);
  await page.pdf({path:path.join(scratch,name+'.pdf'),width:'185mm',height:'240mm',printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false,margin:{top:0,bottom:0,left:0,right:0}});
  receipt.openingPages.push(...geometry);
  if(name==='entry')receipt.contents=sourceToc;
 }
 for(const id of ['H1','H2','H3','H5','H6','S1'])await remember('docs/assets/vegetable-guru-stock/assets/'+asset(id).file);
 await verify();receipt.approvedSourcesUnchanged=true;receipt.bookContent={revision:bookContent.revision,inputs:bookContent.inputs};
 await fs.writeFile(path.join(dir,'OPENING-CHECKS.json'),JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify({pages:receipt.openingPages.length,contents:receipt.contents.length,minimumFooterClearancePx:Math.min(...receipt.openingPages.map(p=>p.clearancePx)),approvedSourcesUnchanged:true}));
}finally{await browser.close()}
