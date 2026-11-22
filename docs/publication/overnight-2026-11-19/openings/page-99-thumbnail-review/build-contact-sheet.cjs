const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.resolve(__dirname, '../../../../..');
const sharp = require(path.join(root, 'node_modules/sharp'));
const rel = p => path.relative(root,p);
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const catalog = JSON.parse(fs.readFileSync(path.join(__dirname,'../THUMBNAILS.json')));
const generation = JSON.parse(fs.readFileSync(path.join(__dirname,'GENERATION.json')));
const names = ['Black bean aphids','Cabbage caterpillar','Flea beetle damage','Cabbage whitefly','Leek rust','Blossom-end rot','Split carrot','Split tomato','Garden snail','Ladybird and aphids','Inspecting a leaf','Cabbage white butterfly'];
const oldNames = ['Aphids on brassica','Slug and lettuce','Powdery mildew','Mesh-covered bed'];
const slug = s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-');
async function main(){
  fs.mkdirSync(path.join(__dirname,'thumbnails'),{recursive:true});
  const entries=[];
  for(const key of ['aphids','slug','mildew','mesh']){
    const file=path.join(__dirname,'../thumbnails',key+'.jpg');
    if(hash(file)!==catalog[key].thumbnailSHA256)throw Error('Changed source '+key);
    const m=await sharp(file).metadata();
    entries.push({number:entries.length+1,title:oldNames[entries.length],kind:key==='mesh'?'existing camera photograph':'existing generated study',file:rel(file),sha256:hash(file),width:m.width,height:m.height,original:catalog[key]});
  }
  for(const batch of generation.batches){
    const master=path.join(root,batch.master),m=await sharp(master).metadata(),cell=m.width/3;
    if(!Number.isInteger(cell)||m.height!==cell*2)throw Error('Unexpected generation grid');
    for(let i=0;i<6;i++){
      const title=names[entries.length-4],number=entries.length+1;
      const crop={left:(i%3)*cell+2,top:Math.floor(i/3)*cell+2,width:cell-4,height:cell-4};
      const file=path.join(__dirname,'thumbnails',String(number).padStart(2,'0')+'-'+slug(title)+'.png');
      await sharp(master).extract(crop).png().toFile(file);
      entries.push({number,title,kind:'new generated photographic study',file:rel(file),sha256:hash(file),width:crop.width,height:crop.height,master:rel(master),masterSHA256:hash(master),crop});
    }
  }
  const width=2400,height=2940,tile=536,gap=32,margin=80,top=244,row=646,layers=[];
  let svg=`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><style>text{font-family:Arial,Helvetica,sans-serif;fill:#263f32}.title{font-size:67px;font-weight:700}.sub{font-size:32px}.number{font-size:39px;font-weight:700}.label{font-size:29px;font-weight:600}.kind{font-size:23px;fill:#697365}</style><text x="80" y="99" class="title">Vegetable Troubles</text><text x="80" y="159" class="sub">Page 99 · Thumbnail choices</text><text x="80" y="208" class="sub">01–04 existing pictures  /  05–16 new photographic studies</text>`;
  for(const e of entries){const n=e.number-1,x=margin+(n%4)*(tile+gap),y=top+Math.floor(n/4)*row;
    layers.push({input:await sharp(path.join(root,e.file)).resize(tile,tile,{fit:'cover',position:'centre'}).png().toBuffer(),left:x,top:y});
    svg+=`<rect x="${x}" y="${y+tile}" width="${tile}" height="88" fill="${n<4?'#e6e9df':'#ede5cf'}"/><text x="${x+14}" y="${y+tile+38}" class="number">${String(e.number).padStart(2,'0')}</text><text x="${x+80}" y="${y+tile+37}" class="label">${e.title}</text><text x="${x+80}" y="${y+tile+69}" class="kind">${n<4?'EXISTING':'NEW STUDY'}</text>`;
  }
  svg+='<text x="80" y="2894" class="sub">Choose any mixture by number. Final page uses the approved thumbnail size.</text></svg>';
  layers.push({input:Buffer.from(svg),left:0,top:0});
  const sheet=path.join(__dirname,'Vegetable-Guru-Page-99-Thumbnail-Choices.png');
  await sharp({create:{width,height,channels:3,background:'#f8f5ed'}}).composite(layers).png().toFile(sheet);
  await sharp(sheet).resize(1200).jpeg({quality:90}).toFile(path.join(__dirname,'contact-sheet-preview.jpg'));
  const small=await Promise.all(entries.map(async e=>({input:await sharp(path.join(root,e.file)).resize(114,114,{fit:'cover'}).png().toBuffer(),left:((e.number-1)%8)*130+8,top:Math.floor((e.number-1)/8)*130+8})));
  await sharp({create:{width:1040,height:260,channels:3,background:'#fff8e9'}}).composite(small).png().toFile(path.join(__dirname,'thumbnail-size-check.png'));
  const manifest={date:'2026-11-22',folio:99,status:'Proposals awaiting John’s selection',scope:'Contact sheet only; final page composition and integration remain separate',contactSheet:{file:rel(sheet),sha256:hash(sheet),width,height},entries,checks:{existingHashesMatch:true,newImageCount:12,numbers:entries.map(e=>e.number),sourceCropping:'Proportional centred square crops; existing files unchanged. Two pixels trimmed from each generated tile edge.',sizeReview:'114 px squares approximate 29 mm at 100 dpi; inspected for thumbnail legibility.',visualReview:'Inspected all subjects, natural plant variation, symptom position, hand grip, continuous anatomy and panel edges. Generated diagnostic studies remain proposals.'}};
  fs.writeFileSync(path.join(__dirname,'THUMBNAILS.json'),JSON.stringify(manifest,null,2)+'\n');
  console.log(JSON.stringify({file:sheet,bytes:fs.statSync(sheet).size,entries:entries.length,existing:4,new:12}));
}
main().catch(e=>{console.error(e);process.exit(1)});
