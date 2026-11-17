const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const sharp = require('sharp');

const root = path.resolve(__dirname, '../../../../..');
const source = path.resolve(__dirname, '../original-harvest-light-study/Original-Harvest-Cast-Shadows.svg');
const edition = ['pinned', 'rectangle', 'oval', 'portrait'].find(name => process.argv.includes('--' + name)) ?? '';
const revisions = edition ? [path.join(__dirname, 'portrait/revision.json')] : [];
if (['oval', 'rectangle', 'pinned'].includes(edition)) revisions.push(path.join(__dirname, 'oval/revision.json'));
if (edition === 'rectangle' || edition === 'pinned') revisions.push('--' + edition);
const output = path.join(root, 'output/pdf/rear-cream-harvest', edition);

async function build() {
  const {readBookLayout} = await import(path.resolve(root, '../hackriculture-data/lib/book-layout.mjs'));
  const {covers} = readBookLayout();
  const svg = await fs.readFile(source, 'utf8');
  const background = ['paper-colour', 'wood-grain'].map(id => {
    const group = svg.split('\n').find(row => row.includes('<g id="' + id + '"'));
    assert.ok(group && group.trimEnd().endsWith('</g>'), id);
    return group.slice(group.indexOf('<g id="' + id + '"'));
  }).join('\n');
  const wrapper = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="1100" height="1430">';
  const temp = await fs.mkdtemp(path.join(os.tmpdir(),'vg-back-cream-'));
  await fs.mkdir(output,{recursive:true});
  try {
    const board = await sharp(Buffer.from(wrapper + background + '</svg>')).removeAlpha().png().toBuffer();
    const rear = path.join(temp,'rear-board.png');
    await sharp(board).flop().png().toFile(rear);
    // Both faces are viewed upright, back on the left. Grain must join at the fold.
    const edge = (src, left) => sharp(src).extract({left,top:0,width:1,height:1430}).raw().toBuffer();
    assert.deepEqual(await edge(board,0),await edge(rear,1099));
    const front = path.join(temp,'selected-front.png');
    await sharp(Buffer.from(svg.replace('width="185mm" height="240mm"','width="1100" height="1430"'))).png().toFile(front);
    if (edition === 'pinned') {
      for (const layer of ['paper', 'pins']) {
        const file = path.join(temp, layer + '.png');
        await sharp(path.join(__dirname, 'pinned', layer + '.svg')).png().toFile(file);
        revisions.push(file);
      }
    }
    execFileSync('swift', ['-module-cache-path','/tmp/veg-preview-swift-cache', path.join(__dirname,'layout.swift'),
      root, __dirname, output, rear, front, covers.back.priceGBP.toFixed(2), ...revisions], {stdio:'inherit'});
  } finally {await fs.rm(temp, {recursive:true});}
}
build().catch(error => {console.error(error); process.exitCode=1;});
