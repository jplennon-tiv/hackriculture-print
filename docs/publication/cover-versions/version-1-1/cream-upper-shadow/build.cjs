const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

async function build() {
  const master = path.join(__dirname, '../layered-master');
  const source = await fs.readFile(path.join(__dirname, '../cream-woodgrain-study/Cream-Woodgrain.svg'), 'utf8');
  const width = 1100, height = 460;
  const area = {left:0, top:0, width, height};
  const reference = await sharp(path.join(master,'sources/cream-trial-before-restoration.png'))
    .extract(area).removeAlpha().blur(1.8).raw().toBuffer();
  const nearVegetables = await sharp(path.join(master,'assets/top-vegetables.png'))
    .extract(area).extractChannel('alpha').blur(17).raw().toBuffer();
  const rgba = Buffer.alloc(width * height * 4);
  for (let y=0; y<height; y++) for (let x=0; x<width; x++) {
    const i=y*width+x;
    // Exclude original lettering and ribbon when sampling light on the board.
    if ((x>128 && x<870 && y>350) || (x<266 && x*239/254+y<251)) continue;
    const proximity = Math.min(1, nearVegetables[i]/7);
    // Red channel is least affected by the warm grain. Ignore ordinary wood variation.
    const darkening = Math.min(0.83, Math.max(0, (243-reference[3*i])/211));
    const a = Math.round(255*proximity*darkening);
    if (a) rgba.set([38,30,15,a],4*i);
  }
  const shadow = await sharp(rgba,{raw:{width,height,channels:4}}).png().toBuffer();
  const group = /(<g id="top-vegetables"[^>]*>)(<image[^>]+) filter="url\(#contact\)"\/><\/g>/;
  if (!group.test(source)) throw Error('Upper artwork or existing contact filter changed');
  const svg = source.replace(group, (_,open,photo) => open +
    '<g id="upper-cast-shadow" inkscape:groupmode="layer" inkscape:label="Cast shadow on wood" opacity="1"><image width="1100" height="460" href="data:image/png;base64,'+
    shadow.toString('base64')+'"/></g>'+photo+'/></g>');
  await fs.writeFile(path.join(__dirname,'Cream-Upper-Shadow.svg'),svg);
  await sharp(Buffer.from(svg.replace('width="185mm" height="240mm"','width="1100" height="1430"')))
    .png().toFile(path.join(__dirname,'Cream-Upper-Shadow-Preview.png'));
}
build().catch(e=>{console.error(e);process.exitCode=1});
