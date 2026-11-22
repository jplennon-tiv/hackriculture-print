const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'../../../../../..'),sharp=require(path.join(root,'node_modules/sharp'));
const read=p=>JSON.parse(fs.readFileSync(p)),hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
async function main(){
 const current=read(path.join(__dirname,'CHECKS.json')),old=read(path.join(__dirname,'../CHECKS.json')),v=read(path.join(__dirname,'VARIANTS.json')),comparisons=[],layers=[];
 const width=1740,height=1300,pageW=780,pageH=1012,top=210;
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><style>text{font-family:Arial,Helvetica,sans-serif;fill:#173e2c}.title{font-size:47px;font-weight:700}.sub{font-size:26px}.label{font-size:29px}</style><text x="60" y="70" class="title">Title page · Revised A layouts</text><text x="60" y="117" class="sub">Proposed wording: Traditional measurements edition</text>`;
 for(const [i,variant] of v.variants.entries()){
  const a=await sharp(path.join(__dirname,'..',variant.id+'.png')).removeAlpha().raw().toBuffer({resolveWithObject:true}),b=await sharp(path.join(__dirname,variant.id+'.png')).removeAlpha().raw().toBuffer({resolveWithObject:true});
  if(a.info.width!==b.info.width||a.info.height!==b.info.height)throw Error('Render dimensions changed');
  const prior=old.variants.find(x=>x.id===variant.id),now=current.variants.find(x=>x.id===variant.id);
  const changedText=[...prior.text,...now.text].filter(t=>['HACKRICULTURE','[Imprint name]','Traditional measurements','Traditional measurements edition'].includes(t.text));
  const scale=2.2*72/25.4,boxes=changedText.map(t=>({x0:Math.floor(t.xMM*scale)-4,y0:Math.floor(t.topMM*scale)-4,x1:Math.ceil((t.xMM+t.widthMM)*scale)+4,y1:Math.ceil((t.topMM+t.heightMM)*scale)+4}));
  let changed=0,checked=0;
  for(let y=0;y<a.info.height;y++)for(let x=0;x<a.info.width;x++){
   if(boxes.some(r=>x>=r.x0&&x<r.x1&&y>=r.y0&&y<r.y1))continue;
   const p=(y*a.info.width+x)*a.info.channels;checked++;
   if(a.data[p]!==b.data[p]||a.data[p+1]!==b.data[p+1]||a.data[p+2]!==b.data[p+2])changed++;
  }
  if(changed)throw Error('Unexpected changes outside edited text: '+variant.id+' '+changed);
  comparisons.push({id:variant.id,checkedPixels:checked,changedPixelsOutsideEditedText:changed,imagesUnchanged:true});
  const x=60+i*840;layers.push({input:await sharp(path.join(__dirname,variant.id+'.png')).resize(pageW,pageH,{fit:'fill'}).png().toBuffer(),left:x,top});
  svg+=`<text x="${x}" y="183" class="label">${variant.id} · ${variant.title}</text><rect x="${x}" y="${top}" width="${pageW}" height="${pageH}" fill="none" stroke="#d5d1c3" stroke-width="2"/>`;
 }
 svg+='</svg>';layers.push({input:Buffer.from(svg),left:0,top:0});
 const comparison=await sharp({create:{width,height,channels:3,background:'#eeeade'}}).composite(layers).png().toBuffer();
 await sharp(comparison).resize(1300).jpeg({quality:94}).toFile(path.join(__dirname,'comparison-preview.jpg'));
 const proof=path.join(root,'output/pdf/title-page-trials/a-revision/Vegetable-Guru-Title-Page-A-Revised.pdf');
 for(const a of Object.values(v.assets))if(hash(path.join(root,a.file))!==a.sha256)throw Error('Artwork source changed');
 const r={date:'2026-11-22',status:'A direction selected; A1/A2 layout and proposed edition wording await review',proof:{file:path.relative(root,proof),sha256:hash(proof)},comparisons,changes:['Removed HACKRICULTURE top line','Proposed Traditional measurements edition','Omitted imprint placeholder following John’s subsequent instruction'],preserved:'All other text, fonts, positions and photographic pixels match the preceding A1/A2 trials',scope:'Two standalone title-page proofs only; no installation or supplier work'};
 fs.writeFileSync(path.join(__dirname,'REVIEW.json'),JSON.stringify(r,null,2)+'\n');
 console.log(JSON.stringify(r));
}
main().catch(e=>{console.error(e);process.exit(1)});
