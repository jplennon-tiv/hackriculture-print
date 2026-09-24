// One-page visual mockup only. Never writes source records or production mappings.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { revision, readCollection } from '../../../hackriculture-data/lib/records.mjs';

const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const beforeRevision = revision();
const manifest = JSON.parse(fs.readFileSync('docs/icon-pilot/NATURALISTIC-SET-MANIFEST.json'));
assert.equal(beforeRevision, manifest.shared_revision, 'Review changed records before rebuilding this mockup.');
const guarded = new Map();
for (const item of manifest.icons) {
  const p = 'public' + item.png;
  assert.equal(sha(fs.readFileSync(p)), item.sha256);
  guarded.set(p, item.sha256);
}
for (const item of JSON.parse(fs.readFileSync('docs/icon-pilot/MONOCHROME-AUDIT.json')).assets) guarded.set(item.path, item.sha256);
for (const item of JSON.parse(fs.readFileSync('docs/icon-pilot/COLOURED-SET-APPROVAL.json')).icons) {
  for (const ext of ['svg', 'png']) guarded.set(`public/images/coloured-icons/style-a-v1/${item.key}.${ext}`, item[`${ext}_sha256`]);
}
const out = 'output/pdf/naturalistic-icons-mockup';
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 688, height: 979 } });
  await page.goto('http://127.0.0.1:5173/print/vegetable/broccoli?units=metric', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => document.body.dataset.printReady === 'true' || document.body.dataset.printError);
  // Match the approved broccoli proof: its fourth risk was pigeons. Ordinary
  // production currently duplicates Club Root/Clubroot; do not fix that here.
  const pigeonText = readCollection('vegetables').broccoli.troubles.PIGEONS.text.split('. ')[0] + '.';
  const adjustment = await page.evaluate(async text => {
    const items = [...document.querySelectorAll('[class*="cheatKeyRiskItem"]')];
    const last = items.at(-1), name = last.querySelector('[class*="cheatKeyRiskName"]');
    if (name.textContent === 'PIGEONS') return null;
    if (name.textContent !== 'Clubroot (Finger and Toe)') throw new Error('Unexpected fourth risk: ' + name.textContent);
    const from = name.textContent;
    name.textContent = 'PIGEONS';
    last.querySelector('[class*="cheatKeyRiskText"]').textContent = text;
    const img = items[0].querySelector('img').cloneNode();
    img.src = '/images/key_risks/bird.png';
    last.querySelector('[class*="cheatKeyRiskIconSlot"]').replaceChildren(img);
    await img.decode();
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    return { from, to: 'PIGEONS', text, scope: 'Browser-only restoration of the approved proof; production deduplication defect unchanged' };
  }, pigeonText);
  const snapshot = () => page.evaluate(() => ({
    text: document.body.innerText,
    rects: [...document.querySelectorAll('[class*="cheatPage_"] *')].map(e => {
      const r = e.getBoundingClientRect();
      return [e.tagName, e.className, ...['x', 'y', 'width', 'height'].map(k => Math.round(r[k] * 1000) / 1000)];
    }),
    ready: document.body.dataset.printReady,
    error: document.body.dataset.printError || '',
    warnings: JSON.parse(document.body.dataset.printWarnings || '[]'),
    fonts: document.fonts.status,
    missing: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.src),
    pages: document.querySelectorAll('[class*="cheatPage_"]').length,
    unaffectedImages: [...document.images].filter(i => !i.closest('[class*="cheatKeyRiskItem"]')).map(i => i.getAttribute('src')),
    cropBubbles: [...document.querySelectorAll('[class*="cheatPage2BubbleIcon"]')].map(e => [getComputedStyle(e).maskImage, getComputedStyle(e).backgroundColor]),
  }));
  const before = await snapshot();
  assert.equal(before.ready, 'true'); assert.equal(before.error, '');
  assert.deepEqual(before.warnings, []); assert.deepEqual(before.missing, []);
  assert.equal(before.fonts, 'loaded'); assert.equal(before.pages, 2);
  const edits = await page.evaluate(async () => {
    const keys = { 'cabbage caterpillars': 'caterpillar', 'club root (finger and toe)': 'clubroot', 'frost': 'frost', 'pigeons': 'bird' };
    const changes = [];
    for (const item of document.querySelectorAll('[class*="cheatKeyRiskItem"]')) {
      const label = item.querySelector('[class*="cheatKeyRiskName"]').textContent.trim();
      const key = keys[label.toLowerCase()], img = item.querySelector('img');
      if (!key || !img) throw new Error('Unexpected risk: ' + label);
      const asset = '/images/key-risk-icons/naturalistic-v3/' + key + '.png';
      const preload = new Image(); preload.src = asset; await preload.decode();
      const old = img.getAttribute('src');
      img.src = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"></svg>');
      img.style.backgroundColor = '#30352f';
      img.style.mask = `url("${asset}") center / contain no-repeat`;
      img.style.webkitMask = `url("${asset}") center / contain no-repeat`;
      changes.push({ label, key, from: old, mask: asset, ink: '#30352f', preload: [preload.naturalWidth, preload.naturalHeight] });
    }
    await Promise.all([...document.images].map(i => i.decode()));
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    document.title = 'Broccoli — naturalistic Key Risks mockup';
    return changes;
  });
  assert.equal(edits.length, 4);
  const after = await snapshot();
  assert.deepEqual(after, before, 'Artwork substitution must not change content, geometry or unaffected artwork.');
  const pdf = await page.pdf({ format: 'A4', printBackground: true, pageRanges: '1', scale: 1, margin: { top: '18mm', bottom: '20mm', left: '14mm', right: '14mm' } });
  assert.equal((pdf.toString('latin1').match(/\/Type\s*\/Page\b/g) || []).length, 1);
  const file = `${out}/broccoli-metric-page-1.pdf`;
  fs.writeFileSync(file, pdf);
  assert.equal(revision(), beforeRevision);
  for (const [p, hash] of guarded) assert.equal(sha(fs.readFileSync(p)), hash, p);
  fs.writeFileSync('docs/icon-pilot/NATURALISTIC-MOCKUP-CHECKS.json', JSON.stringify({
    status: 'exported_visual_review_pending', crop: 'broccoli', units: 'metric', paper: 'A4', page: 1,
    file, pdf_sha256: sha(pdf), edits, approved_proof_adjustment: adjustment,
    text_and_geometry_unchanged_after_icon_substitution: true,
    fonts: after.fonts, missing_images: after.missing, warnings: after.warnings,
    unaffected_artwork_unchanged: true, shared_revision_unchanged: beforeRevision,
    guarded_files_unchanged: guarded.size, production_installed: false,
  }, null, 2) + '\n');
  console.log('One A4 metric broccoli page; four naturalistic risk icons; unchanged dimensions and layout.');
} finally { await browser.close(); }
