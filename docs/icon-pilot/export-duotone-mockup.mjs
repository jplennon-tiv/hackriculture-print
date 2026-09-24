// Browser-only substitutions: no production mapping, canonical record or approved PDF edits.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import sharp from 'sharp';
import { revision, readCollection } from '../../../hackriculture-data/lib/records.mjs';

const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const out = 'output/pdf/icon-style-d';
fs.mkdirSync(out, { recursive: true });
const priorRevision = revision();
assert.equal(priorRevision,'28df4d70397b07a9600a258d8de5f0b59e678d3c89f7390373186d2941a81fe0','Inspect newer data before rendering this pilot.');
const originals = {};
function remember(dir) {
  for(const e of fs.readdirSync(dir,{withFileTypes:true})) {
    const p=path.join(dir,e.name);
    if(e.isDirectory()) remember(p); else originals[p]=sha(fs.readFileSync(p));
  }
}
for(const dir of ['public/images/quick_facts','public/images/icons','public/images/key_risks','public/images/vegetable_icons']) remember(dir);
for(const key of ['broccoli']) for(const units of ['metric']) {
  const p=`output/pdf/normalisation-framing/${key}-${units}.pdf`;
  originals[p]=sha(fs.readFileSync(p));
}
const manifest=JSON.parse(fs.readFileSync('docs/icon-pilot/DUOTONE-MANIFEST.json'));
const alphaChecks=[];
for(const icon of manifest.icons) {
  const file=`public/images/icon-pilot/duotone-mockup/${icon.key}.png`;
  const {data,info}=await sharp(file).ensureAlpha().raw().toBuffer({resolveWithObject:true});
  let clear=0,ink=0,border=0;
  for(let y=0;y<info.height;y++) for(let x=0;x<info.width;x++) {
    const a=data[(y*info.width+x)*4+3];
    if(a===0) clear++; else ink++;
    if((x===0||y===0||x===info.width-1||y===info.height-1)&&a) border++;
  }
  assert.ok(clear>0&&ink>0);assert.equal(border,0,`Clipped edge: ${icon.key}`);
  alphaChecks.push({key:icon.key,width:info.width,height:info.height,transparent_pixels:clear,painted_pixels:ink,painted_edge_pixels:border});
}

