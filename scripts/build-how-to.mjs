import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'output/pdf/how-to-final');
await fs.mkdir(out,{recursive:true});
const png=async p=>'data:image/png;base64,'+(await fs.readFile(path.join(root,p))).toString('base64');
const sheets=await Promise.all(['front','illustrated'].map(k=>png(`docs/front-matter/references/carrot-metric-A4-${k}.png`)));
const icons={};for(const k of ['depth','row_spacing','plant_spacing','harvest','water','weeding'])icons[k]=await png(`public/images/quick_facts/trial/${k}.png`);
const sow=await png('public/images/planting/carrot/sow-thinly-v1.png');
const image=(src,style='')=>`<img src="${src}" style="${style}" alt="">`;
const miniIcons=(keys)=>`<div class="iconrow">${keys.map(([k,label])=>`<div>${image(icons[k])}<span>${label}</span></div>`).join('')}</div>`;
const calendar=`<div class="months">M A M J J A S O</div><div class="cells">${[0,1,1,1,0,0,0,0].map(n=>`<i style="background:${n?'#68a36e':'#e7e9e5'}"></i>`).join('')}</div><div class="cells">${[0,0,0,0,1,1,1,1].map(n=>`<i style="background:${n?'#db7938':'#e7e9e5'}"></i>`).join('')}</div><div class="key"><span>Sow</span><span>Harvest</span></div>`;
const scale=`<div class="scale">${[1,2,3,4,5].map(n=>`<i style="background:${n<4?'#318975':'#dce1d9'}"></i>`).join('')}</div><div class="key"><span>1 = low need</span><span>5 = high need</span></div>`;
const front=[
 {n:1,y:27,oval:[25,75,24,5],h:'Check the essentials',graphic:miniIcons([['depth','Depth'],['row_spacing','Rows'],['plant_spacing','Plants']]),p:'Quick Facts puts the useful numbers together. Check seed depth and both kinds of spacing.'},
 {n:2,y:63,oval:[86,101,29,6],h:'Find your growing window',graphic:calendar,p:'Green shows sowing; orange shows harvest. Use the months as a guide to local conditions.'},
 {n:3,y:99,oval:[86,118,29,5],h:'Choose a variety',graphic:'<div class="sample"><b>VARIETY</b><span>What makes it useful →</span></div>',p:'Compare the notes for flavour, season or growing conditions that suit your plot.'},
 {n:4,y:135,oval:[25,136,25,6],h:'Read the five-block scale',graphic:scale,p:'Core Needs rates sun, water and nutrition. More filled blocks mean a greater need.'},
 {n:5,y:171,oval:[59,162,57,6],h:'Know what to watch for',graphic:'<div class="risk">KEY RISKS <span>↓</span> EARLY WARNING</div>',p:'Scan the main risks before you start. Turn over for symptoms and control advice.'},
];
const back=[
 {n:1,y:26,oval:[81,46,33,6],h:'Keep it growing',graphic:miniIcons([['water','Water'],['weeding','Weed']]),p:'Use Looking After the Crop for routine care as plants develop.'},
 {n:2,y:71,oval:[24,71,24,6],h:'Follow the planting steps',graphic:image(sow,'width:100%;height:19mm;object-fit:contain'),p:'Read the numbered pictures in order. Check the depth and spacing labels below them.'},
 {n:3,y:119,oval:[82,69,33,6],h:'Pick at the right moment',graphic:miniIcons([['harvest','Ready to pick']]),p:'Harvesting explains when and how to pick. Look at the plants as well as the calendar.'},
 {n:4,y:164,oval:[83,87,32,6],h:'Match signs to action',graphic:'<div class="sample"><b>SIGNS</b><span>→</span><b>CONTROL</b></div>',p:'Find a likely problem in the table, compare its signs, then read the suggested response.'},
];


