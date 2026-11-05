import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
import {reviseCarrot, alignCarrotSoil} from '../src/print/book/sowing-planting-mockups/carrot-revision.mjs';
import {reviseLeek} from '../src/print/book/sowing-planting-mockups/leek-revision.mjs';
import {reviseRemaining, levelPlantingPictures} from '../src/print/book/sowing-planting-mockups/final-three.mjs';
import {assembleRevision, measurePracticalLayout} from '../src/print/book/sowing-planting-mockups/assemble-revision.mjs';
import {measureMockup} from '../src/print/book/sowing-planting-mockups/layout.mjs';

const crop = process.argv[2] || 'carrot';
const remainingThree = ['beetroot','tomato_outdoor','potato'].includes(crop);
if (!remainingThree && !['leek','carrot'].includes(crop)) throw Error('Unknown crop');
const base = 'docs/publication/sowing-planting-mockups';
const dir = base + '/' + crop + '-revision';
const out = 'output/pdf/sowing-planting-mockups/' + crop + '-revision';
if (await fs.access(dir+'/APPROVAL.json').then(()=>true,()=>false)) throw Error('Approved proof. Use a separate revision for new edits.');
await fs.mkdir(dir, {recursive:true});
await fs.mkdir(out, {recursive:true});
const previous = JSON.parse(await fs.readFile(base + '/conventional/CHECKS.json'));
const sha = async path => createHash('sha256').update(await fs.readFile(path)).digest('hex');
const style = `
  .sowing-review .sheet.recto > header {height:29mm!important}
  .sowing-review .sheet.recto .mock-category {top:5.5mm}
  .sowing-review .sheet.recto .mock-title {top:12mm}
  .sowing-review .recto .pests {margin-top:3mm!important}
  .sowing-review .recto .tips {margin-top:3mm!important}
  .sowing-review .recto footer nav {white-space:nowrap;font:800 7.5pt/1.3 'Nunito Sans';letter-spacing:0}
  .sowing-review .recto footer nav a {color:var(--deep);text-decoration:none}
  .calendar .planting-time span.extra {background:#6b9069}
  .front .fact-column article img[src$="season_winter.png"] {mix-blend-mode:multiply}
`;
const bookDir = 'docs/publication/whole-book-order-preview';
const map = JSON.parse(await fs.readFile(bookDir + '/PAGE-MAP.json'));
const folios = map.filter(p => p.key === crop && p.kind === 'vegetable').map(p => p.folio);
if (folios.length !== 2) throw Error('Expected a facing crop pair in the current book');
const navigation = JSON.parse(await fs.readFile(bookDir + '/NAVIGATION.json'));
const links = navigation.pages.find(p => p.folio === folios[1]).links.map(link => {
  const target = map.find(p => p.folio === link.target);
  const href = '../../../../output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf#page=' + target.pdfPage;
  return {text:link.text, folio:link.target, pdfPage:target.pdfPage, href};
});
const browser = await chromium.launch();
const units = ['imperial', 'metric'];
const pages = new Map();
const byUnit = {};
const sources = {};
const footprints = {};
const fixed = ['.remember','.varieties','.needs','.key-risks','.tips'];
if (!remainingThree) fixed.push('.harvest');
if (crop !== 'tomato_outdoor') fixed.push('.intro','.soil');
const snapshot = selectors => Object.fromEntries(selectors.map(s => [s, document.querySelector(s).innerText]));
async function ready(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(img => img.decode()));
  });
}
try {
  for (const unit of units) {
    const src = base + '/conventional/' + crop + '-' + unit + '.html';
    sources[src] = await sha(src);
    const page = await browser.newPage({viewport:{width:1100,height:1200}});
    pages.set(unit, page);
    // Saved proofs are static documents. Their former development scripts
    // refer to transient modules and have no role in a print render.
    const sourceUrl = 'http://127.0.0.1:5173/' + src;
    const html = (await fs.readFile(src, 'utf8')).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
    await page.route(sourceUrl, route => route.fulfill({contentType:'text/html', body:html}));
    await page.goto(sourceUrl, {waitUntil:'networkidle'});
    await page.emulateMedia({media:'print'});
    await ready(page);
    footprints[unit] = await page.evaluate(snapshot, fixed);
    await page.addStyleTag({content:style});
    await page.evaluate(remainingThree ? reviseRemaining : crop === 'leek' ? reviseLeek : reviseCarrot, {unit,crop});
    await page.evaluate(assembleRevision, {folios,links});
    await ready(page);
  }

  const rows = () => Array.from(document.querySelectorAll('.pests tbody tr'), r => r.innerText);
  const sourceRows = Object.fromEntries(await Promise.all(units.map(async u => [u, await pages.get(u).evaluate(rows)])));
  const attempts = [];
  let layout = null;
  const omitted = [];
  while (true) {
    if (crop !== 'carrot') {
      // Keep the full table throughout the copy and layout pass. Revisit layout
      // after each bottom cut only if every arrangement falls below 3 mm.
      const probe = async spec => Math.min(...await Promise.all(units.map(u => pages.get(u).evaluate(measurePracticalLayout,spec))));
      const twoColumns = crop === 'tomato_outdoor';
      const initial = {name:'standard',width:50,problem:twoColumns?50:24,signs:twoColumns?50:26};
      const tableTests = [];
      for (let problem=twoColumns?40:16; problem<=(twoColumns?58:26); problem+=2) {
        for (const signs of twoColumns ? [100-problem] : [25,27,29,31,33,35,37,39]) {
          const spec = {...initial,problem,signs};
          tableTests.push({...spec, gap:await probe(spec)});
        }
      }
      tableTests.push({...initial,gap:await probe(initial)});
      const deviation = t => Math.abs(t.problem-initial.problem) + Math.abs(t.signs-initial.signs);
      tableTests.sort((a,b) => b.gap-a.gap || deviation(a)-deviation(b));
      const candidates = [];
      for (const name of ['standard','soil above','planting beside care']) {
        for (let width=37; width<=63; width++) {
          const spec = {...tableTests[0],name,width};
          candidates.push({...spec,gap:await probe(spec)});
        }
      }
      const score = c => Math.abs(c.width-50)/4 + (c.name==='standard'?0:c.name==='soil above'?4:7);
      const fits = candidates.filter(c => c.gap>=3);
      layout = fits.length ? fits.sort((a,b) => score(a)-score(b) || b.gap-a.gap)[0] : candidates.sort((a,b) => b.gap-a.gap)[0];
      // Use the closest-to-original readable table proportions that still fit.
      for (const table of tableTests.sort((a,b) => deviation(a)-deviation(b))) {
        const spec = {...layout,problem:table.problem,signs:table.signs};
        const gap = await probe(spec);
        if (gap>=3) { layout = {...spec,gap}; break; }
      }
      await probe(layout);
    }
    const gaps = await Promise.all(units.map(async unit => {
      const measured = await pages.get(unit).evaluate(measureMockup);
      return measured.pages[1].footerGapMm;
    }));
    attempts.push({rows:sourceRows.imperial.length - omitted.length, gaps, layout});
    if (Math.min(...gaps) >= 3) break;
    if (omitted.length >= sourceRows.imperial.length - 1) throw Error('Further editorial review needed');
    const labels = await Promise.all(units.map(unit => pages.get(unit).evaluate(() => {
      const row = document.querySelector('.pests tbody tr:last-child');
      const label = row.querySelector('th,strong').textContent;
      row.remove();
      return label;
    })));
    if (labels[0] !== labels[1]) throw Error('Inconsistent table order');
    omitted.push(labels[0]);
  }
  for (const unit of units) {
    const page = pages.get(unit);
    const soilOffsetsMm = crop === 'carrot' ? await page.evaluate(alignCarrotSoil) : remainingThree ? await page.evaluate(levelPlantingPictures,crop) : undefined;
    const remaining = await page.evaluate(rows);
    if (JSON.stringify(remaining) !== JSON.stringify(sourceRows[unit].slice(0,remaining.length))) throw Error('Pest row order or content changed');
    const m = await page.evaluate(measureMockup);
    if (m.pages.length !== 2 || m.pages.some(p => p.footerGapMm < 3) || !m.fontsReady || m.images.some(x => !x.loaded)) throw Error('Incomplete spread');
    if (m.methodFonts.some(x => x.sizePt !== 9) || /\bsow direct\b|\bDIRECT\b|Thin only where needed/i.test(m.text.join('\n'))) throw Error('Unexpected planting label or type');
    const after = await page.evaluate(snapshot, fixed);
    if (fixed.some(s => after[s] !== footprints[unit][s])) throw Error('Unexpected change outside revised advice');
    const old = previous.records.find(r => r.key === crop && r.unit === unit);
    if (old.originalPlantingImages.some(a => !m.images.some(i => i.src === a.src))) throw Error('Missing planting illustration');
    const details = await page.evaluate(crop => ({
      care: document.querySelector('.care li').textContent,
      methods:[...document.querySelectorAll('.sowing-method')].map(s => ({title:s.querySelector('h3').textContent, text:s.querySelector('p').textContent})),
      extended:crop === 'carrot' ? document.querySelector('img[src$="season_winter.png"]').parentElement.querySelector('p').textContent : undefined,
      transplantFact:crop === 'leek' ? document.querySelector('.quick img[src$="/planting.svg"]').parentElement.innerText : undefined,
      columnWidths:[...document.querySelector('.growing-columns').children].map(e => +(e.getBoundingClientRect().width*25.4/96).toFixed(1))
    }),crop);
    const geometry = await page.evaluate(() => {
      const sheet = document.querySelector('.recto');
      const origin = sheet.getBoundingClientRect();
      const box = (el, relativeTo = origin) => {
        const r = el.getBoundingClientRect();
        return [r.left-relativeTo.left, r.top-relativeTo.top, r.right-relativeTo.left, r.bottom-relativeTo.top].map(v => v * .75);
      };
      for (const calendarLabel of document.querySelectorAll('.calendar .month-row b')) {
        const ink = document.createRange();
        ink.selectNodeContents(calendarLabel);
        if (ink.getBoundingClientRect().right > calendarLabel.nextElementSibling.getBoundingClientRect().left-1) throw Error('Calendar label overlaps first month');
      }
      const linksPt = [...sheet.querySelectorAll('footer nav a')].map(e => box(e));
      const areaPt = box(sheet.querySelector('.growing-columns'));
      const headerGap = (box(sheet.querySelector('.remember'))[1]-box(sheet.querySelector('.mock-title h1'))[3])*25.4/72;
      const labelGap = (box(sheet.querySelector('.mock-title h1'))[1]-box(sheet.querySelector('.mock-category'))[3])*25.4/72;
      const footer = [...sheet.querySelector('footer').children].map(e => box(e));
      if (footer.some((r,i) => i>0 && r[0] < footer[i-1][2]+3) || headerGap < 3 || labelGap < 2) throw Error('Insufficient title or footer clearance');
      const newFacts = [...document.querySelectorAll('.fact-grid article')].filter(e => ['Later sowings','Plant out','Chit','Plant tubers','Trench depth'].includes(e.querySelector('h3').textContent)).map(e=>({text:e.innerText,box:box(e,document.querySelector('.front').getBoundingClientRect()),icon:e.querySelector('img')?.getAttribute('src')}));
      const tableCells = [...sheet.querySelectorAll('.pests td,.pests tbody th')].map(e=>({text:e.innerText,box:box(e)}));
      const calendarBands = [...document.querySelectorAll('.calendar .month-row b')].map(e=>e.textContent).filter(Boolean);
      return {linksPt,areaPt,newFacts,tableCells,calendarBands,headerGapMm:+headerGap.toFixed(1),labelGapMm:+labelGap.toFixed(1)};
    });
    const pdf = out + '/' + crop + '-' + unit + '.pdf';
    await page.pdf({path:pdf, preferCSSPageSize:true, printBackground:true});
    await fs.writeFile(dir + '/' + crop + '-' + unit + '.html', await page.content());
    byUnit[unit] = {source:base + '/conventional/' + crop + '-' + unit + '.html', pdf, ...details, geometry, soilOffsetsMm, plantingWords:details.methods.map(x => x.text).join(' ').split(/\s+/).length, pages:m.pages, images:m.images.length};
    console.log(unit, omitted, attempts, geometry.headerGapMm, byUnit[unit].columnWidths, m.pages.map(p => p.footerGapMm));
  }
  await fs.writeFile(dir + '/CHECKS.json', JSON.stringify({crop,sources,folios,links,attempts,omitted,byUnit},null,2)+'\n');
} finally {
  await browser.close();
}
