import {refreshGenerated} from '../../hackriculture-data/lib/records.mjs';
refreshGenerated();
import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'..');
const out=path.join(root,'output/pdf/troubles-mockups-v1');
await fs.mkdir(out,{recursive:true});
const group=JSON.parse(await fs.readFile(path.join(root,'../hackriculture-data/generated/master/troubles.json'),'utf8')).carrot_and_parsnip_troubles;
const keys=['carrot_fly','green_top','old_seed_poor_germination'];
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const cards=[];
for(const key of keys){
 const c=group.conditions[key];let art='';
 try{art='data:image/png;base64,'+(await fs.readFile(path.join(root,'public',c.image))).toString('base64');}catch(e){if(e.code!=='ENOENT')throw e;}
 const crops=(c.applies_to??group.applies_to??[]).map(s=>s.replaceAll('_',' ')).join(' / ');
 cards.push(`<article data-key="${key}" class="${art?'illustrated':'text-only'}"><div class="card-head"><h2>${esc(c.name)}</h2><span>${esc(crops)}</span></div><div class="card-body">${art?`<figure><img src="${art}" alt="${esc(c.name)}"><figcaption>${esc(c.visual_heading||c.name)}</figcaption></figure>`:''}<div class="copy">${[['Recognise',c.description],['Act',c.treatment],['Prevent',c.prevention]].filter(([,v])=>v).map(([label,value])=>`<section class="${label.toLowerCase()}"><h3>${label}</h3><p data-field="${label}">${esc(value)}</p></section>`).join('')}${!art?'<div class="no-art">TEXT-ONLY CARD · ILLUSTRATION NOT AVAILABLE</div>':''}</div></div></article>`);
}
const page=(variant,title,body)=>`<div class="page ${variant}"><header><div class="eyebrow">VEGETABLE CHEAT SHEETS / TROUBLES</div><h1>Carrot &amp; parsnip troubles</h1><div class="deck">Recognise the signs. Find the next step.</div></header><div class="concept"><b>${title}</b><span>Selected entries · layout proof</span></div><main>${body}</main><footer><span>DESIGN REVIEW · SOURCE WORDING RETAINED</span><span>${variant==='horizontal'?'A':'B'} / 2</span></footer></div>`;
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>Troubles: two layout concepts</title><style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box}@page{size:A4;margin:0}body{margin:0;color:#24352d;font-family:Inter,sans-serif;print-color-adjust:exact;-webkit-print-color-adjust:exact}.page{width:210mm;height:297mm;background:#fcfaf5;position:relative;padding:0 13mm;break-after:page}.page:last-child{break-after:auto}header{margin:0 -13mm;background:#1a2520;color:white;padding:9mm 13mm 6mm;border-bottom:1.2mm solid #df9f5b}.eyebrow{font-size:7pt;letter-spacing:1.4pt;font-weight:700;color:#cad8c1}h1{font-size:24pt;letter-spacing:-.7pt;line-height:1.1;margin:3mm 0 2mm;font-weight:850}.deck{font-size:9pt;color:#dce5d4}.concept{display:flex;justify-content:space-between;align-items:center;margin:5mm 0 4mm;font-size:8pt}.concept b{color:#a45124}.concept span{color:#667262}main{display:flex;flex-direction:column;gap:3mm}article{border:1px solid #c8cfc0;border-radius:2mm;overflow:hidden;background:white;break-inside:avoid}.card-head{background:#28382f;color:#fff;padding:2.4mm 3mm;display:flex;justify-content:space-between;align-items:center;gap:3mm}h2{font-size:11pt;line-height:1.2;margin:0;font-weight:800}.card-head span{font-size:6.8pt;text-transform:uppercase;letter-spacing:.45pt;white-space:nowrap;color:#d6e2cf}.card-body{display:flex;gap:4mm;padding:3mm}figure{margin:0;flex:0 0 40mm;align-self:flex-start}figure img{width:40mm;height:40mm;object-fit:contain;display:block;border:1px solid #f0f0eb}figcaption{font-size:7.5pt;text-align:center;color:#91603a;font-weight:600;margin-top:2mm}.copy{flex:1;min-width:0}h3{font-size:6.8pt;letter-spacing:1pt;text-transform:uppercase;color:#4a684b;margin:0 0 1mm}p{font-size:9pt;line-height:1.42;margin:0}.copy section+section{margin-top:2.3mm}.act{padding:2mm 2.5mm;background:#fbefdf;border-left:2px solid #cd793e}.prevent{padding-top:2mm;border-top:1px solid #dce3d5}.no-art{font-size:6pt;letter-spacing:.6pt;color:#879180;margin-top:3mm}.text-only .card-body{padding:3mm 4mm}footer{position:absolute;bottom:8mm;left:13mm;right:13mm;display:flex;justify-content:space-between;border-top:1px solid #bec9b5;padding-top:2mm;font-size:6.5pt;letter-spacing:.5pt}.columns main{display:grid;grid-template-columns:1fr 1fr;gap:4mm;align-items:start}.column{display:flex;flex-direction:column;gap:4mm}.columns .card-head{display:block}.columns .card-head span{display:block;margin-top:1.5mm}.columns .card-body{display:block}.columns figure{width:100%;margin-bottom:3mm}.columns figure img{width:100%;height:39mm;object-fit:contain}.columns figcaption{margin-top:1mm}.columns p{font-size:9pt}.columns .copy section+section{margin-top:2.5mm}.columns .no-art{line-height:1.6}
</style><body>${page('horizontal','A · Illustrated horizontal cards',cards.join(''))}${page('columns','B · Two-column field guide',`<div class="column">${cards[0]}</div><div class="column">${cards[1]}${cards[2]}</div>`)}</body></html>`;
await fs.writeFile(path.join(out,'troubles-mockups.html'),html);
const browser=await chromium.launch();
try{
 const p=await browser.newPage();await p.setContent(html,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
 const checks=await p.evaluate(()=>({fonts:document.fonts.check('800 16px Inter'),pages:[...document.querySelectorAll('.page')].map(page=>({clearance:page.querySelector('footer').getBoundingClientRect().top-page.querySelector('main').getBoundingClientRect().bottom,entries:[...page.querySelectorAll('article')].map(a=>a.dataset.key)}))}));
 if(!checks.fonts||checks.pages.some(p=>p.clearance<8))throw Error('Layout check failed: '+JSON.stringify(checks));
 // Compare every displayed source field to the live records; no summaries or omissions.
 for(const variant of ['horizontal','columns'])for(const key of keys)for(const [label,field] of [['Recognise','description'],['Act','treatment'],['Prevent','prevention']]){
  const value=group.conditions[key][field];if(!value)continue;
  const actual=await p.locator('.'+variant+' [data-key="'+key+'"] [data-field="'+label+'"]').textContent();if(actual!==value)throw Error('Source mismatch: '+key+'/'+field);
 }
 await fs.writeFile(path.join(out,'checks.json'),JSON.stringify(checks,null,2));
 await p.pdf({path:path.join(out,'troubles-layout-comparison-A4.pdf'),format:'A4',preferCSSPageSize:true,printBackground:true});
 console.log(JSON.stringify(checks));
}finally{await browser.close();}