const card=(a,cls)=>`<article class="${cls}"><h2>${a.h}</h2><p>${a.p}</p><div class="graphic">${a.graphic}</div></article>`;
function page(i){
 const upper=i?[back[1],back[0]]:[front[0],front[1]];
 const lower=i?[back[2],back[3]]:[front[3],front[2]];
 return `<section class="page"><header><div class="eyebrow">HOW TO USE YOUR CHEAT SHEETS / ${i+1} OF 2</div><h1>${i?'Turn over. Get growing.':'Start here. Plan your crop.'}</h1><p>${i?'Planting, care and picking - explained at a glance.':'The front brings your crop’s essentials together.'}</p></header>
 <div class="intro">${i?'Use the practical steps while you work.':'Read your own crop’s figures; this carrot sheet is an example.'}</div>
 ${upper.map((a,j)=>card(a,'top '+(j?'right':'left'))).join('')}
 <svg class="sheet" viewBox="58 76 766 1090"><image href="${sheets[i]}" width="884" height="1250"/></svg>
 <svg class="arrows" viewBox="0 0 210 297"><defs><marker id="tip${i}" viewBox="0 0 6 6" refX="5" refY="3" markerUnits="userSpaceOnUse" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill="#b55727"/></marker></defs>
 ${['M76 100 L76 95','M134 100 L134 95','M76 234 L76 241','M134 234 L134 241',...(!i?['M58 218 L52 218']:[])].map(d=>`<path d="${d}" stroke="#b55727" stroke-width="1.2" fill="none" marker-end="url(#tip${i})"/>`).join('')}</svg>
 ${lower.map((a,j)=>card(a,'bottom '+(j?'right':'left'))).join('')}
 ${!i?`<aside><div class="risk-label">KEY RISKS</div><h2>Know what to watch for</h2><p>Scan the risks before you start. Turn over for symptoms and control advice.</p></aside>`:''}
 <div class="sheet-caption">EXAMPLE SHEET · ${i?'BACK / PAGE 2':'FRONT / PAGE 1'}</div>
 <footer><span>VEGETABLE CHEAT SHEETS</span><span>HOW TO USE · ${i+1} / 2</span></footer></section>`;
}
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>How to use your vegetable cheat sheets</title><style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box} @page{size:A4;margin:0}body{margin:0;font-family:Inter,sans-serif;color:#243b31;print-color-adjust:exact;-webkit-print-color-adjust:exact}.page{width:210mm;height:297mm;position:relative;background:#fcfaf5;break-after:page}.page:last-child{break-after:auto}
header{height:39mm;background:#1a2520;color:white;padding:8mm 14mm 5mm;border-bottom:1.3mm solid #e6aa69}.eyebrow{font-size:7pt;font-weight:700;letter-spacing:1.4pt;color:#d7e0cf}h1{font-size:25pt;letter-spacing:-.8pt;line-height:1.1;margin:4mm 0 2mm;font-weight:850}header p{font-size:9pt;margin:0;color:#e2e8dc}.intro{position:absolute;top:43mm;width:100%;text-align:center;font-size:8.5pt;color:#637366}
article{position:absolute;width:88mm;border:1px solid #e0e4da;border-radius:2mm;padding:3mm;background:#faf9f3}.left{left:14mm}.right{right:14mm}.top{top:52mm;height:40mm}.bottom{top:244mm;height:37mm}
h2{font-size:11pt;line-height:1.15;margin:0 0 1.5mm;font-weight:800}article p,aside p{font-size:8.3pt;line-height:1.35;margin:0}article .graphic{margin-top:2mm}.iconrow{display:flex;justify-content:center;gap:9mm}.iconrow img{display:block;width:13mm;height:13mm;object-fit:contain;margin:auto}.iconrow span{display:block;text-align:center;font-size:7pt;margin-top:.8mm}
.months{font-size:7pt;word-spacing:5.5mm;margin-bottom:1mm}.cells{display:flex;gap:.6mm;margin-bottom:.5mm}.cells i{height:3mm;flex:1}.key{display:flex;justify-content:space-between;font-size:7pt;margin-top:1mm}.key span:first-child{color:#427b50}.key span:last-child{color:#9a5727}.scale{display:flex;gap:1mm}.scale i{flex:1;height:7mm;border-radius:1mm}.sample{background:#e9eee3;padding:3mm;font-size:8pt;display:flex;justify-content:space-between;gap:2mm}.bottom .iconrow img{width:11mm;height:11mm}.sheet{position:absolute;left:59mm;top:102mm;width:92mm;height:130.91mm}.arrows{position:absolute;inset:0;width:210mm;height:297mm;pointer-events:none}.sheet-caption{position:absolute;top:104mm;left:14mm;width:37mm;font-size:6.5pt;line-height:1.5;font-weight:700;letter-spacing:.6pt}aside{position:absolute;left:14mm;top:187mm;width:37mm;background:#f8ebde;border-radius:2mm;padding:3mm}aside h2{font-size:10pt}.risk-label{font-size:6.5pt;font-weight:800;color:#a65623;letter-spacing:1pt;margin-bottom:2mm}footer{position:absolute;bottom:7mm;left:14mm;right:14mm;border-top:1px solid #b7c2b0;padding-top:2mm;display:flex;justify-content:space-between;font-size:6pt;letter-spacing:.6pt}
</style><body>${page(0)}${page(1)}</body></html>`;
await fs.writeFile(path.join(out,'how-to.html'),html);
const browser=await chromium.launch();
try{
 const p=await browser.newPage();await p.setContent(html,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
 await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));
 const errors=await p.evaluate(()=>[...document.querySelectorAll('article')].filter(e=>e.scrollHeight>e.clientHeight+1).map(e=>e.textContent));
 if(errors.length)throw new Error('Callout overflow: '+JSON.stringify(errors));
 if(!await p.evaluate(()=>document.fonts.check('800 16px Inter')))throw new Error('Inter font not ready');
 await p.pdf({path:path.join(out,'how-to-use-A4.pdf'),format:'A4',preferCSSPageSize:true,printBackground:true});
}finally{await browser.close();}
