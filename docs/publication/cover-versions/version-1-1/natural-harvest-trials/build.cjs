const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const {createHash} = require('node:crypto');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');

const root = path.resolve(__dirname, '../../../../..');
const out = path.join(root, 'output/natural-harvest-trials');
const source = path.resolve(__dirname, '../garden-harvest-natural-pile');
const manifest = require('./ARTWORK.json');
const W = 1100, H = 1430;
const native = svg => svg.replace('width="185mm" height="240mm"', 'width="1100" height="1430"');

async function renderBand(entry, band, textMask) {
  const isTop = band === 'upper';
  const bytes = await fs.readFile(path.join(root, entry.file));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256);
  const {data: cutout, info} = await sharp(bytes).trim({threshold:2}).png().toBuffer({resolveWithObject:true});
  const alpha = await sharp(cutout).extractChannel('alpha').raw().toBuffer();
  const {width,height} = info;
  // Use all the available width where the silhouette permits. Reserve a small
  // clearance around lettering, allowing an outer frond farther into the centre.
  let scale = Math.min(1086 / width, (isTop ? 425 : 558) / height);
  let x,y;
  for (;;) {
    x = (W - scale*width) / 2;
    y = isTop ? 3 : H - 7 - scale*height;
    let clash = false;
    for (let row = 0; row < height && !clash; row += 2) {
      const targetY = Math.round(y + row*scale);
      if (isTop ? targetY < 335 : targetY > 971) continue;
      for (let col = 0; col < width; col += 2) {
        const index = targetY*W + Math.round(x + col*scale);
        if (alpha[row*width+col] > 30 && textMask[index] > 6) {clash=true; break;}
      }
    }
    if (!clash) break;
    scale *= 0.985;
  }
  return '<image x="'+x+'" y="'+y+'" width="'+width*scale+'" height="'+height*scale+'" href="data:image/png;base64,'+cutout.toString('base64')+'" filter="url(#harvest-shadow)"/>';
}
async function build() {
  await fs.mkdir(out, {recursive:true});
  const base = await fs.readFile(path.join(source,'Allotment-Harvest.svg'),'utf8');
  const glyphs = base.match(/<g id="(?:title|author)"[^>]*>.*?<\/g>/g);
  assert.equal(glyphs.length,2);
  const maskSvg = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="1100" height="1430">'+glyphs.join('')+'</svg>';
  const textMask = await sharp(Buffer.from(maskSvg)).blur(6).extractChannel('alpha').raw().toBuffer();
  const tiles=[];
  for (const [i,entry] of manifest.arrangements.entries()) {
    const dest=path.join(out,entry.key);
    if (i===0) {
      await fs.copyFile(path.join(source,'Allotment-Harvest.png'), dest+'.png');
      await fs.copyFile(path.join(source,'Allotment-Harvest.svg'), dest+'.svg');
    } else {
      let svg=base;
      for (const [band,id] of [['upper','top-vegetables'],['lower','bottom-vegetables']]) {
        const re = new RegExp('(<g id="'+id+'"[^>]*>)<image[^>]+/></g>');
        assert.match(svg,re);
        const image = await renderBand(entry[band],band,textMask);
        svg=svg.replace(re,(_,open)=>open+image+'</g>');
      }
      await fs.writeFile(dest+'.svg',svg);
      await sharp(Buffer.from(native(svg))).png().toFile(dest+'.png');
    }
    const left=24+(i%4)*276,top=65+Math.floor(i/4)*374;
    tiles.push({input:await sharp(dest+'.png').resize(250,325,{fit:'fill'}).png().toBuffer(),left,top});
    tiles.push({input:Buffer.from('<svg width="270" height="35"><text x="0" y="24" font-family="Helvetica" font-weight="bold" font-size="16" fill="#073e28">'+entry.name+'</text></svg>'),left,top:top+326});
  }
  tiles.push({input:Buffer.from('<svg width="1050" height="45"><text x="0" y="32" font-family="Georgia" font-size="30" fill="#073e28">The Vegetable Guru · Allotment harvest trials</text></svg>'),left:24,top:8});
  await sharp({create:{width:1126,height:815,channels:3,background:'#f1ede3'}}).composite(tiles).png().toFile(path.join(out,'Harvest-Arrangements-Overview.png'));
  execFileSync('swift',['-module-cache-path','/tmp/veg-preview-swift-cache',path.join(__dirname,'../arrangement-proofs/review.swift'),out],{stdio:'inherit'});
  await fs.rename(path.join(out,'Vegetable-Guru-Harvest-Arrangements.pdf'),path.join(out,'Garden-Grown-Cover-Trials.pdf'));
}
build().catch(error => {console.error(error); process.exitCode=1;});
