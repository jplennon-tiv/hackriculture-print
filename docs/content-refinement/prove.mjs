import fs from'node:fs/promises';import path from'node:path';import assert from'node:assert/strict';import{chromium}from'playwright';
const dir=import.meta.dirname,root=path.resolve(dir,'../..'),proofs=path.join(dir,'proofs');
// Make frozen browser proofs independent of the dev server.
for(const file of (await fs.readdir(proofs)).filter(f=>f.endsWith('.html'))){let text=await fs.readFile(path.join(proofs,file),'utf8');text=text.replaceAll('url(/fonts/','url('+path.join(root,'public/fonts/'));
text=text.replace(/<section class="sheet front/g,'<section id="page1" class="sheet front').replace(/<section class="sheet back/g,'<section id="page2" class="sheet back');await fs.writeFile(path.join(proofs,file),text);}
const b=await chromium.launch(),checks=[];
try{
 const p=await b.newPage({viewport:{width:1000,height:1200},deviceScaleFactor:1});
 for(const[key,unit]of [['capsicum','metric'],['tomato_greenhouse','metric'],['tomato_greenhouse','imperial']]){
  await p.goto('file://'+path.join(proofs,`${key}-${unit}.html`));await p.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  const state=await p.evaluate(()=>({fonts:document.fonts.check('20px "Lilita One"')&&document.fonts.check('12px "Nunito Sans"'),missing:[...document.images].filter(i=>!i.naturalWidth).length,gaps:[...document.querySelectorAll('.sheet')].map(p=>p.querySelector('footer').getBoundingClientRect().top-p.querySelector('.content-end').getBoundingClientRect().bottom)}));
  assert(state.fonts);assert.equal(state.missing,0);assert(state.gaps.every(v=>v>=6));
  const bytes=await p.pdf({format:'A4',printBackground:true,preferCSSPageSize:true}),pages=(bytes.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;assert.equal(pages,2);
  await fs.writeFile(path.join(proofs,`${key}-${unit}.pdf`),bytes);checks.push({key,unit,pages,...state});
 }
 for(const key of ['capsicum','tomato_greenhouse','potato','mushroom']){
  await p.goto(`http://127.0.0.1:5173/print/vegetable/${key}?units=metric`,{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);assert.equal(await p.evaluate(()=>document.body.dataset.printError??''),'');
  await p.locator('.back').screenshot({path:path.join(proofs,`${key}-before.png`)});
  await p.goto('file://'+path.join(proofs,`${key}-metric.html`));await p.evaluate(()=>document.fonts.ready);await p.locator('.back').screenshot({path:path.join(proofs,`${key}-after.png`)});
 }
 await fs.writeFile(path.join(dir,'PDF-CHECKS.json'),JSON.stringify(checks,null,2)+'\n');console.log(checks);
}finally{await b.close();}
