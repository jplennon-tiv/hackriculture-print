const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'../../../../..'),sharp=require(path.join(root,'node_modules/sharp'));
const rel=p=>path.relative(root,p),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const titles=['Tomato','Pea','Runner bean','Broad bean','Courgette','Cucumber','Aubergine','Sweet pepper','Lettuce','Cabbage','Broccoli','Cauliflower','Kale','Beetroot','Onion','Leek'];
async function main(){
 const master=path.join(root,'generated_images/exec-8e0b1592-58b6-4b57-b3d2-f9791799868a.png'),meta=await sharp(master).metadata();
 if(meta.width!==1254||meta.height!==1254)throw Error('Unexpected master dimensions');
 const width=1800,height=2260,tile=402,gap=24,margin=60,top=175,row=500,layers=[],entries=[];
 fs.mkdirSync(path.join(__dirname,'thumbnails'),{recursive:true});
 let svg=`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><style>text{font-family:Arial,Helvetica,sans-serif;fill:#173e2c}.title{font-size:52px;font-weight:700}.sub{font-size:27px}.number{font-size:31px;font-weight:700}.label{font-size:27px;font-weight:600}</style><text x="60" y="80" class="title">Vegetable Guides</text><text x="60" y="135" class="sub">Page 9 · Growing vegetables · 16 new thumbnail choices</text>`;
 for(let n=0;n<16;n++){
  const col=n%4,r=Math.floor(n/4),left=Math.round(col*meta.width/4)+2,right=Math.round((col+1)*meta.width/4)-2,t=Math.round(r*meta.height/4)+2,bottom=Math.round((r+1)*meta.height/4)-2;
  const crop={left,top:t,width:right-left,height:bottom-t},file=path.join(__dirname,'thumbnails',String(n+1).padStart(2,'0')+'-'+titles[n].toLowerCase().replaceAll(' ','-')+'.png');
  await sharp(master).extract(crop).png().toFile(file);
  const x=margin+col*(tile+gap),y=top+r*row;
  layers.push({input:await sharp(file).resize(tile,tile,{fit:'cover'}).png().toBuffer(),left:x,top:y});
  svg+=`<rect x="${x}" y="${y+tile}" width="${tile}" height="62" fill="#ede5cf"/><text x="${x+14}" y="${y+tile+41}" class="number">${String(n+1).padStart(2,'0')}</text><text x="${x+76}" y="${y+tile+40}" class="label">${titles[n]}</text>`;
  entries.push({number:n+1,title:titles[n],file:rel(file),sha256:hash(file),crop,kind:'New generated photographic study; not camera evidence'});
 }
 svg+='<text x="60" y="2212" class="sub">Choose pictures by number · Generated photographic studies</text></svg>';
 layers.push({input:Buffer.from(svg),left:0,top:0});
 const sheet=path.join(__dirname,'Vegetable-Guru-Page-9-Thumbnail-Choices.png');
 await sharp({create:{width,height,channels:3,background:'#fff8e9'}}).composite(layers).png().toFile(sheet);
 await sharp(sheet).resize(1200).jpeg({quality:92}).toFile(path.join(__dirname,'contact-sheet-preview.jpg'));
 const small=await Promise.all(entries.map(async e=>({input:await sharp(path.join(root,e.file)).resize(114,114,{fit:'cover'}).png().toBuffer(),left:((e.number-1)%8)*130+8,top:Math.floor((e.number-1)/8)*130+8})));
 await sharp({create:{width:1040,height:260,channels:3,background:'#fff8e9'}}).composite(small).png().toFile(path.join(__dirname,'thumbnail-size-check.png'));
 const references=[['tomato-camera.jpg','docs/publication/summer-cover-photo-search/selected-stills/P01-tomato-trusses.png'],['peas-camera.jpg','docs/publication/summer-cover-photo-search/selected-stills/P02-peas-on-the-plant.png'],['allotment-camera.jpg','docs/assets/garden-media-library/local-references/allotment/A08-DSC02294.JPG']].map(([f,original])=>({file:rel(path.join(__dirname,'references',f)),sha256:hash(path.join(__dirname,'references',f)),original,originalSHA256:hash(path.join(root,original))}));
 fs.writeFileSync(path.join(__dirname,'GENERATION.json'),JSON.stringify({date:'2026-11-22',master:rel(master),masterSHA256:hash(master),width:meta.width,height:meta.height,prompt:fs.readFileSync(path.join(__dirname,'PROMPT.txt'),'utf8').trim(),references,method:'One sixteen-photo grid generated from actual camera references; exact labels added outside the photos in a separate reproducible contact-sheet composition.'},null,2)+'\n');
 fs.writeFileSync(path.join(__dirname,'THUMBNAILS.json'),JSON.stringify({date:'2026-11-22',folio:9,status:'Awaiting John’s thumbnail selection; no images installed',contactSheet:{file:rel(sheet),sha256:hash(sheet),width,height},entries,checks:{numbers:entries.map(e=>e.number),newImageCount:16,proportions:'Nearest integer quarter boundaries, trimmed two pixels at every edge to exclude seams; square placement uses proportional cropping.',resolution:'Original cropped tiles are 309–310 px. Suitable selection studies; do not claim higher native resolution from the enlarged contact sheet.'}},null,2)+'\n');
 console.log(JSON.stringify({sheet,bytes:fs.statSync(sheet).size,entries:entries.length}));
}
main().catch(e=>{console.error(e);process.exit(1)});
