const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');
const source = require('./ARTWORK.json');
async function build() {
  let svg = await fs.readFile(path.join(__dirname, '../garden-harvest/Garden-Harvest.svg'), 'utf8');
  for (const [band, id] of [['upper', 'top-vegetables'], ['lower', 'bottom-vegetables']]) {
    const input = path.resolve(__dirname, '../../../../..', source.files[band]);
    const {data,info} = await sharp(input).trim({threshold:5}).png().toBuffer({resolveWithObject:true});
    const scale = Math.min(1088/info.width, (band==='upper'?405:559)/info.height);
    const w = info.width*scale, h = info.height*scale;
    const x = (1100-w)/2, y = band==='upper'?1:1425-h;
    const group = new RegExp('(<g id="'+id+'"[^>]*>)<image[^>]+/></g>');
    if (!group.test(svg)) throw Error('Missing layer: '+id);
    svg=svg.replace(group, (_,open)=>open+'<image x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" href="data:image/png;base64,'+data.toString('base64')+'" filter="url(#harvest-shadow)"/></g>');
  }
  await fs.writeFile(path.join(__dirname,'Allotment-Harvest.svg'),svg);
  await sharp(Buffer.from(svg.replace('width="185mm" height="240mm"','width="1100" height="1430"'))).png().toFile(path.join(__dirname,'Allotment-Harvest.png'));
}
build().catch(e=>{console.error(e);process.exitCode=1;});
