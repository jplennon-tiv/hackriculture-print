// Pages 1–3 only. Preserves all approved contents/how-to files and guide PDFs.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {chromium} from 'playwright';
import {build} from 'esbuild';

const root=path.resolve(import.meta.dirname,'..');
const relative='docs/publication/vegetable-guru-opening-pages';
const dir=path.join(root,relative),out=path.join(root,'output/pdf/vegetable-guru-opening-pages');
const scratch=path.join(root,'tmp/pdfs/vegetable-guru-opening-pages');
const base=process.env.BASE_URL||'http://127.0.0.1:5173';
const python='/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const hash=b=>createHash('sha256').update(b).digest('hex');
const approval=JSON.parse(await fs.readFile(path.join(root,'docs/redesign-rollout/APPROVAL.json'),'utf8'));
const protectedFiles=approval.compactEntryPages.files;
const verifyProtected=async()=>{for(const f of protectedFiles)if(hash(await fs.readFile(path.join(root,f.path)))!==f.sha256)throw Error('Approved entry source changed: '+f.path)};
await verifyProtected();
await fs.mkdir(out,{recursive:true});await fs.mkdir(scratch,{recursive:true});
const art=(crop,alt)=>`<img src="/images/heroes/richer-a/${crop}.png" alt="${alt}">`;
const rule='<div class="colour-rule" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>';
const lipsum={
 lead:'Lipsum orum dolor sit amet, consectetur adipiscing elit. Integer vitae mauris at lorem consequat elementum. Curabitur aliquam, augue quis tempus posuere, neque nulla facilisis eros, vitae laoreet neque justo at nibh.',
 body1:'Lipsum orum dolor sit amet, consectetur adipiscing elit. Sed ut lectus eu mauris viverra fringilla. Donec posuere, urna non commodo sagittis, justo sapien volutpat felis, vitae aliquam nulla nibh quis metus. Aenean sit amet lacus eget neque varius interdum.',
 body2:'Lipsum orum dolor sit amet, consectetur adipiscing elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae. Nulla facilisi. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.',
 short:'Lipsum orum dolor sit amet, consectetur adipiscing elit. Integer vitae mauris at lorem consequat elementum. Nulla facilisi. Sed posuere neque non tellus viverra, vel malesuada arcu interdum.',
 quote:'Lipsum orum dolor sit amet, consectetur adipiscing elit.',
 credit:'Lipsum orum dolor sit amet, consectetur adipiscing elit. Curabitur aliquam augue quis tempus posuere.'
};
const title=`${rule}<div class="eyebrow">HACKRICULTURE</div><h1 class="book-title"><span class="the">The</span><span class="vegetable">Vegetable</span><span class="guru">Guru</span></h1><p class="subtitle">Your at-a-glance<br>growing companion</p><p class="author">[Author name]</p><div class="title-art" aria-label="Five vegetable illustration tiles"><div class="tile tomato">${art('tomato-greenhouse','Tomatoes')}</div><div class="tile onion">${art('onion-shallot','Onions and shallots')}</div><div class="tile pea">${art('pea','Pea pods')}</div><div class="tile carrot">${art('carrot','Carrots')}</div><div class="tile kale">${art('kale','Kale')}</div></div><p class="imprint">[Imprint name]</p>`;
const publication=`${rule}<div class="eyebrow">PUBLICATION DETAILS</div><h1>The Vegetable Guru</h1><p class="book-subtitle">Your at-a-glance growing companion</p><h2>Copyright &amp; publication</h2><section class="publication-block"><h3>Copyright</h3><p>${lipsum.short}</p></section><dl class="facts"><div><dt>Author</dt><dd>[Author name]</dd></div><div><dt>Imprint</dt><dd>[Imprint name]</dd></div><div><dt>ISBN</dt><dd>[To be supplied]</dd></div><div><dt>Edition</dt><dd>[Edition and year]</dd></div></dl><section class="publication-block"><h3>Illustration &amp; design</h3><p>${lipsum.credit}</p></section><section class="publication-block"><h3>Acknowledgements</h3><p>${lipsum.short}</p></section><p class="closing">${lipsum.credit}</p>`;
const welcome=`<header><div class="eyebrow">THE VEGETABLE GURU</div><img class="harvest" src="/docs/front-matter/entry-pages/studies/assets/harvest-cluster.png" alt="Approved illustrated harvest cluster"><h1>Welcome.</h1><p>Your growing companion</p></header><p class="lead">${lipsum.lead}</p><div class="body-copy"><p>${lipsum.body1}</p><p>${lipsum.body2}</p></div><blockquote class="pullquote">${lipsum.quote}</blockquote><section class="about"><div><h2>About the author</h2><p>${lipsum.short}</p><p class="author-signoff">[Author name] · hackriculture</p></div><div class="tile">${art('pea','Illustrated pea pods')}</div></section>`;
const sourcePaths=['docs/publication/vegetable-guru-grid-variations/assets/G2-centre-title.png','docs/front-matter/entry-pages/studies/assets/harvest-cluster.png',...['tomato-greenhouse','onion-shallot','pea','carrot','kale'].map(n=>`public/images/heroes/richer-a/${n}.png`)];
const sources={};for(const f of sourcePaths)sources[f]=hash(await fs.readFile(path.join(root,f)));
const receipt={date:'2026-10-07',status:'Unapproved three-page design proposal with user-requested placeholder text',supplier:'Bookvault',trimMm:[185,240],bleedMm:3,physicalFolios:[1,2,3],title:'The Vegetable Guru',subtitle:'Your at-a-glance growing companion',sources,protectedApprovedFiles:protectedFiles,placeholderBlocks:lipsum,decisions:[
 'Title page echoes G2 cream centre, dark green hierarchy and vegetable tiles; native text and existing approved hero files replace the imagegen cover composition for this interior page.',
 'The title page has no visible folio; it still occupies physical page 1. Pages 2–3 carry edition and physical folio footers.',
 'All prose blocks use lipsum orum at John’s request. Author, imprint, ISBN and edition are explicit placeholders. No biographical, copyright, rights or publication claims are made.',
 'Harvest artwork and typography connect the welcome page with approved contents/how-to on pages 4–7. The count footer is not introduced on the title page.',
 'Separate three-page proofs only. Approved pages 4–7, full-book assemblies, cover art and guides are not regenerated or modified.'
],results:[]};
const bundle=await build({entryPoints:[path.join(root,'src/print/book/production.ts')],bundle:true,platform:'node',format:'esm',packages:'external',write:false});
const modulePath=path.join(scratch,'production.mjs');await fs.writeFile(modulePath,bundle.outputFiles[0].contents);
const {finishProductionPages}=await import(modulePath);
const browser=await chromium.launch();
try{
 const page=await browser.newPage({viewport:{width:900,height:1100}});await page.route('**/@vite/client',r=>r.abort());
 for(const units of ['imperial','metric']){
  const sheet=(folio,cls,content)=>`<section class="sheet ${folio%2===0?'verso':''} ${cls}" data-folio="${folio}"><div class="content">${content}</div>${folio===1?'':`<footer><span>THE VEGETABLE GURU</span><span>${units.toUpperCase()} · ${folio}</span></footer>`}</section>`;
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><base href="${base}/"><title>The Vegetable Guru - Title, publication and welcome - ${units}</title><link rel="stylesheet" href="/${relative}/opening-pages.css"></head><body>${sheet(1,'title-page',title)+sheet(2,'publication',publication)+sheet(3,'welcome',welcome)}</body></html>`;
  const htmlPath=path.join(dir,units+'.html');await fs.writeFile(htmlPath,html);await page.goto(base+'/'+relative+'/'+units+'.html');await page.emulateMedia({media:'print'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))});
  const checks=await page.evaluate(()=>[...document.querySelectorAll('.sheet')].map(sheet=>{
   const bounds=sheet.getBoundingClientRect(),content=sheet.querySelector('.content').getBoundingClientRect();
   const footer=sheet.querySelector('footer'),bottom=footer?footer.getBoundingClientRect().top:bounds.bottom-8*96/25.4;
   const overflow=[...sheet.querySelectorAll('p,h1,h2,h3,dd,dt')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent);
   if(content.bottom>bottom-12||overflow.length)throw Error('Content fit '+sheet.dataset.folio+JSON.stringify({gap:bottom-content.bottom,overflow}));
   return {folio:Number(sheet.dataset.folio),footerClearanceMm:(bottom-content.bottom)*25.4/96,overflow,images:[...sheet.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),loaded:!!i.naturalWidth,widthMm:i.getBoundingClientRect().width*25.4/96,heightMm:i.getBoundingClientRect().height*25.4/96}))};
  }));
  await page.evaluate(checks=>document.body.dataset.bookChecks=JSON.stringify({type:'opening-pages-proposal',pages:checks}),checks);
  const geometry=await finishProductionPages(page,{supplier:'bookvault',startPage:1});
  const raw=await page.pdf({width:geometry.width+'mm',height:geometry.height+'mm',preferCSSPageSize:true,printBackground:true,scale:1,margin:{top:0,right:0,bottom:0,left:0}});
  const rawPath=path.join(scratch,units+'-raw.pdf');await fs.writeFile(rawPath,raw);const fd=await fs.open(rawPath,'r');let norm;
  try{norm=spawnSync(python,[path.join(root,'scripts/normalise-book-pdf.py'),'--supplier','bookvault','--start-page','1'],{stdio:[fd.fd,'pipe','pipe'],maxBuffer:50*1024*1024,timeout:60000})}finally{await fd.close()}
  if(norm.status!==0)throw Error(norm.stderr.toString());const pdf=path.join(out,`title-publication-welcome-${units}.pdf`);await fs.writeFile(pdf,norm.stdout);
  receipt.results.push({units,html:path.relative(root,htmlPath),pdf:path.relative(root,pdf),sha256:hash(norm.stdout),dom:checks,geometry,visualReview:'pending'});console.log(units+': three-page proof saved');
 }
 await verifyProtected();receipt.approvedFilesUnchanged=true;
 receipt.implementation={builderSha256:hash(await fs.readFile(import.meta.filename)),cssSha256:hash(await fs.readFile(path.join(dir,'opening-pages.css')))};
 await fs.writeFile(path.join(dir,'CHECKS.json'),JSON.stringify(receipt,null,2)+'\n');
}finally{await browser.close();await fs.rm(modulePath,{force:true})}