const browser=await chromium.launch();const results=[];
try {
  const page=await browser.newPage({viewport:{width:688,height:979}});
  for(const key of ['broccoli']) for(const units of ['metric']) {
    await page.goto(`http://127.0.0.1:5173/print/vegetable/${key}?units=${units}`,{waitUntil:'networkidle'});
    await page.waitForFunction(()=>document.body.dataset.printReady==='true'||document.body.dataset.printError);
    // Existing shared-name deduplication issue: preserve the approved proof's fourth
    // risk for this visual study only. Source data and production renderer stay intact.
    let approvedProofAdjustment=null;
    if(key==='broccoli') {
      const pigeonText=readCollection('vegetables').broccoli.troubles.PIGEONS.text.split('. ')[0]+'.';
      approvedProofAdjustment=await page.evaluate(async text=>{
        const items=[...document.querySelectorAll('[class*="cheatKeyRiskItem"]')];
        const last=items.at(-1),name=last.querySelector('[class*="cheatKeyRiskName"]');
        if(name.textContent==='PIGEONS') return null;
        if(name.textContent!=='Clubroot (Finger and Toe)') throw new Error('Unexpected fourth risk: '+name.textContent);
        const from=name.textContent;name.textContent='PIGEONS';
        last.querySelector('[class*="cheatKeyRiskText"]').textContent=text;
        const img=items[0].querySelector('img').cloneNode();img.src='/images/key_risks/bird.png';
        last.querySelector('[class*="cheatKeyRiskIconSlot"]').replaceChildren(img);await img.decode();
        await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
        return {from,to:'PIGEONS',text,scope:'Browser-only restoration of approved proof; existing deduplication defect recorded separately'};
      },pigeonText);
    }
    const snapshot=()=>page.evaluate(()=>({
      text:document.body.innerText,
      rects:[...document.querySelectorAll('[class*="cheatPage_"] *')].map(e=>{const r=e.getBoundingClientRect();return[e.tagName,e.className,...['x','y','width','height'].map(k=>Math.round(r[k]*1000)/1000)];}),
      readiness:document.body.dataset.printReady,
      error:document.body.dataset.printError,
      warnings:JSON.parse(document.body.dataset.printWarnings||'[]'),
      fonts:document.fonts.status,
      missing:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),
      bubbles:[...document.querySelectorAll('[class*="cheatPage2BubbleIcon"]')].map(e=>getComputedStyle(e).backgroundColor),
      pages:[...document.querySelectorAll('[class*="cheatPage_"]')].map(e=>{
        const r=e.getBoundingClientRect(),s=getComputedStyle(e),end=e.lastElementChild.getBoundingClientRect().bottom;
        const b=e.querySelector('[data-align-bottoms]');const cols=[...b.children].filter(c=>/cheatLeft_|cheatRight_/.test(c.className));
        return {unused_bottom_mm:(parseFloat(s.minHeight)-parseFloat(s.paddingBottom)-parseFloat(s.borderBottomWidth)-(end-r.top))*25.4/96,column_bottom_gap_px:Math.abs(cols[0].lastElementChild.getBoundingClientRect().bottom-cols[1].lastElementChild.getBoundingClientRect().bottom)};
      })
    }));
    const before=await snapshot();
    assert.equal(before.error,'');assert.deepEqual(before.warnings,[]);assert.deepEqual(before.missing,[]);
    const replacements=await page.evaluate(async key=>{
      const prefix='/images/icon-pilot/duotone-mockup/';const edits=[];
      const quick=Object.fromEntries(['sow','harvest','germination','depth','row_spacing','plant_spacing','yield','ready_in','protection','water','nutrition'].map(k=>[k,k]));
      const set=(img,name,reason)=>{const old=img.getAttribute('src');img.src=prefix+name+'.svg';edits.push({from:old,to:img.getAttribute('src'),reason});};
      for(const img of document.images) {
        const src=img.getAttribute('src')||'';
        const q=src.match(/^\/images\/quick_facts\/(?:trial\/)?([^/]+)\.png$/);
        const c=src.match(/^\/images\/icons\/(sun|water|nutrition)\.png$/);
        if(q&&quick[q[1]]) set(img,quick[q[1]],'Same meaning, new coloured drawing');
        else if(c) set(img,c[1],'Core Needs family');
      }
      for(const item of document.querySelectorAll('[class*="cheatKeyRiskItem"]')) {
        const label=item.querySelector('[class*="cheatKeyRiskName"]').textContent.trim();
        const img=item.querySelector('img');
        const risk={'cabbage caterpillars':'caterpillar','club root (finger and toe)':'clubroot','frost':'frost','pigeons':'pigeon'}[label.toLowerCase()];
        if(risk&&img) set(img,risk,label); else throw new Error('Unmapped risk: '+label);
      }
      for(const item of document.querySelectorAll('[class*="cheatFinalTipItem"]')) {
        if(item.textContent.startsWith('Check leaf undersides regularly')) set(item.querySelector('img'),'inspection','Explicit leaf-inspection tip only');
      }
      const crop=key==='broccoli'?'broccoli':'cucumber';
      const mask=prefix+crop+'.svg';
      const maskImage=new Image();maskImage.src=mask;await maskImage.decode();
      for(const bubble of document.querySelectorAll('[class*="cheatPage2BubbleIcon"]')) {
        edits.push({from:bubble.style.maskImage,to:mask,reason:'Crop bubble; original category colour'});
        bubble.style.maskImage=`url("${mask}")`;bubble.style.webkitMaskImage=`url("${mask}")`;
      }
      await Promise.all([...document.images].map(i=>i.decode()));
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      document.title=`STYLE D MOCK-UP — ${key} — ${new URL(location.href).searchParams.get('units')}`;
      return edits;
    },key);
    const after=await snapshot();
    assert.deepEqual(after,before,'Icon substitution changed text, layout, colour or readiness');
    assert.ok(after.pages.every(p=>p.unused_bottom_mm>=0&&p.column_bottom_gap_px<=1));
    assert.equal(replacements.length,20);
    assert.deepEqual(await page.locator('[class*=cheatQfIcon], [class*=cheatNeedIcon], [class*=cheatFinalTipIcon], [class*=cheatKeyRiskIcon]').evaluateAll(els=>els.filter(e=>e.tagName==='IMG'&&!e.getAttribute('src').startsWith('/images/icon-pilot/duotone-mockup/')).map(e=>e.src)),[]);
    const pdf=await page.pdf({format:'A4',printBackground:true,scale:1,margin:{top:'18mm',bottom:'20mm',left:'14mm',right:'14mm'}});
    const pages=(pdf.toString('latin1').match(/\/Type\s*\/Page\b/g)||[]).length;assert.equal(pages,2);
    const file=`${out}/${key}-${units}.pdf`;fs.writeFileSync(file,pdf);
    results.push({key,units,file,pages,replacements,approvedProofAdjustment,text_sha256:sha(before.text),layout_sha256:sha(JSON.stringify(before.rects)),pdf_sha256:sha(pdf),text_and_geometry_unchanged:true,fonts:after.fonts,missing:after.missing,warnings:after.warnings,layout:after.pages,bubble_colours:after.bubbles});
    console.log(`${key}/${units}: 2 pages, ${replacements.length} icon placements, text and geometry unchanged`);
  }
} finally { await browser.close(); }
assert.equal(revision(),priorRevision);
for(const [file,hash] of Object.entries(originals)) assert.equal(sha(fs.readFileSync(file)),hash,file);
fs.writeFileSync('docs/icon-pilot/DUOTONE-CHECKS.json',JSON.stringify({status:'pilot_for_review',shared_revision:priorRevision,shared_data_unchanged:true,original_asset_and_approved_proof_hashes:originals,alphaChecks,results},null,2)+'\n');
