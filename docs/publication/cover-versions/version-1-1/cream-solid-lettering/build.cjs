const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const assert = require('node:assert/strict');

async function build() {
  const dir = path.resolve(__dirname, '../cream-upper-shadow');
  let svg = await fs.readFile(path.join(dir, 'Cream-Upper-Shadow.svg'), 'utf8');
  const baseline = svg;
  // Front lettering inherits this solid colour in bookvault-print-ready/cover.html.
  const ink = [7, 62, 40];
  const coverage = Buffer.alloc(1100 * 1430);
  for (const id of ['title', 'subtitle', 'author']) {
    const group = new RegExp('(<g id="' + id + '"[^>]*><image href="data:image/png;base64,)([^"]+)');
    const match = svg.match(group);
    assert.ok(match, 'Missing ' + id);
    const {data, info} = await sharp(Buffer.from(match[2], 'base64')).ensureAlpha().raw().toBuffer({resolveWithObject:true});
    assert.deepEqual([info.width, info.height, info.channels], [1100, 1430, 4]);
    for (let i = 0; i < coverage.length; i++) {
      if (data[4*i+3]) {
        coverage[i] = 1;
        data.set(ink, 4*i);
      }
    }
    const png = await sharp(data, {raw:info}).png().toBuffer();
    svg = svg.replace(group, () => match[1] + png.toString('base64'));
  }
  const render = s => sharp(Buffer.from(s.replace('width="185mm" height="240mm"', 'width="1100" height="1430"')));
  const proof = await render(svg).png().toBuffer();
  const before = await render(baseline).removeAlpha().raw().toBuffer();
  const after = await sharp(proof).removeAlpha().raw().toBuffer();
  for (let i = 0; i < coverage.length; i++) {
    if (!coverage[i]) assert.ok(before.readUIntBE(i*3,3) === after.readUIntBE(i*3,3));
  }
  await fs.writeFile(path.join(__dirname, 'Cream-Solid-Lettering.svg'), svg);
  await fs.writeFile(path.join(__dirname, 'Cream-Solid-Lettering-Preview.png'), proof);
}
build().catch(e => {console.error(e); process.exitCode = 1});
