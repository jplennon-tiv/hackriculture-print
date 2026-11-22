const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '../../../../..');
const sharp = require(path.join(root, 'node_modules/sharp'));
const relative = p => path.relative(root, p);
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const catalog = JSON.parse(fs.readFileSync(path.join(__dirname, '../THUMBNAILS.json')));
const generation = JSON.parse(fs.readFileSync(path.join(__dirname, 'GENERATION.json')));
const existing = ['plot', 'no-dig', 'glass', 'compost', 'sowing', 'hoops'];
const newTitles = ['Sowing a drill', 'Planting a lettuce plug', 'Watering at the roots', 'Fork and soil', 'Finished compost', 'Seedlings in modules', 'Bamboo and wire joint', 'Soil testing', 'Mesh and a blue hoop', 'Runner bean on a cane'];
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const escape = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
async function main() {
  fs.mkdirSync(path.join(__dirname, 'thumbnails'), {recursive:true});
  const entries = [];
  for (const key of existing) {
    const file = path.join(__dirname, '../thumbnails', key + '.jpg');
    if (hash(file) !== catalog[key].thumbnailSHA256) throw Error('Existing thumbnail changed: ' + key);
    const meta = await sharp(file).metadata();
    entries.push({number:entries.length+1, title:catalog[key].name, kind:'existing camera photograph', file:relative(file), sha256:hash(file), width:meta.width, height:meta.height, original:catalog[key]});
  }
  for (let batch = 0; batch < 2; batch++) {
    const master = path.join(root, generation.batches[batch].master);
    const meta = await sharp(master).metadata();
    const columns = batch === 0 ? 3 : 2;
    const cell = meta.width / columns;
    if (!Number.isInteger(cell) || meta.height !== cell*2) throw Error('Unexpected generation grid');
    for (let index = 0; index < columns*2; index++) {
      const title = newTitles[entries.length-6];
      const number = entries.length+1;
      const crop = {left:(index%columns)*cell+2,top:Math.floor(index/columns)*cell+2,width:cell-4,height:cell-4};
      const file = path.join(__dirname, 'thumbnails', String(number).padStart(2,'0')+'-'+slug(title)+'.png');
      await sharp(master).extract(crop).png().toFile(file);
      entries.push({number,title,kind:'new generated photographic study',file:relative(file),sha256:hash(file),width:crop.width,height:crop.height,master:relative(master),masterSHA256:hash(master),crop});
    }
  }
  const width=2400, height=2940, margin=80, gap=32, tile=536, top=244, row=646;
  const layers=[];
  let svg=`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><style>text{font-family:Arial,Helvetica,sans-serif;fill:#263f32}.title{font-size:67px;font-weight:700}.sub{font-size:32px}.number{font-size:39px;font-weight:700}.label{font-size:29px;font-weight:600}.kind{font-size:23px;fill:#697365}</style><text x="80" y="99" class="title">Growing Techniques</text><text x="80" y="159" class="sub">Page 147 · Thumbnail choices</text><text x="80" y="208" class="sub">01–06 existing photographs  /  07–16 new photographic studies</text>`;
  for (const entry of entries) {
    const n=entry.number-1, x=margin+(n%4)*(tile+gap), y=top+Math.floor(n/4)*row;
    layers.push({input:await sharp(path.join(root,entry.file)).resize(tile,tile,{fit:'fill'}).toBuffer(),left:x,top:y});
    svg+=`<rect x="${x}" y="${y+tile}" width="${tile}" height="88" fill="${n<6?'#e6e9df':'#ede5cf'}"/><text x="${x+14}" y="${y+tile+38}" class="number">${String(entry.number).padStart(2,'0')}</text><text x="${x+80}" y="${y+tile+37}" class="label">${escape(entry.title)}</text><text x="${x+80}" y="${y+tile+69}" class="kind">${n<6?'EXISTING':'NEW STUDY'}</text>`;
  }
  svg+='<text x="80" y="2894" class="sub">Choose any mixture by number. Final checkerboard arrangement follows your selection.</text></svg>';
  layers.push({input:Buffer.from(svg),left:0,top:0});
  const sheet=path.join(__dirname,'Vegetable-Guru-Page-147-Thumbnail-Choices.png');
  await sharp({create:{width,height,channels:3,background:'#f8f5ed'}}).composite(layers).png().toFile(sheet);
  const manifest={date:'2026-11-22',folio:147,status:'Proposals awaiting John’s selection; existing six are exact retained thumbnails',scope:'Contact sheet only; no divider or book integration',contactSheet:{file:relative(sheet),sha256:hash(sheet),width,height},entries,checks:{sixExistingHashesMatch:true,newImageCount:10,numbers:entries.map(e=>e.number),seams:'Two pixels trimmed from each generated tile edge; no content retouching'},review:'Hands, tool construction, natural plant variation, continuous bamboo, mesh and soil-test object scale visually inspected. Final page placement remains unapproved.'};
  fs.writeFileSync(path.join(__dirname,'THUMBNAILS.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify({file:sheet,bytes:fs.statSync(sheet).size,entries:entries.length,unchangedExisting:6,newStudies:10}));
}
main().catch(e=>{console.error(e);process.exit(1)});
