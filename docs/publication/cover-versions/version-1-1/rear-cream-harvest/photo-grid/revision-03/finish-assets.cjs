const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const { cropForPrint } = require('../prepare.cjs');
const original = require('../revision-02/tiles.json');

const root = path.resolve(__dirname, '../../../../../../..');
const sheet = path.join(root, 'generated_images/exec-2f77a608-6f58-4c5f-925d-66000579f547.png');
const assets = path.join(__dirname, 'assets');

// Paths are in the square reference sheet's per-tile coordinates. The bed mask
// follows the gardener's fingers and trousers. The salad mask stops inside the rim.
const bed = 'M -5 129 Q 25 134 51 125 Q 126 108 180 104 L 208 101 Q 196 131 192 152 Q 187 184 195 225 Q 186 242 174 249 Q 158 266 148 282 L 135 309 Q 124 322 135 328 Q 128 342 129 361 Q 124 386 133 405 Q 142 425 151 423 Q 164 424 167 416 Q 190 408 211 412 L 226 424 Q 240 438 248 458 L 252 473 Q 254 493 266 507 Q 263 549 268 626 L -5 631 Z';
const salad = 'M 135 288 Q 143 250 208 247 Q 221 215 246 196 Q 291 179 334 187 Q 366 176 409 160 Q 461 144 485 196 Q 511 225 496 285 Q 487 330 464 371 Q 416 405 367 425 Q 293 452 226 452 Q 182 452 154 425 Q 150 399 166 382 Q 180 351 143 330 Z';

async function retouch(tileNumber, left, maskPath, filename) {
  const source = await cropForPrint(root, original[tileNumber - 1]);
  const { data, info } = await source.png().toBuffer({ resolveWithObject: true });
  const {width, height} = info;
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height
    + '" viewBox="0 0 625 625" preserveAspectRatio="none"><path d="' + maskPath + '" fill="white"/></svg>';
  const mask = await sharp(Buffer.from(svg)).png().toBuffer();
  const feather = await sharp(mask).blur(1.2).png().toBuffer();
  const patch = await sharp(sheet).extract({left, top:0, width:627, height:627})
    .resize(width, height, {fit:'fill'}).ensureAlpha()
    .composite([{input:feather, blend:'dest-in'}]).png().toBuffer();
  await sharp(data).composite([{input:patch}]).removeAlpha().png().toFile(path.join(assets, filename));
}

async function finish() {
  await fs.mkdir(assets, {recursive:true});
  await retouch(5, 0, bed, 'potatoes-healthy-foliage.png');
  await retouch(7, 627, salad, 'salad-colander.png');
  await sharp(path.join(root, original[8].source)).modulate({brightness:1.06})
    .png().toFile(path.join(assets, 'winter-squash-brighter.png'));
  for (const [left, filename] of [[1, 'radish-in-soil.png'], [628, 'green-butterhead.png']]) {
    await sharp(sheet).extract({left, top:628, width:625, height:625}).png().toFile(path.join(assets, filename));
  }
}
finish().catch(error => {console.error(error); process.exitCode=1;});
