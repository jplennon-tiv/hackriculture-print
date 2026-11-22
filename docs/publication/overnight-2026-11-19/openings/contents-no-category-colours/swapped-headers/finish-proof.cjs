const fs = require('fs'), path = require('path'), crypto = require('crypto');
const root = path.resolve(__dirname, '../../../../../..'), sharp = require(path.join(root, 'node_modules/sharp'));
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
async function main() {
  const old = path.join(__dirname, '../selected-thumbnails'), previous = read(path.join(old, 'CHECKS.json')), current = read(path.join(__dirname, 'CHECKS.json'));
  if (JSON.stringify(previous.entries) !== JSON.stringify(current.entries)) throw Error('Text geometry changed');
  if (hash(path.join(old, 'CONTENTS.json')) !== hash(path.join(__dirname, 'CONTENTS.json'))) throw Error('Contents changed');
  const comparisons = [];
  for (const folio of [4, 5]) {
    const name = 'page-' + folio + '.png';
    const a = await sharp(path.join(old, name)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const b = await sharp(path.join(__dirname, name)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    if (a.info.width !== b.info.width || a.info.height !== b.info.height) throw Error('Render size changed');
    const scale = 2.5 * 72 / 25.4;
    const boxes = [...previous.thumbnailPlacements, ...current.thumbnailPlacements].filter(p => p.folio === folio && p.yMM < 49).map(p => ({ x0: Math.floor(p.xMM * scale) - 3, y0: Math.floor(p.yMM * scale) - 3, x1: Math.ceil((p.xMM + p.sizeMM) * scale) + 3, y1: Math.ceil((p.yMM + p.sizeMM) * scale) + 3 }));
    let differingPixelsOutsideArtwork = 0, checkedPixels = 0;
    for (let y = 0; y < a.info.height; y++) for (let x = 0; x < a.info.width; x++) {
      if (boxes.some(r => x >= r.x0 && x < r.x1 && y >= r.y0 && y < r.y1)) continue;
      const i = (y * a.info.width + x) * a.info.channels;
      checkedPixels++;
      if (a.data[i] !== b.data[i] || a.data[i + 1] !== b.data[i + 1] || a.data[i + 2] !== b.data[i + 2]) differingPixelsOutsideArtwork++;
    }
    if (differingPixelsOutsideArtwork) throw Error('Pixels changed outside artwork: ' + folio + ': ' + differingPixelsOutsideArtwork);
    comparisons.push({ folio, checkedPixels, differingPixelsOutsideArtwork, excluded: 'Union of old and new header-picture bounds, padded by three render pixels for antialiasing' });
    await sharp(path.join(__dirname, name)).resize(850).jpeg({ quality: 94 }).toFile(path.join(__dirname, 'page-' + folio + '-preview.jpg'));
  }
  const pageMeta = await sharp(path.join(__dirname, 'page-4.png')).metadata();
  const spread = await sharp({ create: { width: pageMeta.width * 2 + 16, height: pageMeta.height, channels: 3, background: '#e2dfd0' } }).composite([
    { input: path.join(__dirname, 'page-4.png'), left: 0, top: 0 },
    { input: path.join(__dirname, 'page-5.png'), left: pageMeta.width + 16, top: 0 }
  ]).png().toBuffer();
  await sharp(spread).resize(1600).jpeg({ quality: 94 }).toFile(path.join(__dirname, 'contents-spread.jpg'));
  const proof = path.join(root, 'output/pdf/contents-no-category-colours/swapped-headers/Vegetable-Guru-Contents-No-Category-Colours.pdf');
  const result = { date: '2026-11-22', comparisons, contentsCopyIdentical: true, all84TextRowGeometriesIdentical: true, pictureCount: current.thumbnailPlacements.length, selectedPicturesUsed: current.thumbnailPlacements.map(p => p.number).sort((a, b) => a - b), proof: path.relative(root, proof), proofSHA256: hash(proof) };
  fs.writeFileSync(path.join(__dirname, 'RASTER-CHECK.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
}
main().catch(e => { console.error(e); process.exit(1); });
