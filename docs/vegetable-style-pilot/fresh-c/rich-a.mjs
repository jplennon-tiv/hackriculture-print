// Read the actual approved guide as a content-parity baseline, then author a new layout.
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {readCollection} from '../../../../hackriculture-data/lib/records.mjs';
const root=new URL('./',import.meta.url),d=readCollection('vegetables').carrot;
const browser=await chromium.launch(),models={};
try{
 const p=await browser.newPage({viewport:{width:688,height:979}});await p.emulateMedia({media:'print'});
 for(const units of ['metric','imperial']){
  await p.goto(`http://127.0.0.1:5173/print/vegetable/carrot?units=${units}`,{waitUntil:'networkidle'});
  await p.waitForFunction(()=>document.body.dataset.printReady==='true');
  models[units]=await p.evaluate(()=>{
   const q=(name,scope=document)=>scope.querySelector(`[class*="${name}_"]`);
   const all=(name,scope=document)=>[...scope.querySelectorAll(`[class*="${name}_"]`)];
   const t=(name,scope)=>q(name,scope)?.innerText.trim()??'';
   const icon=e=>e.querySelector('img')?.getAttribute('src');
   return {
    intro:t('cheatIntro'),
    facts:all('cheatQfRow').map(e=>({label:t('cheatQfLbl',e),value:t('cheatQfVal',e),icon:icon(e)})),
    varieties:all('cheatVarRow').map(e=>({type:t('cheatVarType',e),name:t('cheatVarName',e),text:t('cheatVarDesc',e)})),
    risks:all('cheatKeyRiskItem').map(e=>({name:t('cheatKeyRiskName',e),text:t('cheatKeyRiskText',e),icon:icon(e)})),
    pests:all('cheatPestLbl').map(e=>({name:e.innerText.trim(),values:all('cheatPestVal',e.closest('tr')).map(x=>x.innerText.trim())})),
    tips:all('cheatFinalTipItem').map(e=>({text:t('cheatFinalTipText',e),icon:icon(e)})),
    planting:[...document.querySelectorAll('[data-planting-card] section')].map(e=>({title:e.querySelector('h3')?.innerText.replace(/^\d+\s*/,'').trim(),text:e.querySelector('p')?.innerText.trim(),icon:icon(e)})),
   };
  });
 }
}finally{await browser.close()}
const e=v=>String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const img=(src,cls='')=>`<img class="${cls}" src="../../../public${src}" alt="">`;
const art=()=>'<img class="hero-art" src="../assets/carrot-cutout.png" alt="Bright orange carrots with green tops">';
const icon=k=>img('/images/coloured-icons/style-a-v1/'+k+'.svg');
const foot=n=>`<footer><span>VEGETABLE GROWING <b>CHEAT SHEETS</b></span><span>CARROT <b>0${n}</b></span></footer>`;
const dots=(v,cls='')=>`<span class="scale ${cls}" aria-label="${v} out of 5">${Array.from({length:5},(_,i)=>`<i class="${i<v?'on':''}"></i>`).join('')}</span>`;
const monthNames=['J','F','M','A','M','J','J','A','S','O','N','D'];
const active=(spans,m)=>spans.some(s=>{const [a,b=a]=s.split('/').map(v=>Number(v.slice(2)));return m>=a&&m<=b});
function calendar(){return `<section class="calendar"><h2>Your growing year.</h2><div class="month-row"><b></b>${monthNames.map(m=>`<span>${m}</span>`).join('')}</div>${[['Sow','sowing_time'],['Harvest','harvest_time']].map(([label,k])=>`<div class="month-row ${k}"><b>${label}</b>${monthNames.map((m,i)=>`<span class="${active(d.calendar[k].most_popular,i+1)?'usual':active(d.calendar[k].less_usual,i+1)?'extra':''}"></span>`).join('')}</div>`).join('')}<p>Solid: usual months · Pale: earlier/later crops</p></section>`}
function needs(){return `<section class="needs"><h2>Core needs.</h2><small>1 = low · 5 = high</small>${Object.entries(d.core_needs).map(([key,v])=>`<div>${icon(key==='nutrition'?'feeding':key)}<b>${key==='nutrition'?'Nutrition':key[0].toUpperCase()+key.slice(1)}</b>${dots(v,key)}<strong>${v}/5</strong></div>`).join('')}</section>`}
function page1(m){let type='';return `<section class="sheet rich front"><header><div class="peach"></div><div class="eyebrow">ROOT CROPS / YOUR GROWING GUIDE</div>${art()}<h1>Carrots<span>.</span></h1><div class="ribbon">Grow a little sweetness.</div><h2 class="lead">${e(d.hero_header)}</h2><aside class="difficulty"><small>DIFFICULTY</small><strong>Not difficult</strong>${dots(d.difficulty)}<span>${d.difficulty}/5</span></aside><div class="seasons">${img('/images/header_chars/season_summer.png')}${img('/images/header_chars/season_autumn.png')}<b>Summer / autumn crops</b></div></header><p class="intro">${e(m.intro)}</p><section class="quick"><h2>Quick facts.</h2><div class="fact-grid">${m.facts.map(f=>`<article>${img(f.icon)}<div><h3>${e(f.label)}</h3><p>${e(f.value)}</p></div></article>`).join('')}</div></section><div class="year-needs">${calendar()}${needs()}</div><section class="varieties"><h2>Find your favourite.</h2><div>${m.varieties.map(v=>{type=v.type||type;return `<article><small>${e(type)}</small><h3>${e(v.name)}</h3><p>${e(v.text)}</p></article>`}).join('')}</div></section><section class="key-risks"><h2>Key risks.</h2><div>${m.risks.map(r=>`<article>${img(r.icon)}<h3>${e(r.name)}</h3><p>${e(r.text)}</p></article>`).join('')}</div></section>${foot(1)}</section>`}
function page2(m,units){
 const value=x=>typeof x==='string'?x:x[units];
 const sections=d.ai_print_extracts.sections;
 const list=k=>sections[k].value.map(x=>value(x.text));
 const prose=(title,items,cls)=>`<section class="${cls}"><h2>${title}</h2><ol>${items.map(t=>`<li>${e(t)}</li>`).join('')}</ol></section>`;
 return `<section class="sheet rich back"><header><div class="eyebrow">CARROTS / YOUR GROWING COMPANION</div><h1>Grow it. <span>Love it.</span></h1>${art()}</header><div class="remember">${sections.key_notes.value.map(x=>`<div><h3>${e(x.title)}</h3><p>${e(x.body)}</p></div>`).join('')}</div><div class="growing-columns"><div>${prose('Soil & preparation.',list('soil_facts'),'soil')}<section class="planting"><h2>Sow. Cover. Thin.</h2><div class="stages">${m.planting.map((x,i)=>`<article><h3><span>${i+1}</span> ${e(x.title)}</h3>${img(x.icon)}<p>${e(x.text)}</p></article>`).join('')}</div><div class="measurements"><span><b>Seed depth</b> ${e(value(d.sowing_and_planting.sowing_depth))}</span><span><b>Rows</b> ${e(value(d.sowing_and_planting.row_spacing))}</span><span><b>Final plants</b> ${e(value(d.sowing_and_planting.plant_spacing))}</span></div>${list('sowing_notes').map(t=>`<p>${e(t)}</p>`).join('')}</section></div><div>${prose('Looking after your crop.',list('looking_after_the_crop'),'care')}${prose('Pull. Crunch. Store.',list('harvesting'),'harvest')}</div></div><section class="pests"><h2>Pests & diseases.</h2><table><thead><tr><th>Problem</th><th>What to look for</th><th>What to do</th></tr></thead><tbody>${m.pests.map(x=>`<tr><th>${e(x.name)}</th>${x.values.map(v=>`<td>${e(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></section><section class="tips"><h2>Final tips.</h2>${m.tips.map(x=>`<div>${img(x.icon)}<p>${e(x.text)}</p></div>`).join('')}</section>${foot(2)}</section>`;
}
for(const [units,m] of Object.entries(models)){
 if(m.facts.length!==8||m.pests.length!==10||m.planting.length!==3)throw Error('Unexpected baseline content');
 await fs.writeFile(new URL(`a-rich-${units}.html`,root),`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>A · Full information · ${units}</title><link href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Nunito+Sans:wght@400;600;700;800;900&display=swap" rel="stylesheet"><link href="rich-a.css" rel="stylesheet"></head><body>${page1(m)}${page2(m,units)}</body></html>`);
}
await fs.writeFile(new URL('RICH-CONTENT.json',root),JSON.stringify({scope:'Same content as the live approved carrot guide, in a new A layout. Bubble artwork replaced by text callouts; all three callout messages retained.',sourceSHA256:createHash('sha256').update(await fs.readFile(new URL('../../../../hackriculture-data/vegetables/carrot/carrot.json',import.meta.url))).digest('hex'),models},null,2)+'\n');
console.log('Captured both-unit approved content and built richer A pages.');
