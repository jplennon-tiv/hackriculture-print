const fs = require('fs'), path = require('path'), crypto = require('crypto');
const root = path.resolve(__dirname, '../../../../..');
const sharp = require(path.join(root, 'node_modules/sharp'));
const rel = p => path.relative(root, p);
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const json = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (name, data) => fs.writeFileSync(path.join(__dirname, name), JSON.stringify(data, null, 2) + '\n');
const xml = s => s.replaceAll('&', '&amp;').replaceAll('<', '&lt;');

async function main() {
  const opening = path.dirname(__dirname), entries = [];
  const originals = json(path.join(opening, 'THUMBNAILS.json'));
  const prior = json(path.join(opening, 'page-9-thumbnail-review/SELECTION.json'));
  const thumbDir = path.join(__dirname, 'thumbnails');
  fs.mkdirSync(thumbDir, { recursive: true });
  const current = [
    ['roots', 'Carrot and beetroot'], ['peas', 'Peas'], ['beans', 'Broad beans'],
    ['squash', 'Squash'], ['colander', 'Salad harvest'], ['peppers', 'Pepper harvest']
  ];
  for (const [key, title] of current) {
    const source = path.join(opening, 'thumbnails', key + '.jpg');
    const record = originals[key];
    if (hash(source) !== record.thumbnailSHA256 || hash(path.join(root, record.source)) !== record.sourceSHA256) throw Error('Camera source mismatch: ' + key);
    const m = await sharp(source).metadata(), side = Math.min(m.width, m.height);
    const crop = { left: Math.floor((m.width - side) / 2), top: Math.floor((m.height - side) / 2), width: side, height: side };
    const number = entries.length + 1, file = path.join(thumbDir, String(number).padStart(2, '0') + '-' + key + '.png');
    await sharp(source).extract(crop).png().toFile(file);
    entries.push({ number, title, file: rel(file), sha256: hash(file), group: 'Current proof', status: 'Existing contents proposal photograph; spread approval pending', kind: 'Camera photograph', source: rel(source), sourceSHA256: hash(source), originalCamera: record.source, originalCameraSHA256: record.sourceSHA256, crop, nativePixels: [side, side] });
  }
  for (const priorNumber of [5, 11, 16]) {
    const record = prior.entries.find(e => e.number === priorNumber), source = path.join(root, record.file);
    if (hash(source) !== record.sha256) throw Error('Earlier favourite mismatch: ' + priorNumber);
    const number = entries.length + 1, file = path.join(thumbDir, String(number).padStart(2, '0') + '-' + record.title.toLowerCase() + '.png');
    fs.copyFileSync(source, file);
    const m = await sharp(file).metadata();
    entries.push({ number, title: record.title, file: rel(file), sha256: hash(file), group: 'Earlier favourite', status: 'Selected by John for the earlier pool; unused on approved page 9; contents placement pending', kind: 'Generated photographic study; not camera evidence', source: record.file, sourceSHA256: record.sha256, previousContactSheetNumber: priorNumber, selectionRecord: rel(path.join(opening, 'page-9-thumbnail-review/SELECTION.json')), crop: 'Exact original tile bytes copied; proportional square fit for display only', nativePixels: [m.width, m.height] });
  }
  const master = path.join(root, 'generated_images/exec-334e1c80-f1d4-437c-9628-88418eef44fb.png');
  const m = await sharp(master).metadata();
  if (m.width !== 1774 || m.height !== 887) throw Error('Unexpected generation dimensions');
  const newTitles = ['Ripening tomatoes', 'Rainbow chard', 'Radishes', 'Aubergine', 'Runner beans', 'Cauliflower', 'Red cabbage'];
  for (let i = 0; i < newTitles.length; i++) {
    const col = i % 4, row = Math.floor(i / 4);
    const left = Math.round(col * m.width / 4) + 2, right = Math.round((col + 1) * m.width / 4) - 2;
    const top = Math.round(row * m.height / 2) + 2, bottom = Math.round((row + 1) * m.height / 2) - 2;
    const crop = { left, top, width: right - left, height: bottom - top };
    const number = entries.length + 1, title = newTitles[i];
    const file = path.join(thumbDir, String(number).padStart(2, '0') + '-' + title.toLowerCase().replaceAll(' ', '-') + '.png');
    await sharp(master).extract(crop).png().toFile(file);
    entries.push({ number, title, file: rel(file), sha256: hash(file), group: 'New choice', status: 'Proposal awaiting John’s selection', kind: 'Generated photographic study; not camera evidence', source: rel(master), sourceSHA256: hash(master), generationCell: i + 1, crop, nativePixels: [crop.width, crop.height] });
  }
  const width = 1800, height = 2310, tile = 402, gap = 24, margin = 60, top = 210, rowPitch = 500;
  const layers = [];
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><style>text{font-family:Arial,Helvetica,sans-serif;fill:#173e2c}.title{font-size:52px;font-weight:700}.sub{font-size:27px}.legend{font-size:25px}.number{font-size:31px;font-weight:700}.label{font-size:26px;font-weight:600}.status{font-size:23px}</style><text x="60" y="80" class="title">Contents · Thumbnail choices</text><text x="60" y="132" class="sub">Pages 4–5 · Choose by number</text><text x="60" y="174" class="legend">01–06 Current proof · 07–09 Earlier favourites · 10–16 New choices</text>`;
  for (const e of entries) {
    const x = margin + ((e.number - 1) % 4) * (tile + gap), y = top + Math.floor((e.number - 1) / 4) * rowPitch;
    layers.push({ input: await sharp(path.join(root, e.file)).resize(tile, tile, { fit: 'cover', position: 'centre' }).png().toBuffer(), left: x, top: y });
    svg += `<rect x="${x}" y="${y + tile}" width="${tile}" height="78" fill="#ede5cf"/><text x="${x + 13}" y="${y + tile + 34}" class="number">${String(e.number).padStart(2, '0')}</text><text x="${x + 70}" y="${y + tile + 33}" class="label">${xml(e.title)}</text><text x="${x + 70}" y="${y + tile + 63}" class="status">${e.group}</text>`;
  }
  svg += '<text x="60" y="2254" class="legend">01–06 Camera photographs · 07–16 Generated photographic studies</text></svg>';
  layers.push({ input: Buffer.from(svg), left: 0, top: 0 });
  const sheet = path.join(__dirname, 'Vegetable-Guru-Contents-Thumbnail-Choices.png');
  await sharp({ create: { width, height, channels: 3, background: '#fff8e9' } }).composite(layers).png().toFile(sheet);
  await sharp(sheet).resize(1100).jpeg({ quality: 92 }).toFile(path.join(__dirname, 'contact-sheet-preview.jpg'));
  const small = await Promise.all(entries.map(async e => ({ input: await sharp(path.join(root, e.file)).resize(126, 126, { fit: 'cover' }).png().toBuffer(), left: ((e.number - 1) % 8) * 142 + 8, top: Math.floor((e.number - 1) / 8) * 142 + 8 })));
  await sharp({ create: { width: 1136, height: 284, channels: 3, background: '#fff8e9' } }).composite(small).png().toFile(path.join(__dirname, 'thumbnail-size-check.png'));
  const references = json(path.join(__dirname, 'REFERENCES.json'));
  for (const r of references) if (hash(path.join(root, r.file)) !== r.sha256) throw Error('Generation reference mismatch');
  write('GENERATION.json', { date: '2026-11-22', master: rel(master), masterSHA256: hash(master), dimensions: [m.width, m.height], prompt: fs.readFileSync(path.join(__dirname, 'PROMPT.txt'), 'utf8').trim(), references, method: 'Seven new photographic studies in a four-by-two source grid; final blank cell excluded; two-pixel seam inset; precise labels composed separately.' });
  write('THUMBNAILS.json', { date: '2026-11-22', folios: [4, 5], status: 'Contact sheet awaiting John’s picture selection; current contents proof and installed book unchanged', contactSheet: { file: rel(sheet), sha256: hash(sheet), width, height }, entries, checks: { sequence: entries.map(e => e.number), sourceCounts: { currentCameraPictures: 6, earlierUnusedFavourites: 3, newGeneratedChoices: 7 }, originalHashesVerified: true, existingFavouritesCopiedByteForByte: true, finalBlankGenerationCellExcluded: true, display: 'Proportional square crops; native pixel dimensions recorded individually. Enlarging for contact-sheet display does not add detail.', smallSizePreview: rel(path.join(__dirname, 'thumbnail-size-check.png')) } });
  console.log(JSON.stringify({ sheet, entries: entries.length, bytes: fs.statSync(sheet).size }));
}
main().catch(e => { console.error(e); process.exit(1); });
