import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const sharp = createRequire(import.meta.url)('sharp');
import { fileURLToPath } from 'node:url';

const out = path.dirname(fileURLToPath(import.meta.url));
const sourceDir = path.resolve(out, '../2026-11-24-vegetable-guides-opener-04-concept-library');
const sourceRecord = JSON.parse(await fs.readFile(path.join(sourceDir, 'ARTWORK.json'), 'utf8'));
const selected = [
  [21, 'Red cabbage', 'C', 2],
  [20, 'Chard', 'C', 1],
  [25, 'Aubergine', 'D', 0],
  [9, 'Leeks', 'A', 2],
  [7, 'Courgette', 'A', 0],
  [16, 'John tending the bed', 'B', 3],
];
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
function runs(values, min) {
  const found = [];
  let start = -1;
  for (let i = 0; i <= values.length; i++) {
    if (i < values.length && values[i]) {
      if (start < 0) start = i;
    } else if (start >= 0) {
      if (i - start >= min) found.push([start, i]);
      start = -1;
    }
  }
  return found;
}
const cache = new Map();
async function source(id) {
  if (cache.has(id)) return cache.get(id);
  const sourceItem = sourceRecord.generations.find(g => g.id === id);
  const sourcePath = path.join(sourceDir, sourceItem.file);
  const bytes = await fs.readFile(sourcePath);
  if (sha(bytes) !== sourceItem.sha256) throw new Error('Source changed: ' + id);
  const raw = await sharp(bytes).removeAlpha().raw().toBuffer({resolveWithObject:true});
  const { width:w, height:h, channels:c } = raw.info;
  const meaningful = (x,y) => {
    const i = (y*w+x)*c;
    return raw.data[i] < 220 || raw.data[i+1] < 220 || raw.data[i+2] < 210;
  };
  const rowBands = runs(Array.from({length:h}, (_,y) => {
    let n=0; for(let x=0;x<w;x++) if(meaningful(x,y)) n++;
    return n/w > .35;
  }), 100);
  if(rowBands.length!==2) throw new Error('Expected two photo rows: '+id);
  const colBands = runs(Array.from({length:w}, (_,x) => {
    let n=0, total=0;
    for(const [a,b] of rowBands) for(let y=a;y<b;y++) {total++; if(meaningful(x,y)) n++;}
    return n/total > .35;
  }), 100);
  if(colBands.length!==3) throw new Error('Expected three photo columns: '+id);
  const data = {sourcePath, bytes, rowBands, colBands, sourceItem};
  cache.set(id,data);
  return data;
}
await fs.mkdir(path.join(out,'selected-panels'),{recursive:true});
const cellW=440, photoH=560, labelH=44, gap=16;
const canvasW=3*cellW+4*gap, canvasH=2*(photoH+labelH)+3*gap;
const overlays=[], records=[];
for (let i=0;i<selected.length;i++) {
  const [number,title,id,slot]=selected[i];
  const src=await source(id);
  const row=Math.floor(slot/3), col=slot%3;
  const [x0,x1]=src.colBands[col], [y0,y1]=src.rowBands[row];
  const crop={left:x0,top:y0,width:x1-x0,height:y1-y0};
  if(crop.width>cellW || crop.height>photoH) throw new Error('Panel does not fit native layout');
  const panel=await sharp(src.bytes).extract(crop).removeAlpha().png().toBuffer();
  const panelFile='selected-panels/'+String(number).padStart(2,'0')+'.png';
  await fs.writeFile(path.join(out,panelFile),panel);
  const cellX=gap+(i%3)*(cellW+gap);
  const cellY=gap+Math.floor(i/3)*(photoH+labelH+gap);
  const left=cellX+Math.floor((cellW-crop.width)/2);
  const top=cellY+Math.floor((photoH-crop.height)/2);
  overlays.push({input:panel,left,top});
  const label=Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="'+cellW+'" height="'+labelH+'"><text x="'+(cellW/2)+'" y="33" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="30" fill="#171a15">'+number+'</text></svg>');
  overlays.push({input:label,left:cellX,top:cellY+photoH});
  records.push({number,title,source_sheet:id,source_file:src.sourcePath,source_sha256:src.sourceItem.sha256,crop_px:crop,panel_file:panelFile,panel_sha256:sha(panel),placement_px:{left,top}});
}
const file='Vegetable-Guru-Shortlist-21-20-25-9-7-16.png';
const final=await sharp({create:{width:canvasW,height:canvasH,channels:3,background:'#fbf8f1'}}).composite(overlays).png().toBuffer();
await fs.writeFile(path.join(out,file),final);
// Verify every placed photograph is pixel-for-pixel equal to its source crop.
for (const r of records) {
  const expected=await sharp(path.join(out,r.panel_file)).removeAlpha().raw().toBuffer();
  const actual=await sharp(final).extract({...r.placement_px,width:r.crop_px.width,height:r.crop_px.height}).removeAlpha().raw().toBuffer();
  if(!expected.equals(actual)) throw new Error('Pixel preservation check failed: '+r.number);
}
const record={
  title:'Vegetable Guides — six-image shortlist',
  date:'2026-11-24',
  status:'user_selected_shortlist_for_comparison',
  selection_order:selected.map(x=>x[0]),
  file,dimensions_px:{width:canvasW,height:canvasH},sha256:sha(final),
  method:'Existing photo panels extracted and arranged at native pixel size with Sharp. No generation, redrawing, resizing, retouching or colour adjustment. Fresh number labels outside photographs.',
  source_collection:'../2026-11-24-vegetable-guides-opener-04-concept-library/README.md',
  candidates:records,
  verification:'All source sheet hashes matched their preserved records; every photograph in the assembled sheet matched its source crop pixel-for-pixel.',
  scope:'Comparison of selected favourites only. No final artwork selection or book integration. Candidate 16 is the exact selected sheet-B image, not a new likeness revision.',
  preserved:'Original sheets, approved sources, editable masters and ordered PDFs unchanged.'
};
await fs.writeFile(path.join(out,'ARTWORK.json'),JSON.stringify(record,null,2)+'\n');
console.log(JSON.stringify({file:path.join(out,file),dimensions:record.dimensions_px,selected:record.selection_order,verification:record.verification,crops:records.map(r=>({number:r.number,crop:r.crop_px}))}));

