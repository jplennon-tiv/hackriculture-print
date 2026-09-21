import fs from 'node:fs/promises';
import path from 'node:path';
import {chromium} from 'playwright';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'output/pdf/how-to-centred-v3');
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

const placements=[
 [{x:0,y:63,w:43,side:'left'},{x:148,y:88,w:42,side:'right'},{x:148,y:132,w:42,side:'right'},{x:0,y:123,w:43,side:'left'},{x:57,y:173,w:80,side:'bottom'}],
 [{x:148,y:27,w:42,side:'right'},{x:0,y:74,w:43,side:'left'},{x:148,y:78,w:42,side:'right'},{x:148,y:126,w:42,side:'right'}]
];
function marks(items,index){return items.map(({oval},i)=>{
 const a=placements[index][i],factor=86/118;
 const cy=40+(oval[1]-20)*factor;
 let sx=139,sy=cy,ex=146,ey=a.y+3;
 if(a.side==='left'){sx=51;ex=45;}
 if(a.side==='bottom'){sx=95;sy=164;ex=95;ey=170;}
 // Attach to nearby content edges, rather than forcing every arrow to a title.
 if(index===0 && i===0)ey=80;
 if(index===0 && i===1)ey=95;
 if(index===0 && i===2)sy=132;
 if(index===1 && i===0)ey=57;
 if(index===1 && i===3)sy=126;
 return `<path d="M ${sx} ${sy} L ${ex} ${ey}" fill="none" stroke="#b55727" stroke-width=".9" marker-end="url(#arrow${index})"/>`;
 }).join('');}
function page(index,items){return `<section class="page"><header><div class="eyebrow">HOW TO USE YOUR CHEAT SHEETS / ${index+1} OF 2</div><h1>${index?'Turn over. Get growing.':'Start here. Plan your crop.'}</h1><p>${index?'Planting, care and picking - explained at a glance.':'The front brings your crop’s essentials together.'}</p></header><main><div class="sheetlabel">EXAMPLE SHEET · ${index?'BACK / PAGE 2':'FRONT / PAGE 1'}</div><svg class="drawing" viewBox="0 0 190 225" xmlns="http://www.w3.org/2000/svg"><defs><marker id="arrow${index}" viewBox="0 0 6 6" refX="5" refY="3" markerUnits="userSpaceOnUse" markerWidth="3.5" markerHeight="3.5" orient="auto-start-reverse"><path d="M 0 0 L 6 3 L 0 6 Z" fill="#b55727"/></marker></defs><svg x="52" y="40" width="86" height="122.44" viewBox="58 76 766 1090"><image href="${sheets[index]}" width="884" height="1250"/></svg>${marks(items,index)}</svg>${items.map((a,i)=>{const p=placements[index][i];return `<article style="left:${p.x}mm;top:${p.y}mm;width:${p.w}mm"><h2>${a.h}</h2>${a.graphic}<p>${a.p}</p></article>`}).join('')}<div class="under-sheet">${index?'Use the practical steps while you work.':'Read your own crop’s figures; the sheet here is an example.'}</div></main><footer><span>VEGETABLE CHEAT SHEETS</span><span>HOW TO USE · ${index+1} / 2 · DESIGN PROOF</span></footer></section>`;}
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>How to use your vegetable cheat sheets</title><style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
*{box-sizing:border-box} @page{size:A4;margin:0}body{margin:0;font-family:Inter,sans-serif;color:#243b31;-webkit-print-color-adjust:exact;print-color-adjust:exact}.page{width:210mm;height:297mm;background:#fcfaf5;position:relative;break-after:page;overflow:hidden}.page:last-child{break-after:auto}header{height:49mm;background:#1a2520;color:#fff;padding:10mm 12mm 6mm 17mm;border-bottom:1.5mm solid #e6aa69}.eyebrow{font-size:7pt;letter-spacing:1.5pt;font-weight:700;color:#c5d5ba}h1{font-size:25pt;line-height:1.08;letter-spacing:-.8pt;margin:5mm 0 3mm;font-weight:850}header p{font-size:9pt;color:#d7e0cf;margin:0}main{position:relative;margin:7mm 10mm 0 12mm;height:213mm}.sheetlabel{position:absolute;top:7mm;left:0;font-size:7pt;letter-spacing:1pt;font-weight:800}.drawing{position:absolute;width:190mm;height:213mm;left:0;top:0}article{position:absolute;left:134mm;width:53mm}h2{font-size:10pt;line-height:1.23;margin:0 0 3mm;display:flex;gap:2mm;align-items:flex-start}h2 b{background:#b55727;color:#fff;border-radius:50%;width:5mm;height:5mm;display:flex;align-items:center;justify-content:center;flex:none;font-size:8pt}article p{font-size:8.5pt;line-height:1.43;margin:2mm 0 0}.iconrow{display:flex;gap:4mm;justify-content:center}.iconrow img{display:block;width:10mm;height:10mm;object-fit:contain;margin:auto}.iconrow span{display:block;text-align:center;font-size:6.5pt;margin-top:1mm}.months{font-size:6.5pt;word-spacing:2.4mm;margin-bottom:1mm}.cells{display:flex;gap:.5mm;margin-bottom:.5mm}.cells i{height:3mm;flex:1}.key{display:flex;justify-content:space-between;font-size:6.5pt;margin:1mm 0 0}.key span:first-child{color:#427b50}.key span:last-child{color:#9a5727}.scale{display:flex;gap:1mm;margin-top:3mm}.scale i{flex:1;height:4mm;border-radius:.5mm}.sample{background:#e9eee3;padding:2mm;font-size:6.8pt;display:flex;justify-content:space-between;gap:2mm}.risk{font-size:6.5pt;font-weight:800;color:#9e5522;display:flex;justify-content:space-between;gap:1mm;border-top:1px solid #d4ad88;padding-top:2mm}.under-sheet{position:absolute;left:2mm;top:194mm;width:112mm;font-size:7.5pt;line-height:1.5;color:#637366}footer{position:absolute;bottom:9mm;left:17mm;right:12mm;border-top:1px solid #b7c2b0;padding-top:3mm;display:flex;justify-content:space-between;font-size:6pt;letter-spacing:.6pt}
.drawing{height:225mm}main{height:225mm;margin-top:1mm;margin-left:10mm}.sheetlabel{left:52mm;top:32mm;font-size:6.3pt;letter-spacing:.5pt}.under-sheet{left:0;top:8mm;width:190mm;text-align:center;font-size:9pt}.iconrow{gap:2mm}.iconrow img{width:9mm;height:9mm}h2{font-size:9pt;margin-bottom:2.5mm}article p{font-size:8pt;line-height:1.45}.months{word-spacing:1.4mm}.sample{font-size:6pt}.key{font-size:6pt}
</style><body>${page(0,front)}${page(1,back)}</body></html>`;
await fs.writeFile(path.join(out,'how-to.html'),html);
const browser=await chromium.launch();try{const p=await browser.newPage();await p.setContent(html,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.evaluate(()=>Promise.all([...document.images].map(i=>i.decode())));await p.pdf({path:path.join(out,'how-to-use-annotated-A4.pdf'),format:'A4',preferCSSPageSize:true,printBackground:true});}finally{await browser.close();}
