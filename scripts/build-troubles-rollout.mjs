// Rebuild only the 14 requested Troubles guides; the main book is not assembled here.
import fs from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';
import {build} from 'esbuild';import {chromium} from 'playwright';
import {root,base,ev,tmp,hash,json,save,source,trim,measure} from './lib/troubles-rollout-io.mjs';
if(await fs.stat('docs/publication/troubles-rollout/APPROVAL.json').then(()=>true,()=>false))throw Error('Approved Troubles proofs are frozen; use a new revision destination.');
const baseline=await json(path.join(ev,'BASELINES.json'));
assert.equal(baseline.results.length,28,'Complete both-unit source capture first');
const features=(await json(path.join(root,'src/print/book/troubleFeatures.json'))).features;assert.equal(features.length,24);
const codePaths=['src/print/book/renderCompact.ts','src/print/book/troubleFlow.ts','src/print/book/troubleFeatures.json','src/print/book/troubleMasks.json','scripts/lib/trouble-rollout-fit.mjs','scripts/lib/trouble-priority-fit.mjs','scripts/lib/troubles-rollout-io.mjs','src/print/book/compact.css','src/print/book/production.css','src/print/book/bookvault.css'];
const codeHashes=Object.fromEntries(await Promise.all(codePaths.map(async p=>[p,hash(await fs.readFile(path.join(root,p)))])));
const protectedPaths=['output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf','output/pdf/brassica-priority-study/brassica-fit-imperial.pdf','output/pdf/brassica-priority-study/brassica-fit-metric.pdf'];
const protectedHashes=Object.fromEntries(await Promise.all(protectedPaths.map(async p=>[p,hash(await fs.readFile(path.join(root,p)))])));
const report={createdOn:'2026-10-31',scope:'14 complete Troubles guides in both units; trim review, not supplier output or main-book assembly',codeHashes,protectedHashes,results:[]};
const {outputFiles}=await build({entryPoints:[path.join(root,'src/print/book/renderCompact.ts')],bundle:true,platform:'node',format:'esm',packages:'external',write:false});
await fs.writeFile(path.join(tmp,'renderer-final.mjs'),outputFiles[0].contents);const {prepareCompactBook}=await import(path.join(tmp,'renderer-final.mjs'));
const browser=await chromium.launch();
try{const page=await browser.newPage({viewport:{width:1100,height:1100}});
for(const units of ['imperial','metric']){let start=100;
for(const group of baseline.groups){const {key,label}=group,prior=baseline.results.find(r=>r.key===key&&r.units===units);
 const sourceHash=hash(await fs.readFile(path.join(root,`../hackriculture-data/troubles/${key}/${key}.json`)));assert.equal(sourceHash,prior.sourceHash);
 await source(page,key,units);const layout=await prepareCompactBook(page,base,'trouble',key,units,root,{supplier:'bookvault',startPage:start});
 assert.deepEqual(layout.warnings,[]);await trim(page,start);const pages=await measure(page,start),entries=pages.flatMap(p=>p.entries),original=prior.before.flatMap(p=>p.entries);
 assert.equal(entries.length,original.length);assert.equal(new Set(entries.map(e=>e.key)).size,original.length);
 const normal=s=>s.replace(/\s+/g,' ').trim();
 for(const e of entries){const b=original.find(x=>x.key===e.key);assert.ok(b);assert.equal(normal(e.text),normal(b.text),`Advice changed: ${key}/${e.key}`);assert.equal(e.image?.src,b.image?.src);if(e.image){assert.equal(e.image.width,135);assert.equal(e.image.height,157.5);assert.ok(e.image.loaded);assert.ok(Math.abs(parseFloat(e.image.shapeMargin)-4*96/25.4)<.01);assert.match(e.image.shape,/url\(/);}const f=features.find(f=>f.group===key&&f.key===e.key);assert.equal(e.featured,!!f);if(f)assert.equal(e.featureLabel.text,{pest:'Common Pest',disease:'Common Disease',problem:'Common Problem'}[f.kind]);}
 for(const p of pages){assert.ok(p.footerClearanceMm>=3.5,`${key} footer ${p.folio}`);for(const c of p.columns)assert.ok(c.gapsPx.every(g=>Math.abs(g-8)<.1));}
 assert.equal(layout.fit.selected.violations,0);
 await fs.writeFile(path.join(ev,`${key}-${units}.html`),await page.content());
 await page.pdf({path:path.join(tmp,`${key}-${units}.pdf`),preferCSSPageSize:true,printBackground:true});
 report.results.push({key,label,units,startPage:start,pages,sourceHash,oldStart:group.oldStart,oldPageCount:prior.before.length,fit:layout.fit,geometry:layout.geometry,adjustedType:layout.adjustedType});
 await save(path.join(ev,'CHECKS.json'),report);console.log(JSON.stringify({key,units,pages:pages.length,start,entries:entries.length,features:entries.filter(e=>e.featured).length,inversions:layout.fit.selected.inversions,moved:layout.fit.selected.moves}));start+=pages.length;
}}
for(const [p,h]of Object.entries(protectedHashes))assert.equal(hash(await fs.readFile(path.join(root,p))),h);
const pageMap=report.results.map(r=>({key:r.key,label:r.label,units:r.units,start:r.startPage,end:r.startPage+r.pages.length-1,oldStart:r.oldStart,oldPageCount:r.oldPageCount,pages:r.pages.map(p=>({folio:p.folio,entries:p.entries.map(e=>({key:e.key,feature:e.featureLabel?.text??null}))}))}));
// Check the complete section, including adjacent guides and real facing gutters.
for(const units of ['imperial','metric']){const pages=report.results.filter(r=>r.units===units).flatMap(r=>r.pages),es=pages.flatMap(p=>p.entries);assert.equal(es.length,220);assert.equal(es.filter(e=>e.featured).length,24);for(let i=0;i<es.length-1;i++)assert.ok(!(es[i].featured&&es[i+1].featured),'Consecutive features across guides');for(let i=0;i<pages.length-1;i++)if(pages[i].folio%2===0){const a=pages[i],b=pages[i+1],left=a.entries.filter(e=>e.featured&&a.columns[1].keys.includes(e.key)),right=b.entries.filter(e=>e.featured&&b.columns[0].keys.includes(e.key));for(const x of left)for(const y of right)assert.ok(Math.min(x.bottomPx,y.bottomPx)<=Math.max(x.topPx,y.topPx),'Features overlap across gutter');}}
await save(path.join(ev,'PAGE-MAP.json'),pageMap);
}finally{await browser.close();}
