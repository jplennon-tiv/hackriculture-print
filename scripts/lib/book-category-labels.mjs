import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {readCollection} from '../../../hackriculture-data/lib/records.mjs';
import {root,sharedRoot,sha256,escapeHtml as esc} from './book-content.mjs';

// Extend only the approved labels; keep each existing practical title's size.
export async function buildCategoryLabels(){
 const dir='docs/publication/whole-book-order-preview/integration-2026-11-03';
 const approval=JSON.parse(fs.readFileSync(path.join(root,'docs/publication/category-navigation-preview/APPROVAL.json')));
 if(sha256(fs.readFileSync(path.join(root,approval.approvedScope.pdf)))!==approval.approvedScope.sha256)throw Error('Accepted category proof changed');
 const edition=JSON.parse(fs.readFileSync(path.join(root,'docs/publication/contents-update/ASSEMBLY-PROPOSAL.json'))).editions.imperial;
 const crops=readCollection('vegetables',sharedRoot),themes=JSON.parse(fs.readFileSync(path.join(root,'src/print/familyThemes.json')));
 const oldmap=JSON.parse(fs.readFileSync(path.join(root,'docs/publication/whole-book-order-preview/integration-2026-10-18/baseline-PAGE-MAP.json')));
 const base='docs/publication/whole-book-order-preview/integration-2026-10-18/baseline.pdf';
 const rows=edition.documents.filter(d=>d.type==='vegetable').flatMap(d=>{
  const old=oldmap.find(p=>p.kind==='vegetable'&&p.label===d.label),crop=crops[d.key],theme=themes.find(t=>t.group===crop.category);
  if(!old||!theme)throw Error('Missing category source: '+d.key);
  return [0,1].map(offset=>({folio:d.startPage+offset,key:d.key,title:d.label,group:crop.category,theme,pdf:d.readerApprovedReplacement?d.pdf:base,sourcePage:d.readerApprovedReplacement?offset+1:old.pdfPage+offset,practical:offset===1}));
 });
 const python=process.env.BOOK_PYTHON||'/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
 const sizes=JSON.parse(execFileSync(python,['-c',`import sys,json,logging,pdfplumber
logging.getLogger('pdfminer').setLevel(logging.ERROR)
rows=json.load(sys.stdin);docs={};out={}
for r in rows:
 if not r['practical']:continue
 if r['pdf'] not in docs:docs[r['pdf']]=pdfplumber.open(r['pdf'])
 p=docs[r['pdf']].pages[r['sourcePage']-1]
 cs=[c for c in p.chars if c['top']<20*72/25.4]
 out[r['key']]=round(max(c['size'] for c in cs),2)
print(json.dumps(out))`],{cwd:root,input:JSON.stringify(rows),encoding:'utf8'}));
 const body=rows.map(r=>`<section class="sheet" data-folio="${r.folio}" style="--deep:${r.theme.deep};--ink:${r.theme.ink}"><div class="label" style="left:${r.folio%2?17:8}mm">${esc(r.group.toUpperCase())}</div>${r.practical?`<h1 style="font-size:${sizes[r.key]}pt">Growing guide · <span>${esc(r.title)}</span></h1>`:''}</section>`).join('');
 const html=`<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="/docs/publication/vegetable-guru-entry-pages/entry-pages.css"><style>@page{size:185mm 240mm;margin:0}html,body{margin:0;background:transparent}.sheet{position:relative;width:185mm;height:240mm;margin:0;padding:0;background:transparent;break-after:page}.sheet:last-child{break-after:auto}.label{position:absolute;top:5.8mm;font:900 13.3333px/1 Nunito;color:var(--deep);letter-spacing:.2px}h1{position:absolute;left:17mm;top:9mm;margin:0;font-family:Lilita;font-weight:400;line-height:1.08;letter-spacing:0;color:var(--ink);white-space:nowrap}h1 span{color:var(--deep)}</style></head><body>${body}</body></html>`;
 const htmlPath=dir+'/category-labels.html',pdf='tmp/pdfs/whole-book-order-preview/category-labels.pdf';fs.mkdirSync(path.join(root,dir),{recursive:true});fs.writeFileSync(path.join(root,htmlPath),html);
 const browser=await chromium.launch();let dom;
 try{const page=await browser.newPage();await page.route('**/@vite/client',r=>r.abort());await page.goto('http://127.0.0.1:5173/'+htmlPath);await page.emulateMedia({media:'print'});await page.evaluate(()=>document.fonts.ready);
 dom=await page.evaluate(()=>[...document.querySelectorAll('.sheet')].map(s=>{const origin=s.getBoundingClientRect();const blocks=[...s.querySelectorAll('.label,h1')].map(e=>{const r=e.getBoundingClientRect();return{text:e.textContent,fontPt:parseFloat(getComputedStyle(e).fontSize)*.75,left:(r.left-origin.left)*25.4/96,right:(r.right-origin.left)*25.4/96,top:(r.top-origin.top)*25.4/96,bottom:(r.bottom-origin.top)*25.4/96};});if(blocks.some(b=>b.right>177.1||b.top<5||b.bottom>21))throw Error('Category header out of bounds '+s.dataset.folio);return{folio:Number(s.dataset.folio),blocks};}));
 await page.pdf({path:path.join(root,pdf),preferCSSPageSize:true,printBackground:true,omitBackground:true});
 }finally{await browser.close();}
 const inputs=Object.fromEntries([...new Set(rows.map(r=>r.pdf))].map(p=>[p,sha256(fs.readFileSync(path.join(root,p)))]));
 const result={approval:'docs/publication/category-navigation-preview/APPROVAL.json',pdf,sha256:sha256(fs.readFileSync(path.join(root,pdf))),inputs,rows,dom,scope:'88 guide labels at approved 10 pt; practical titles retain existing sizes and move to approved 9 mm top. No body, how-to or artwork changes.'};
 fs.writeFileSync(path.join(root,dir,'CATEGORY-LABELS.json'),JSON.stringify(result,null,2)+'\n');return result;
}
