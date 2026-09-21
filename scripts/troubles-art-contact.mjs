// Read-only asset audit: labelled contact sheets, never modifies source images.
import fs from 'node:fs/promises';
import sharp from 'sharp';
const out='output/troubles-art-audit';await fs.mkdir(out,{recursive:true});
for(const group of ['bean_and_pea_troubles','brassica_troubles']){
 const dir='public/images/troubles/'+group,files=(await fs.readdir(dir)).filter(f=>f.endsWith('.png')).sort();
 for(let start=0;start<files.length;start+=12){
  const inputs=[];for(const [i,file]of files.slice(start,start+12).entries()){
   const left=(i%4)*300,top=Math.floor(i/4)*300;
   inputs.push({input:await sharp(dir+'/'+file).resize(280,250,{fit:'contain',background:'white'}).png().toBuffer(),left:left+10,top});
   inputs.push({input:Buffer.from(`<svg width="300" height="45"><rect width="300" height="45" fill="white"/><text x="8" y="18" font-size="12">${file.replace('.png','')}</text></svg>`),left,top:top+250});
  }
  await sharp({create:{width:1200,height:Math.ceil(Math.min(12,files.length-start)/4)*300,channels:3,background:'white'}}).composite(inputs).png().toFile(`${out}/${group}-${start}.png`);
 }
}
