// Preview composites only. All original RGBA master bytes remain untouched.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(new URL('../../../../../package.json',import.meta.url));
const sharp=require('sharp');
const base=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
const names=(await fs.readdir(path.join(base,'assets'))).filter(n=>n.endsWith('.png')).sort();
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;');
const thumbs=path.join(base,'review','thumbnails');
await fs.mkdir(thumbs,{recursive:true});
const manifest=JSON.parse(await fs.readFile(path.join(base,'ARTWORK.json'),'utf8'));
for(const a of manifest.assets){
 const name=a.id.startsWith('23-')?'23-young-plant-rootball':a.id;
 await sharp(path.join(base,'assets',name+'.png')).resize({width:900,height:900,fit:'inside',withoutEnlargement:true}).flatten({background:'#fbf8ed'}).jpeg({quality:95,chromaSubsampling:'4:4:4'}).toFile(path.join(thumbs,name+'-art.jpg'));
 await sharp(path.join(base,a.source_path)).rotate().resize({width:500,height:500,fit:'inside',withoutEnlargement:true}).flatten({background:'#f0eee2'}).jpeg({quality:90}).toFile(path.join(thumbs,name+'-source.jpg'));
}
for(const [label,bg,fg] of [['cream','#fbf8ed','#173e2d'],['dark','#173e2d','#fbf8ed']]){
 for(let start=0;start<names.length;start+=8){
  const layers=[];
  for(let i=0;i<Math.min(8,names.length-start);i++){
   const n=names[start+i], x=(i%4)*350,y=Math.floor(i/4)*370;
   const im=await sharp(path.join(base,'assets',n)).resize(330,320,{fit:'contain',background:bg}).flatten({background:bg}).png().toBuffer();
   layers.push({input:im,left:x+10,top:y+8});
   const text=Buffer.from(`<svg width="350" height="38"><text x="12" y="23" font-family="Arial" font-size="13" fill="${fg}">${esc(n.replace('.png',''))}</text></svg>`);
   layers.push({input:text,left:x,top:y+330});
  }
  await sharp({create:{width:1400,height:740,channels:3,background:bg}}).composite(layers).jpeg({quality:95}).toFile(path.join(base,'review',`${label}-${start/8+1}.jpg`));
 }
}
console.log(`Reviewed composites prepared for ${names.length} masters`);
