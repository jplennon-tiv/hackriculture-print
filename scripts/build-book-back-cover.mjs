// Add approved editable copy to the B5 background derivative; original stays intact.
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {readBookContent,root,sha256,escapeHtml} from './lib/book-content.mjs';
const dir='docs/publication/publication-copy/integration';
const book=readBookContent();
const art=JSON.parse(fs.readFileSync(path.join(root,dir,'ARTWORK.json')));
for(const item of [art.source,art.derivative])if(sha256(fs.readFileSync(path.join(root,item.path)))!==item.sha256)throw Error('B5 artwork changed');
const html=`<!doctype html><html lang="en-GB"><meta charset="utf-8"><title>The Vegetable Guru · approved B5 copy</title><style>
@font-face{font-family:Nunito;src:url('/fonts/richer-a-6.woff2');font-weight:100 1000}*{box-sizing:border-box}body{margin:0}.cover{position:relative;width:185mm;height:240mm;background:#143c2b;overflow:hidden}.art{position:absolute;width:100%;height:100%;inset:0}.blurb{position:absolute;left:9mm;top:88mm;width:55mm;color:#f7f3d8;font:500 10.5pt/1.27 Nunito}.blurb p{margin:0 0 3.4mm}.blurb p:last-child{margin-bottom:0}@page{size:185mm 240mm;margin:0}
</style><main class="cover"><img class="art" src="/${art.derivative.path}" alt=""><div class="blurb">${book.data.covers.back.paragraphs.map(p=>`<p>${escapeHtml(p)}</p>`).join('')}</div></main></html>`;
fs.writeFileSync(path.join(root,dir,'back-cover.html'),html);
const browser=await chromium.launch();let dom;
const pdf='output/pdf/whole-book-order-preview/back-cover-approved-copy.pdf';
try{
 const page=await browser.newPage();await page.route('**/@vite/client',r=>r.abort());
 await page.goto('http://127.0.0.1:5173/'+dir+'/back-cover.html');await page.emulateMedia({media:'print'});
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
 dom=await page.evaluate(()=>{
  const b=document.querySelector('.blurb'),r=b.getBoundingClientRect(),mm=25.4/96;
  if(r.bottom*mm>198||b.scrollWidth>b.clientWidth+1)throw Error('Back-cover blurb overflows its clear area');
  return {left:r.left*mm,top:r.top*mm,right:r.right*mm,bottom:r.bottom*mm,fontSizePt:parseFloat(getComputedStyle(b).fontSize)*.75,text:b.innerText};
 });
 await page.pdf({path:path.join(root,pdf),preferCSSPageSize:true,printBackground:true});
}finally{await browser.close();}
const receipt={date:'2026-10-15',status:'Approved copy placed in preserved B5 direction; visual check pending',pdf,sha256:sha256(fs.readFileSync(path.join(root,pdf))),bookRevision:book.revision,copyInputs:book.inputs,artwork:art,inputs:Object.fromEntries(['scripts/build-book-back-cover.mjs',dir+'/back-cover.html',dir+'/ARTWORK.json','public/fonts/richer-a-6.woff2',art.source.path,art.derivative.path].map(p=>[p,sha256(fs.readFileSync(path.join(root,p)))])),dom,paragraphs:book.data.covers.back.paragraphs};
fs.writeFileSync(path.join(root,dir,'CHECKS.json'),JSON.stringify(receipt,null,2)+'\n');
console.log(JSON.stringify({pdf,dom}));
