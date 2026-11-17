const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const master = path.join(__dirname, '../layered-master');
const width = 1100, height = 1430;

async function build() {
  // Match the original exposed cream at the right of the title, using the
  // clean, full-canvas wood as the grain source so no lettering/shadows leak in.
  const paper = [252, 241, 223];
  const woodMid = [250, 234, 216], referenceMid = [249, 236, 211];
  const contrast = [1.6, 1.05, 1.04];
  const source = await sharp(path.join(master, 'assets/wood-texture.png'))
    .resize(width, height, {fit:'fill'}).removeAlpha().raw().toBuffer();
  const rgba = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const delta = paper.map((p,c) => Math.max(0, Math.min(255,
      referenceMid[c] + contrast[c] * (source[i*3+c] - woodMid[c]))) - p);
    // Decompose the sampled colour into transparent pigment over the existing paper.
    const alpha = Math.ceil(255 * Math.max(...delta.map((d,c) =>
      d < 0 ? -d/paper[c] : d/(255-paper[c]))));
    for (let c=0; c<3; c++) rgba[i*4+c] = alpha ? Math.round(paper[c] + delta[c]*255/alpha) : 0;
    rgba[i*4+3] = alpha;
  }
  const grain = await sharp(rgba,{raw:{width,height,channels:4}}).png().toBuffer();
  const original = await fs.readFile(path.join(master,'Vegetable-Guru-Layered-Master.svg'),'utf8');
  const group = /(<g id="wood-grain"[^>]*>)[\s\S]*?(<\/g>)/;
  if (!group.test(original)) throw new Error('Missing wood layer');
  const svg = original.replace(group, (_,open,close) =>
    open + '<image width="1100" height="1430" href="data:image/png;base64,' + grain.toString('base64') + '"/>' + close);
  await fs.writeFile(path.join(__dirname,'Cream-Woodgrain.svg'),svg);
  const native = svg.replace('width="185mm" height="240mm"','width="1100" height="1430"');
  await sharp(Buffer.from(native)).png().toFile(path.join(__dirname,'Cream-Woodgrain-Preview.png'));
}
build().catch(err => {console.error(err); process.exitCode=1;});
