// Ephemeral DOM capacity trials only: approved HTML, PDFs, data and styles remain untouched.
import fs from 'node:fs/promises';
import {chromium} from 'playwright';
const dir='docs/publication/variety-space-audit';
const {results}=JSON.parse(await fs.readFile(dir+'/MEASUREMENTS.json','utf8'));
const choices={
 artichoke_globe:['ROMANESCO','CAMUS DE BRETAGNE'],
 artichoke_jerusalem:['GERARD'],
 aubergine:['BLACK BEAUTY','ROSA BIANCA'],
 bean_broad:["BUNYARD'S EXHIBITION (white)"],bean_french:['HUNTER'],bean_runner:['POLESTAR'],
 beetroot:['RED ACE'],broccoli:['WHITE EYE','RED ARROW'],brussels_sprouts:['PEER GYNT','CITADEL'],
 capsicum:['NEW ACE'],carrot:['AMSTERDAM FORCING'],cauliflower:['SNOWBALL'],celeriac:['Marble Ball','Balder'],
 celery:['Giant White','Giant Pink'],chicory:['Normato','Crystal Head'],
 marrow_courgette:['Rondo di Nizza'],cucumber_greenhouse:['Pepinex','Rocky F1'],
 cucumber_outdoor:['La Diva','Long Green Ridge'],endive:['Bubikopf'],florence_fennel:['Finale'],garlic:['Spanish Roja'],
 kale:['Dwarf Green Curled'],lettuce:["Webb's Wonderful"],oriental_leaves:['Waido'],
 radish:['Sparkler'],spinach:['Bloomsdale'],squash_pumpkin:['Little Gem'],sweet_corn:['Sundance','Earliking'],
 tomato_outdoor:['Roma'],turnip:['Snowball','Manchester Market']
};
const browser=await chromium.launch();const page=await browser.newPage({viewport:{width:1100,height:1200}});const trials=[];
try{
 for(const r of results){
  if(!choices[r.crop])continue;
  const additions=choices[r.crop].map(name=>{
   const v=r.reserves.find(v=>v.name===name);if(!v)throw Error('Missing '+name);
   const text=v.short_text||v.text.match(/^.*?[.!?](?:\s|$)/)?.[0].trim()||v.text;
   return {name:v.name,type:v.type,text,sourceText:v.text,sourceShortText:v.short_text||null};
  });
  for(let number=1;number<=additions.length;number++){
  const selectedAdditions=additions.slice(0,number);
  const count=r.units.imperial.varieties.length+number;
  const columns=count<=4?2:3;const units={};
  for(const unit of ['imperial','metric']){
   await page.goto('http://127.0.0.1:5173/'+r.units[unit].html,{waitUntil:'load'});await page.emulateMedia({media:'print'});
   await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
   units[unit]=await page.evaluate(({additions,columns})=>{
    const front=document.querySelector('.front'),grid=front.querySelector('.varieties>div');
    const template=grid.querySelector('article').cloneNode(true);
    for(const a of additions){
     const e=template.cloneNode(true);e.querySelector('h3').textContent=a.name;e.querySelector('p').textContent=a.text;
     let small=e.querySelector('small');if(a.type){if(!small){small=document.createElement('small');e.prepend(small);}small.textContent=a.type;}else small?.remove();
     grid.append(e);
    }
    grid.style.setProperty('grid-template-columns','repeat(6,1fr)','important');
    const all=[...grid.querySelectorAll('article')];
    all.forEach((e,i)=>e.style.setProperty('grid-column',`span ${columns===2?3:all.length===5&&i>=3?3:2}`,'important'));
    const mm=25.4/96;const risks=front.querySelector('.key-risks').getBoundingClientRect();
    return {gapMm:(front.querySelector('footer').getBoundingClientRect().top-risks.bottom)*mm,varietyHeightMm:front.querySelector('.varieties').getBoundingClientRect().height*mm,count:grid.children.length};
   },{additions:selectedAdditions,columns});
  }
  trials.push({crop:r.crop,countBefore:r.units.imperial.varieties.length,countAfter:count,columns,additions:selectedAdditions,units});
  }
 }
}finally{await browser.close();}
await fs.writeFile(dir+'/CAPACITY-TRIALS.json',JSON.stringify({date:'2026-11-10',status:'Exploratory DOM measurements only; not PDF proofs, horticultural selections or approved changes.',method:'Retain all existing entries verbatim. Add exact master short_text where present, otherwise its first full sentence. Change only the varieties grid to the existing two-column, three-column or balanced five-entry arrangement. Keep existing body type, spacing, artwork and all other content. First-sentence excerpts are temporary measurement loads, not proposed finished copy. No canonical or approved file is written.',trials},null,2)+'\n');
console.table(trials.map(t=>({crop:t.crop,before:t.countBefore,after:t.countAfter,gapI:t.units.imperial.gapMm.toFixed(2),gapM:t.units.metric.gapMm.toFixed(2),pass:Math.min(t.units.imperial.gapMm,t.units.metric.gapMm)>=3})));
