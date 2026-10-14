// Focused, trim-sized author preview; no full-book or approved-source writes.
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
import {root, readBookContent, renderOpeningPages, escapeHtml, sha256} from '../../../scripts/lib/book-content.mjs';
import {bookLayoutRevision} from '../../../../hackriculture-data/lib/book-layout.mjs';

const dir = import.meta.dirname;
const relative = path.relative(root, dir);
const base = 'http://127.0.0.1:5173';
const out = path.join(root, 'output/pdf/author-bio-draft-2026-10-08');
await fs.mkdir(out, {recursive:true});
const content = readBookContent();
const stock = JSON.parse(await fs.readFile(path.join(root, 'docs/assets/vegetable-guru-stock/ARTWORK.json')));
const stockPath = id => '/docs/assets/vegetable-guru-stock/assets/' + stock.assets.find(a=>a.id===id).file;
const data = structuredClone(content.data);
data.introduction.illustration = {src:stockPath('H3'),alt:'Summer harvest of courgettes'};
data.author.illustration = {src:stockPath('S1'),alt:'Beans and blossom'};
const css = '/docs/publication/vegetable-guru-opening-pages/opening-pages.css';
const approval = JSON.parse(await fs.readFile(path.join(root, 'docs/redesign-rollout/APPROVAL.json')));
const protectedFiles = approval.compactEntryPages.files;
const verify = async () => {
  for (const f of protectedFiles) if (sha256(await fs.readFile(path.join(root,f.path)))!==f.sha256) throw Error('Approved source changed: '+f.path);
};
await verify();
const sourcePaths = [css.slice(1), 'docs/publication/bookvault-progress-preview/opening-imperial.html', 'docs/publication/vegetable-guru-opening-pages/imperial.html', stockPath('H3').slice(1),stockPath('S1').slice(1)];
const sources = Object.fromEntries(await Promise.all(sourcePaths.map(async p=>[p,sha256(await fs.readFile(path.join(root,p)))])));
const html = body => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Author biography — draft preview</title><link rel="stylesheet" href="${css}"><style>@page{size:185mm 240mm;margin:0}.about .tile img{object-fit:contain}@media print{body{margin:0}.sheet{margin:0}.sheet:last-child{break-after:auto}}</style></head><body>${body}</body></html>`;
const receipt = {date:new Date().toISOString(),status:'Draft biography; existing welcome placeholders retained. Rough trim preview, not a production upload.',physicalFolio:3,trimMm:[185,240],bookContent:{revision:content.revision,inputs:content.inputs},artworkAllocation:{header:'H3',author:'S1',status:'Reused from current rough preview; placements remain proposed'},sources,results:[],protectedApprovedFiles:protectedFiles};
const browser = await chromium.launch();
try {
  const page = await browser.newPage({viewport:{width:1500,height:1150}});
  await page.route('**/@vite/client',r=>r.abort());
  for (const units of ['imperial','metric']) {
    await page.setContent(html(renderOpeningPages(data,units).body));
    const body = await page.locator('[data-folio="3"]').evaluate(e=>e.outerHTML);
    const file = path.join(dir,units+'.html');
    await fs.writeFile(file,html(body));
    await page.goto(base+'/'+relative+'/'+units+'.html');
    await page.emulateMedia({media:'print'});
    await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
    const checks = await page.evaluate(()=>{
      const sheet=document.querySelector('.sheet'), box=sheet.getBoundingClientRect();
      const content=sheet.querySelector('.content').getBoundingClientRect(),footer=sheet.querySelector('footer').getBoundingClientRect();
      const about=sheet.querySelector('.about').getBoundingClientRect();
      const overflow=[...sheet.querySelectorAll('p,h1,h2')].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>e.textContent);
      return {sheets:document.querySelectorAll('.sheet').length,widthMm:box.width*25.4/96,heightMm:box.height*25.4/96,footerClearanceMm:(footer.top-content.bottom)*25.4/96,overflow,fonts:[document.fonts.check('26px Lilita'),document.fonts.check('13px Nunito')],bio:sheet.querySelector('.about p').textContent,bioFontPx:getComputedStyle(sheet.querySelector('.about p')).fontSize,authorPanelMm:{x:(about.left-box.left)*25.4/96,y:(about.top-box.top)*25.4/96,width:about.width*25.4/96,height:about.height*25.4/96},images:[...sheet.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0}))};
    });
    if(checks.sheets!==1||checks.footerClearanceMm<3||checks.overflow.length||checks.images.some(i=>!i.loaded)||checks.fonts.some(f=>!f)||checks.bio!==data.author.paragraphs.join('')) throw Error('Preview check failed: '+JSON.stringify(checks));
    if(units==='imperial') {
      const pdf=path.join(out,'author-bio-preview.pdf');
      await page.pdf({path:pdf,width:'185mm',height:'240mm',preferCSSPageSize:true,printBackground:true,margin:{top:0,bottom:0,left:0,right:0}});
      receipt.pdf={path:path.relative(root,pdf),sha256:sha256(await fs.readFile(pdf))};
    }
    receipt.results.push({units,html:path.relative(root,file),...checks});
  }
  // Inspect the actual folio 2/3 relationship without rebuilding the opening pack.
  await page.setContent(html(renderOpeningPages(data,'imperial').body));
  const context=await page.locator('[data-folio="2"],[data-folio="3"]').evaluateAll(es=>es.map(e=>e.outerHTML).join(''));
  await fs.writeFile(path.join(dir,'spread.html'),html(context).replace('</style>','@media screen{body{display:flex;gap:0;justify-content:center}.sheet{margin:16px 0;flex-shrink:0}}</style>'));
  await page.goto(base+'/'+relative+'/spread.html');
  await page.emulateMedia({media:'screen'});
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  await page.screenshot({path:path.join(dir,'spread-screen.png'),fullPage:true});
  await verify();
  for (const [p,hash] of Object.entries(sources)) if(sha256(await fs.readFile(path.join(root,p)))!==hash) throw Error('Source changed: '+p);
  if(bookLayoutRevision(path.resolve(root,'../hackriculture-data'))!==content.revision) throw Error('Book copy changed during preview');
  receipt.sourcesUnchanged=true;
  receipt.visualReview='pending actual PDF render inspection';
  await fs.writeFile(path.join(dir,'CHECKS.json'),JSON.stringify(receipt,null,2)+'\n');
  console.log(JSON.stringify(receipt.results.map(({units,footerClearanceMm,bioFontPx})=>({units,footerClearanceMm,bioFontPx}))));
} finally {await browser.close();}
