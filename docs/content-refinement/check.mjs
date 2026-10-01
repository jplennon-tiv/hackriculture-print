import fs from 'node:fs/promises';import path from 'node:path';import{chromium}from'playwright';import{readCollection,revision,withoutAudit}from'../../../hackriculture-data/lib/records.mjs';
const root=path.resolve(import.meta.dirname,'../..');
const proposal=JSON.parse(await fs.readFile(path.join(root,'../hackriculture-data/planning/vegetable-content-refinement/PROPOSAL.json')));
if(proposal.expectedRevision!==revision())throw Error('Source revision changed; review the proposal before rendering.');
const draft=readCollection('vegetables');for(const[k,p]of Object.entries(proposal.crops)){Object.assign(draft[k].ai_print_extracts.sections,p.sections);draft[k].ai_print_layout=p.layout;}
const projected=Object.fromEntries(Object.entries(draft).map(([k,v])=>[k,withoutAudit(v)]));
const keys=process.argv.slice(2).filter(a=>!a.startsWith('--'));const crops=keys.length?keys:Object.keys(draft);const snapshot=process.argv.includes('--snapshot');
const b=await chromium.launch();const rows=[];
try{
const page=await b.newPage({viewport:{width:1000,height:1200}});
await page.route(/\/hackriculture-data\/generated\/master\/vegetables\.json/,route=>route.fulfill({status:200,contentType:'application/javascript',body:'export default '+JSON.stringify(projected)+';'}));
for(const key of crops)for(const unit of ['metric','imperial']){
await page.goto(`http://127.0.0.1:5173/print/vegetable/${key}?units=${unit}&aiReview=1`,{waitUntil:'domcontentloaded'});
await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
const r=await page.evaluate(()=>({error:document.body.dataset.printError??'',warnings:JSON.parse(document.body.dataset.printWarnings??'[]'),pages:[...document.querySelectorAll('.rich-print .sheet')].map(p=>({gapMm:+((p.querySelector('footer').getBoundingClientRect().top-p.querySelector('.content-end').getBoundingClientRect().bottom)/3.77952756).toFixed(1),classes:p.className,columns:[...p.querySelectorAll('.growing-columns>div')].map(c=>{const e=c.lastElementChild;return +(e.getBoundingClientRect().bottom-c.getBoundingClientRect().top).toFixed(1)}),words:p.innerText.split(/\s+/).length}))}));
rows.push({key,unit,...r});
if(snapshot&&!r.error){
 const html=await page.evaluate(()=>{const doc=document.documentElement.cloneNode(true);doc.querySelectorAll('script,link[rel="modulepreload"]').forEach(e=>e.remove());return '<!doctype html>'+doc.outerHTML;});
 const standalone=html.replaceAll('url(/fonts/','url('+path.join(root,'public/fonts/') ).replaceAll('"/images/','"'+path.join(root,'public/images/') ).replaceAll('"/fonts/','"'+path.join(root,'public/fonts/')).replaceAll("'/fonts/","'"+path.join(root,'public/fonts/'));
 await fs.mkdir(path.join(import.meta.dirname,'proofs'),{recursive:true});await fs.writeFile(path.join(import.meta.dirname,'proofs',`${key}-${unit}.html`),standalone);
}
}
await fs.writeFile(path.join(import.meta.dirname,keys.length?'FOCUSED.json':'DRAFT-CHECKS.json'),JSON.stringify(rows,null,2)+'\n');
console.log(rows.filter(r=>r.unit==='metric').map(r=>`${r.key}: ${r.pages.map(p=>p.gapMm+'mm').join(' / ')}; colgap ${(Math.abs(r.pages[1].columns[0]-r.pages[1].columns[1])/3.78).toFixed(1)}mm${r.error?' ERROR '+r.error:''}`).join('\n'));
console.log('ERRORS:',rows.filter(r=>r.error));
}finally{await b.close();}
