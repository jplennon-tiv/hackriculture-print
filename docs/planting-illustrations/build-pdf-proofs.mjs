// Review-only browser transformation. Does not modify the app or shared data.
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const root = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(root, '../..');
const output = path.join(project, 'output/pdf/planting-proofs');
await fs.mkdir(output, { recursive: true });
const sourceBytes = await fs.readFile(path.resolve(project, '../hackriculture-data/vegetables.json'));
const master = JSON.parse(sourceBytes);
const masterHash = createHash('sha256').update(sourceBytes).digest('hex');
const crops = ['beetroot', 'carrot', 'potato', 'leek', 'chicory'];
const jobs = [];
for (const file of (await fs.readdir(root)).filter(f => /^BATCH-\d+\.json$/.test(f)).sort()) {
  const batch = JSON.parse(await fs.readFile(path.join(root, file)));
  jobs.push(...batch.jobs, ...(batch.reuse ?? []));
}
const artwork = {};
for (const crop of crops) {
  artwork[crop] = await Promise.all(jobs.filter(j => j.crop === crop).sort((a,b) => (a.stage ?? Number(a.id.slice(0,2))) - (b.stage ?? Number(b.id.slice(0,2)))).map(async j => ({
    title: j.title, alt: j.alt, file: j.preferredFile ?? j.file,
    src: `data:image/png;base64,${(await fs.readFile(path.join(root, j.preferredFile ?? j.file))).toString('base64')}`,
  })));
  assert(artwork[crop].length >= 2);
}
const browser = await chromium.launch();
const results = [];
try {
  const page = await browser.newPage({ viewport: { width: 688, height: 979 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const crop of crops) for (const units of ['metric', 'imperial']) {
    await page.goto(`http://127.0.0.1:5173/print/vegetable/${crop}?units=${units}`, {waitUntil:'networkidle'});
    await page.waitForFunction(() => document.body.dataset.printReady === 'true');
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode())); });
    await page.addStyleTag({path:path.join(root,'pdf-proofs.css')});
    const original = await page.locator('[class*="cheatPage_"]').nth(1).innerHTML();
    const originalStyle = await page.locator('[class*="cheatPage_"]').nth(1).getAttribute('style');
    for (const variant of ['baseline', 'column', 'wide']) {
      await page.locator('[class*="cheatPage_"]').nth(1).evaluate((el, {original, originalStyle}) => { el.innerHTML = original; el.setAttribute('style', originalStyle); el.classList.remove('proof-page'); }, {original,originalStyle});
      const record = await page.evaluate(async ({crop, units, variant, sowing, images}) => {
        const { resolveMeasurement } = await import('/src/lib/measure.ts');
        const p = document.querySelectorAll('[class*="cheatPage_"]')[1];
        const find = key => p.querySelector(`[class*="${key}_"]`);
        const card = [...p.querySelectorAll('[class*="cheatCard_"]')].find(e => e.querySelector('[class*="cheatCardHd_"]')?.textContent.trim() === 'SOWING & PLANTING');
        const body = find('cheatBody'), left = find('cheatLeft'), right = find('cheatRight'), tips = find('cheatFinalTips');
        const rightCards=[...right.children];
        const originalRightCards=rightCards.map(c=>c.innerText);
        const before = {planting:card.innerText, right:right.innerText, soil:left.firstElementChild.innerText, tips:tips.innerText, method:card.querySelector('[class*="cheatSowMethod_"]')?.textContent, notes:[...card.querySelectorAll('[class*="cheatStepTxt_"]')].map(e=>e.textContent)};
        const h = el => el.getBoundingClientRect().height;
        const baseHeights = {header:h(find('cheatPage2Hd')), body:h(body), left:h(left), right:h(right), sowing:h(card), tips:h(tips)};
        const record = {crop,units,variant,before,baseHeights,changes:[],added:[],sourceNotes:(sowing.notes??[]).map((n,i)=>({source:`${crop}.sowing_and_planting.notes[${i}]`,text:typeof n==='string'?n:n.text,short_text:n.short_text,baselineVisible:before.notes.includes(n.short_text??n.text??n)}))};
        const measure = key => resolveMeasurement(sowing[key], units);
        const el = (tag, cls, text) => {const n=document.createElement(tag);n.className=cls;if(text)n.textContent=text;return n;};
        if (variant !== 'baseline') {
          p.classList.add('proof-page');
          const methods = {
            beetroot:['Sow seed clusters thinly in rows. Cover with soil and keep the seedbed evenly moist.','Thin direct-sown seedlings early; retain individual plants.'],
            carrot:['Sow direct, very thinly, in shallow drills.','Cover lightly with fine soil or compost.','Thin young seedlings to the final spacing below.'],
            potato:['Place seed potatoes at the trench base with sprouts upwards.','Cover gently without damaging the sprouts, and water well.'],
            leek:['Make a dibbed hole for each transplant.','Lower a pencil-thick seedling into each hole.','Water in rather than filling the hole with dry soil.'],
            chicory:['Sow thinly in drills and cover lightly with soil.','Thin young plants for the chosen type.'],
          };
          const extras = {
            beetroot:'Alternative: raise early crops in modules and plant out as small clumps. Keep module clumps intact; individual-plant spacing below describes direct sowing.',
            carrot:'',
            potato:'Individual holes are an alternative. For no-dig, shallow-plant under a thick light-excluding mulch. Chitting is most useful for early crops.',
            leek:'Start: sow thinly in a seed bed or modules; grow on to pencil thickness before transplanting.',
            chicory:'Salad leaves: sow successionally through spring and summer. Forcing roots: sow around June to make strong roots for lifting after frost.',
          };
          const details = {
            beetroot:[['Seed depth',measure('sowing_depth')],['Rows',measure('row_spacing')],['Individual plants',measure('plant_spacing')]],
            carrot:[['Seed depth',measure('sowing_depth')],['Rows',measure('row_spacing')],['Final plants',measure('plant_spacing')]],
            potato:[['Trench depth',measure('sowing_depth')],['Plants',measure('plant_spacing')],['First-early rows',resolveMeasurement(sowing.row_spacing?.first_early_varieties,units)],['Maincrop rows',resolveMeasurement(sowing.row_spacing?.maincrop_varieties,units)]],
            leek:[['Seed depth',measure('sowing_depth')],['Transplant hole',measure('planting_depth')],['Rows',measure('row_spacing')],['Plants',measure('plant_spacing')]],
            chicory:[['Seed depth',measure('sowing_depth')],['Rows',measure('row_spacing')],['Final plants',measure('plant_spacing')]],
          };
          const head=card.firstElementChild.cloneNode(true);
          card.replaceChildren(head); card.classList.add('proof-planting', `proof-${variant}`);
          const stages=el('div','proof-stages');
          const shownImages=variant==='column'&&crop==='leek'?images.slice(1):images;
          shownImages.forEach((img,i)=>{
            const originalIndex=images.indexOf(img);
            const step=el('section','proof-stage');
            const title=el('h3','proof-stage-title');title.append(el('span','proof-number',String(i+1)),document.createTextNode(img.title));
            const picture=el('img','proof-art');picture.src=img.src;picture.alt=img.alt;picture.width=1774;picture.height=887;
            const caption=variant==='column'&&crop==='leek'&&i===0?'Make a dibbed hole and lower a pencil-thick seedling into it.':methods[crop][originalIndex];
            step.append(title,picture,el('p','proof-caption',caption));stages.append(step);
          });
          card.append(stages);
          const lower=el('div','proof-lower');
          const sizes=el('dl','proof-measures');
          for (const [label,value] of details[crop]) if(value) {
            const pair=el('div','proof-measure');pair.append(el('dt','',`${label}: `),el('dd','',value));sizes.append(pair);
          }
          const supporting=el('div','proof-support');
          if(extras[crop]) supporting.append(el('p','proof-alternative',extras[crop]));
          if(before.notes.length) {
            const list=el('ul','proof-notes');for(const text of before.notes)list.append(el('li','',text));supporting.append(list);
          }
          lower.append(sizes,supporting);card.append(lower);
          if (variant === 'wide') {
            body.classList.add('proof-rebalanced');
            left.append(...rightCards.slice(0,crop==='chicory'?1:2));
            if(crop==='chicory')body.classList.add('proof-chicory-balance');
            left.append(tips); tips.classList.add('proof-compact-tips');
            const tipTexts=[...tips.querySelectorAll('[class*="cheatFinalTipText_"]')].map(e=>e.textContent);
            if(!tipTexts.every(t=>rightCards[0].textContent.includes(t)))throw new Error('Cannot condense tips: advice not retained in care');
            const labels={beetroot:['Thin early','Keep clumps intact','Weed carefully'],carrot:['Thin carefully','Avoid root disturbance','Water evenly'],potato:['Protect from frost','Keep tubers covered','Choose suitable mulch'],leek:['Weed and water','Let holes fill naturally','Earth up with care'],chicory:['Weed and water','Thin for the type','Lift after frost','Force in batches']};
            const strip=el('div','proof-tip-labels');
            labels[crop].forEach(t=>strip.append(el('span','',t)));
            tips.querySelector('[class*="cheatFinalTipsGrid_"]').replaceWith(strip);
            record.changes.push({source:'Final Tips repeated advice',disposition:'condensed to reminder labels; every original tip retained verbatim in Looking After the Crop',before:tipTexts,after:labels[crop]});
            body.after(card);
          }
          if(variant==='column'&&['leek','chicory'].includes(crop))card.style.setProperty('--art-height','14mm');
          if(variant==='column'&&crop==='chicory')card.classList.add('proof-paired-small');
          if(variant==='column'&&crop==='leek')record.changes.push({source:'art sequence',disposition:'two-image fallback; hole-making combined into the lowering caption, water-in remains distinct'});
          record.changes.push({source:'visible method',disposition:'represented in step captions and alternative/start text',before:before.method,after:[...methods[crop],extras[crop]].filter(Boolean)});
          record.changes.push({source:'visible planting notes',disposition:'retained verbatim as supporting bullets',items:before.notes});
          record.changes.push({source:'measurement chips',disposition:'retained with explicit stage/variety labels',items:details[crop]});
          if(crop==='potato')record.added.push('Restored master maincrop row spacing and the no-dig/chitting sentences already omitted by baseline fitter. No numerical row spacing inferred for second earlies.');
          if(crop==='leek')record.added.push('Master transplant-hole depth added separately from nursery seed depth.');
          if(crop==='beetroot')record.added.push('Individual versus intact module-clump route qualification made explicit; early thinning sourced from master notes.');
          await Promise.all([...card.querySelectorAll('img')].map(i=>i.decode()));
        }
        record.after={right:right.innerText,soil:left.firstElementChild.innerText,tips:tips.innerText,planting:card.innerText};
        record.unchangedOtherContent=rightCards.every((c,i)=>c.innerText===originalRightCards[i])&&before.soil===record.after.soil&&(variant==='wide'||before.tips===record.after.tips);
        record.sowingHeight=h(card);
        record.contentBottom=p.lastElementChild.getBoundingClientRect().bottom-p.getBoundingClientRect().top;
        record.fontsReady=document.fonts.status==='loaded';
        record.brokenImages=[...document.images].filter(i=>!i.complete||i.naturalWidth===0).length;
        record.imageFiles=images.map(i=>i.file);
        return record;
      }, {crop,units,variant,sowing:master[crop].sowing_and_planting,images:artwork[crop]});
      if(variant !== 'baseline') {
        assert(record.unchangedOtherContent, 'Non-planting content changed');
        assert.equal(record.brokenImages,0);
        assert(record.contentBottom<=958, `${crop}/${units}/${variant} exceeds safe page budget: ${record.contentBottom}`);
      }
      const name=`${crop}-${units}-${variant}`;
      await page.pdf({path:path.join(output,`${name}.pdf`),format:'A4',printBackground:true,scale:1,margin:{top:'18mm',bottom:'20mm',left:'14mm',right:'14mm'}});
      await page.locator('[class*="cheatPage_"]').nth(1).screenshot({path:path.join(output,`${name}.png`)});
      results.push(record);
      await fs.writeFile(path.join(output,'content-audit.json'),JSON.stringify({masterHash,results},null,2));
      console.log(name,JSON.stringify({height:Math.round(record.contentBottom),card:Math.round(record.sowingHeight),unchanged:record.unchangedOtherContent}));
    }
  }
  assert.deepEqual(errors,[]);
} finally { await browser.close(); }
