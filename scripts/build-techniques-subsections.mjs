// Reuse native topic bodies; author-requested headers and mirrored placement only.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
const root=process.cwd(),dir='docs/publication/techniques-subsections',out='output/pdf/techniques-subsections';
const python=process.env.BOOK_PYTHON||'/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
fs.mkdirSync(out,{recursive:true});
execFileSync(python,['scripts/compose-techniques-subsections.py','--prepare'],{stdio:'inherit'});
const metadata=read(dir+'/PREPARED.json'),config=read('src/print/book/techniques-subsections.json');
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
const browser=await chromium.launch();
const proofs=[];
try{
 for(const [units,rows] of Object.entries(metadata.editions)){
  const body=rows.map(r=>{
   const h=config.headers[r.source];
   return `<section class="sheet" data-folio="${r.folio}" style="--left:${r.folio%2?17:8}mm;--right:${r.folio%2?8:17}mm;--top:${r.source==='technique:nutrient-cycles'?10:12}mm;--gap:${r.source==='technique:nutrient-cycles'?1.5:2.5}mm">${h?`<header><div class="eyebrow">GROWING TECHNIQUES - ${escape(h.running).toUpperCase()}</div>${h.main?`<h1>${escape(h.main)} <span>${escape(h.qualifier)}</span></h1>`:''}</header>`:''}<footer><span>GROWING TECHNIQUES</span><span>${r.folio}</span></footer></section>`;
  }).join('');
  const html=`<!doctype html><html lang="en-GB"><meta charset="utf-8"><style>
@font-face{font-family:Lilita;src:url('/fonts/richer-a-1.woff2');font-weight:400}
@font-face{font-family:Nunito;src:url('/fonts/richer-a-6.woff2');font-weight:100 1000}
*{box-sizing:border-box}body{margin:0;color:#173e2c}.sheet{position:relative;width:185mm;height:240mm;break-after:page}.sheet:last-child{break-after:auto}header{position:absolute;top:var(--top);left:var(--left);right:var(--right)}
.eyebrow{font:900 10px/1.25 Nunito;letter-spacing:1.2px}
h1{display:flex;flex-wrap:wrap;align-items:baseline;column-gap:.22em;row-gap:0;font:400 42px/1.04 Lilita;letter-spacing:-.25px;margin:var(--gap) 0 0}
h1 span{display:inline-block;white-space:nowrap;font-size:30px;line-height:1.04;color:#a44007}
footer{position:absolute;left:var(--left);right:var(--right);bottom:8mm;display:flex;justify-content:space-between;font:900 9.4px/1.4 Nunito;letter-spacing:.7px}@page{size:185mm 240mm;margin:0}
</style><body>${body}</body></html>`;
  const htmlPath=dir+'/headers-'+units+'.html',pdf=out+'/headers-'+units+'.pdf';fs.writeFileSync(htmlPath,html);
  const page=await browser.newPage();await page.goto('http://127.0.0.1:5173/'+htmlPath,{waitUntil:'networkidle'});await page.emulateMedia({media:'print'});
  await page.evaluate(async()=>{await document.fonts.ready;});
  const dom=await page.evaluate(()=>[...document.querySelectorAll('.sheet')].map(s=>({folio:Number(s.dataset.folio),header:s.querySelector('header')?.innerText,overflow:[...s.querySelectorAll('h1,span,.eyebrow')].some(e=>e.scrollWidth>e.clientWidth+1)})));
  if(dom.some(r=>r.overflow))throw Error('Heading overflow: '+JSON.stringify(dom));
  await page.pdf({path:pdf,preferCSSPageSize:true,printBackground:true});await page.close();
  proofs.push({units,html:htmlPath,htmlSha256:sha(htmlPath),pdf,sha256:sha(pdf),dom});
 }
}finally{await browser.close();}
fs.writeFileSync(dir+'/HEADERS.json',JSON.stringify({date:config.date,proofs},null,2)+'\n');
execFileSync(python,['scripts/compose-techniques-subsections.py'],{stdio:'inherit'});
