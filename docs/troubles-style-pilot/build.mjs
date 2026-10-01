import fs from 'node:fs/promises';
import {build} from 'esbuild';
import {readCollection} from '../../../hackriculture-data/lib/records.mjs';
const root=new URL('./',import.meta.url);
const bundle=await build({stdin:{contents:'export {troubleCopy} from "./src/print/troubleContent.ts"; export {troublePlanStatus} from "./src/print/troublePlan.ts";',resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});
const {troubleCopy,troublePlanStatus}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const groups=readCollection('troubles'),veg=readCollection('vegetables');
const palettes=JSON.parse(await fs.readFile(new URL('../vegetable-style-pilot/group-colours/palettes.json',root)));
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const choices=[['carrot_and_parsnip_troubles','roots','Carrot &<br>parsnip.'],['onion_and_leek_troubles','onions','Onion &<br>leek.']];
const models=[];
for(const [key,pid,title] of choices){
 const g=groups[key],p=palettes.find(x=>x.id===pid),status=troublePlanStatus(g);
 if(!status.usable)throw Error(key+': '+status.warning);
 const model={key,palette:pid,totalPages:g.ai_layout.pages.length,sourceHeading:g.source_heading,introduction:g.ai_introduction??g.introduction,pages:[],warnings:[]};
 const pages=g.ai_layout.pages.slice(0,2).map((spec,pageIndex)=>{
  const cards=spec.columns.flatMap(column=>column.map(e=>{const c=g.conditions[e.key],copy=troubleCopy(c);if(copy.warning)model.warnings.push(copy.warning);return {key:e.key,name:c.name,star:c.star||false,crops:(c.applies_to??g.applies_to??[]).map(k=>veg[k]?.name??k.replaceAll('_',' ')).join(' / '),image:c.image,symptom:c.visual_heading||c.visual_symptom||'',copy};}));
  model.pages.push(cards);
  const card=c=>`<article class="card" data-key="${c.key}"><div class="identity"><div><p class="crops">${esc(c.crops)}</p><h2>${esc(c.name)}${c.star?' ★':''}</h2>${c.symptom?`<p class="symptom">${esc(c.symptom)}</p>`:''}</div>${c.image?`<img src="../../public${esc(c.image)}" alt="${esc(c.name)}">`:''}</div><div class="advice">${['recognise','act','prevent'].filter(k=>c.copy[k]).map(k=>`<section class="${k}"><h3>${k}</h3><p>${esc(c.copy[k])}</p></section>`).join('')}</div></article>`;
  // Keep the approved column reading order and card memberships.
  return `<div class="sheet ${pageIndex?'continuation':'opening'}"><header><div class="blob"></div><p class="eyebrow">VEGETABLE GROWING / ${esc(p.group)}</p><h1>${pageIndex?esc(g.source_heading):title}</h1><div class="ribbon">Troubles guide</div>${pageIndex?'':`<p class="intro">${esc(model.introduction)}</p>`}<p class="navigation">Recognise<span>→</span>Act<span>→</span>Prevent</p></header><main class="columns">${[cards.slice(0,spec.columns[0].length),cards.slice(spec.columns[0].length)].map(col=>`<div class="column">${col.map(card).join('')}</div>`).join('')}</main><footer><span>VEGETABLE GROWING CHEAT SHEETS · TROUBLES</span><span>${pageIndex+1} / ${g.ai_layout.pages.length}</span></footer></div>`;
 }).join('');
 const css=['ink','dark','deep','accent','soft','wash','paper'].map(k=>`--${k}:${p[k]}`).join(';');
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(g.source_heading)} · Design pilot</title><link href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet"><link href="style.css" rel="stylesheet"></head><body style="${css}">${pages}</body></html>`;
 await fs.writeFile(new URL(key+'.html',root),html);models.push(model);
}
await fs.writeFile(new URL('CONTENT.json',root),JSON.stringify(models,null,2)+'\n');
const panels=models.map(m=>`<section><h2>${esc(m.sourceHeading)}</h2><p>Opening and continuation page · ${m.pages.flat().length} conditions from the approved ${m.totalPages}-page guide.</p><div class="pair">${[1,2].map(n=>`<a href="${m.key}.html"><img src="${m.key}-${n}.png" alt="${esc(m.sourceHeading)}, page ${n}"></a>`).join('')}</div><p><a href="${m.key}.html">Full-size live pages</a></p></section>`).join('');
await fs.writeFile(new URL('REVIEW.html',root),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Troubles · Richer A pilot</title><style>body{margin:0;background:#eeeee5;color:#173e2c;font:16px/1.5 system-ui}main{max-width:1500px;margin:auto;padding:28px}h1{font-size:38px;line-height:1.1}h2{margin-top:36px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:24px}.pair img{width:100%;display:block;box-shadow:0 5px 25px #0001}a{color:inherit}header p{max-width:1000px}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><main><header><small>TROUBLES MAKEOVER · DRAFT PILOT</small><h1>Same family. A diagnostic companion.</h1><p>Richer A lettering, group ribbons and Family Tint paper. Four conditions per page, with crop labels and the approved Recognise / Act / Prevent advice. The diagnostic illustrations retain their detail. A typographic opening gives these guides their own identity without competing with the vegetable cover artwork.</p><p>First two pages of each guide only; the complete guides and live templates are unchanged. <a href="README.md">Scope and checks</a>.</p></header>${panels}</main></html>`);
console.log(JSON.stringify(models.map(m=>({group:m.key,cards:m.pages.flat().length,warnings:m.warnings})),null,2));
