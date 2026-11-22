const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'../../../../..'),sharp=require(path.join(root,'node_modules/sharp'));
const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
async function main(){
 const data=JSON.parse(fs.readFileSync(path.join(__dirname,'VARIANTS.json'))),layers=[];
 const pageW=780,pageH=1012,canvasW=1740,canvasH=2410,gap=60,margin=60,top=230,row=1120;
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${canvasW}" height="${canvasH}"><style>text{font-family:Arial,Helvetica,sans-serif;fill:#173e2c}.title{font-size:48px;font-weight:700}.sub{font-size:26px}.id{font-size:32px;font-weight:700}.label{font-size:27px}</style><text x="60" y="70" class="title">The Vegetable Guru · Title page trials</text><text x="60" y="117" class="sub">A · Scattered photographs     C · A single harvest vignette</text>`;
 for(const [i,v]of data.variants.entries()){
  const x=margin+(i%2)*(pageW+gap),y=top+Math.floor(i/2)*row;
  layers.push({input:await sharp(path.join(__dirname,v.id+'.png')).resize(pageW,pageH,{fit:'fill'}).png().toBuffer(),left:x,top:y});
  svg+=`<text x="${x}" y="${y-25}" class="id">${v.id}</text><text x="${x+65}" y="${y-25}" class="label">${v.title}</text><rect x="${x}" y="${y}" width="${pageW}" height="${pageH}" fill="none" stroke="#d5d1c3" stroke-width="2"/>`;
 }
 svg+='</svg>';layers.push({input:Buffer.from(svg),left:0,top:0});
 const file=path.join(__dirname,'Vegetable-Guru-Title-Page-Trials-Comparison.png');
 await sharp({create:{width:canvasW,height:canvasH,channels:3,background:'#eeeade'}}).composite(layers).png().toFile(file);
 await sharp(file).resize(1150).jpeg({quality:94}).toFile(path.join(__dirname,'comparison-preview.jpg'));
 for(const v of data.variants) await sharp(path.join(__dirname,v.id+'.png')).resize(850).jpeg({quality:94}).toFile(path.join(__dirname,v.id+'-preview.jpg'));
 const output=path.join(root,'output/pdf/title-page-trials/Vegetable-Guru-Title-Page-Trials-A-and-C.pdf');
 const files=[output,file,...data.variants.map(v=>path.join(__dirname,v.id+'.png'))];
 for(const a of Object.values(data.assets)) if(hash(path.join(root,a.file))!==a.sha256)throw Error('Artwork changed');
 const receipt={date:'2026-11-22',status:'Four proposals for John to compare; no selection or installation',files:files.map(f=>({file:path.relative(root,f),sha256:hash(f)})),sourceArtworkHashesVerified:true,sourceTitlePage:'output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf#page=3',sourceTitlePageNote:'Exact title/subtitle/author/brand/imprint wording retained; measurement-edition line added as requested; original title page has no printed folio.',coverGroups:JSON.parse(fs.readFileSync(path.join(__dirname,'COVER-SOURCES.json'))),intentionalReplacements:data.notes};
 fs.writeFileSync(path.join(__dirname,'REVIEW.json'),JSON.stringify(receipt,null,2)+'\n');
 console.log(JSON.stringify({pdf:output,comparison:file,variants:data.variants.map(v=>v.id)}));
}
main().catch(e=>{console.error(e);process.exit(1)});
