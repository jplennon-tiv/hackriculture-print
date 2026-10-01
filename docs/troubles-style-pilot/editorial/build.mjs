import fs from 'node:fs/promises';
import {build} from 'esbuild';
import {readCollection} from '../../../../hackriculture-data/lib/records.mjs';
const root=new URL('./',import.meta.url);
try { await fs.access(new URL('DESIGN-APPROVAL.json',root)); throw Error('Approved reference is locked. Work in a separate variant directory.'); } catch (error) { if(error.code!=='ENOENT') throw error; }
const bundle=await build({stdin:{contents:'export {troubleCopy} from "./src/print/troubleContent.ts"; export {troublePlanStatus} from "./src/print/troublePlan.ts";',resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',write:false});
const {troubleCopy,troublePlanStatus}=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'));
const groups=readCollection('troubles'),veg=readCollection('vegetables');
const palettes=JSON.parse(await fs.readFile(new URL('../../vegetable-style-pilot/group-colours/palettes.json',root)));
const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const choices=[['carrot_and_parsnip_troubles','roots','Carrot &<br>parsnip.'],['onion_and_leek_troubles','onions','Onion &<br>leek.']];
const models=[];
for(const [key,pid,title] of choices){
 const g=groups[key],p=palettes.find(x=>x.id===pid),status=troublePlanStatus(g);
 if(!status.usable)throw Error(key+': '+status.warning);
 const model={key,palette:pid,totalPages:g.ai_layout.pages.length,sourceHeading:g.source_heading,introduction:g.ai_introduction??g.introduction,pages:[],warnings:[]};
 const ordered=g.ai_layout.pages.flatMap(page=>page.columns.flat());
 const pages=[ordered.slice(0,6),ordered.slice(6,12)].map((entries,pageIndex)=>{
 const spec={columns:[entries.slice(0,3),entries.slice(3)]};
  const cards=spec.columns.flatMap(column=>column.map(e=>{const c=g.conditions[e.key],copy=troubleCopy(c);if(copy.warning)model.warnings.push(copy.warning);return {key:e.key,name:c.name,star:c.star||false,crops:(c.applies_to??g.applies_to??[]).map(k=>veg[k]?.name??k.replaceAll('_',' ')).join(' / '),image:c.image,symptom:c.visual_heading||c.visual_symptom||'',copy};}));
  model.pages.push(cards);
  const card=c=>`<article class="entry" data-key="${c.key}">${c.image?`<img class="diagnostic" src="../../../public${esc(c.image)}" alt="${esc(c.name)}">`:''}<p class="crops">${esc(c.crops)}</p><h2>${esc(c.name)}${c.star?' ★':''}</h2>${c.symptom?`<p class="symptom">${esc(c.symptom)}</p>`:''}<div class="advice">${['recognise','act','prevent'].filter(k=>c.copy[k]).map(k=>`<section class="${k}"><h3>${k}</h3><p>${esc(c.copy[k])}</p></section>`).join('')}</div></article>`;
  // Preserve the source reading sequence while regrouping for this six-entry experiment.
  return `<div class="sheet ${pageIndex?'continuation':'opening'}"><header><div class="blob"></div><p class="eyebrow">VEGETABLE GROWING / ${esc(p.group)}</p><h1>${pageIndex?esc(g.source_heading):title.replace('<br>',' ')}</h1><div class="ribbon">Troubles guide</div>${pageIndex?'':`<p class="intro">${esc(model.introduction)}</p>`}<p class="navigation">Recognise<span>→</span>Act<span>→</span>Prevent</p></header><main class="columns">${[cards.slice(0,spec.columns[0].length),cards.slice(spec.columns[0].length)].map(col=>`<div class="column">${col.map(card).join('')}</div>`).join('')}</main><footer><span>VEGETABLE GROWING CHEAT SHEETS · TROUBLES</span><span>DESIGN STUDY · ${pageIndex+1}</span></footer></div>`;
 }).join('');
 const css=['ink','dark','deep','accent','soft','wash','paper'].map(k=>`--${k}:${p[k]}`).join(';');
 const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${esc(g.source_heading)} · Design pilot</title><link href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet"><link href="style.css" rel="stylesheet"></head><body data-family="${pid}" style="${css}">${pages}</body></html>`;
 await fs.writeFile(new URL(key+'.html',root),html);models.push(model);
}
await fs.writeFile(new URL('CONTENT.json',root),JSON.stringify(models,null,2)+'\n');
const panels=models.map(m=>`<section><h2>${esc(m.sourceHeading)}</h2><p>Six conditions per page · ${m.pages.flat().length} complete entries, regrouped from the existing ${m.totalPages}-page guide.</p><div class="pair">${[1,2].map(n=>`<a href="${m.key}.html"><img src="${m.key}-${n}.png" alt="${esc(m.sourceHeading)}, page ${n}"></a>`).join('')}</div><p><a href="${m.key}.html">Full-size live pages</a></p></section>`).join('');
await fs.writeFile(new URL('REVIEW.html',root),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Troubles · Richer A pilot</title><style>body{margin:0;background:#eeeee5;color:#173e2c;font:16px/1.5 system-ui}main{max-width:1500px;margin:auto;padding:28px}h1{font-size:38px;line-height:1.1}h2{margin-top:36px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:24px}.pair img{width:100%;display:block;box-shadow:0 5px 25px #0001}a{color:inherit}header p{max-width:1000px}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><main><header><small>TROUBLES · OPEN EDITORIAL V1 · APPROVED 28 SEPTEMBER 2026</small><h1>Less furniture. More diagnosis.</h1><p>Larger diagnostic illustrations with advice flowing around them. Open columns and fine separators replace fixed-height cards. Chunky headings, group ribbons and Family Tint keep the family resemblance.</p><p>Six entries per page in these examples, with every word retained. This is the approved design; six is not a universal quota: longer conditions may need more room. First twelve conditions per group only; live templates and data are unchanged. <a href="../../TROUBLES-PRINT-STYLE.md">Approved style contract</a> · <a href="DESIGN-APPROVAL.json">Approval manifest</a> · <a href="README.md">Scope and checks</a>.</p></header>${panels}</main></html>`);
console.log(JSON.stringify(models.map(m=>({group:m.key,cards:m.pages.flat().length,warnings:m.warnings})),null,2));
