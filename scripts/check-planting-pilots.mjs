// Focused real-export checks; never writes the master or calls AI services.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const root = path.resolve(import.meta.dirname,'..');
const rollout = process.argv.includes('--rollout04') ? '04' : process.argv.includes('--rollout03') ? '03' : process.argv.includes('--rollout02') ? '02' : process.argv.includes('--rollout01') ? '01' : null;
const batch = Boolean(rollout);
const out = path.join(root,'output/pdf',batch?`planting-rollout${rollout}`:'planting-production');
await fs.mkdir(out,{recursive:true});
const baseline = process.argv.includes('--baseline');
const crops = rollout === '04' ? ['bean_broad','bean_french',...(baseline?['bean_runner','pea']:[]),'sweet_corn'] : rollout === '03' ? ['garlic','onion_shallot','lettuce','endive',...(baseline?['beet_leaf']:[]),'oriental_leaves'] : rollout === '02' ? ['broccoli','brussels_sprouts','cabbage','cauliflower','kale','kohl_rabi'] : batch ? ['parsnip','radish','turnip','swede','spinach','salsify_scorzonera'] : ['beetroot','carrot','potato','leek','chicory'];
// Baselines are evidence, never silently replace one on a later run.
if(baseline) assert.equal(await fs.access(path.join(out,'baseline.json')).then(()=>true,()=>false),false,'Baseline already exists; use its saved evidence.');
const results=[];
const browser=await chromium.launch();
try {
  const page=await browser.newPage({viewport:{width:688,height:979}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const crop of crops) for(const units of ['metric','imperial']) {
    await page.goto(`http://127.0.0.1:5173/print/vegetable/${crop}?units=${units}`,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.body.dataset.printReady==='true');
    const state=await page.evaluate(()=>{
      const p=document.querySelectorAll('[class*="cheatPage_"]')[1];
      return {error:document.body.dataset.printError??'',planting:document.body.dataset.plantingLayout??'',
        cards:[...p.querySelectorAll('[class*="cheatCard_"]')].map(e=>({title:e.firstElementChild.textContent,text:e.innerText})),
        pageOne:document.querySelector('[class*="cheatPage_"]').innerText,
        pageTwo:p.innerText,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)};
    });
    assert.equal(state.error,'',`${crop}: print error`);assert.deepEqual(state.broken,[]);
    if(!baseline){
      assert.match(state.planting,/done/);
      if(batch)assert.match(state.planting,/:images$/,`${crop}: rollout must retain its illustrations`);
    }
    for(const paper of baseline||batch?['A4']:['A4','A5','A6']){
      const res=await fetch(`http://127.0.0.1:5173/api/pdf/vegetable/${crop}?units=${units}&paper=${paper}`);
      assert.equal(res.status,200,res.ok?'':await res.text());
      const file=`${crop}-${units}-${paper}-${baseline?'baseline':'illustrated'}.pdf`;
      await fs.writeFile(path.join(out,file),Buffer.from(await res.arrayBuffer()));
      results.push({crop,units,paper,file,...state});
      await fs.writeFile(path.join(out,baseline?'baseline.json':'production.json'),JSON.stringify(results,null,2));
      console.log(file);
    }
  }
  assert.deepEqual(errors,[]);
}finally{await browser.close();}
