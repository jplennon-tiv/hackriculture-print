const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const {execFileSync} = require('node:child_process');
const sharp = require('sharp');
const arrangements = require('./arrangements.cjs');
const {field,specimen,project,layer,selectColour} = require('../original-harvest-light-study/build.cjs');

const root=path.resolve(__dirname,'../../../../..');
const previous=path.join(root,'output/natural-harvest-shadow-trials');
const destination=path.join(root,'output/harvest-light-review');
const reference=path.join(root,'output/original-harvest-light-study/Original-Harvest-Cast-Shadows.png');
const clamp=n=>Math.max(0,Math.min(1,n));
const native=svg=>svg.replace('width="185mm" height="240mm"','width="1100" height="1430"');
const wrap=(w,h,content,y=0)=>'<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 '+y+' '+w+' '+h+'">'+content+'</svg>';
function chroma(type,r,g,b) {
  switch(type) {
    case 'vine': return clamp((g-.8*r-2)/(.15*Math.max(16,g)))*clamp((g-1.05*b)/14);
    case 'gold': return clamp((r-.95*g)/19)*clamp((g-1.16*b)/27)*clamp((g-.48*r)/20);
    case 'warm': return clamp((r-.94*g)/21)*clamp((r-1.12*b)/30);
    case 'root': return clamp((r-.90*g+6)/15);
    case 'purple': case 'beet': case 'berry': return clamp((b-.70*g+5)/18)*clamp((r-.9*g+8)/16);
    case 'redstem': return clamp((r-1.25*g)/23)*clamp((r-.63*b)/23);
    case 'silkhusk': return clamp((g-.85*r)/18)*clamp((g-.84*b)/19);
    case 'pale': return clamp((r-.88*g)/18)*clamp((b-.36*g)/24);
    case 'fibres': return clamp((r-.82*g)/15)*clamp((g-.76*b)/16);
    default: return selectColour(type,r,g,b);
  }
}
function nativePose(part) {
  const doublePosition=([x,y,z])=>[2*x,2*y,z];
  return {...part,polygon:part.polygon.split(' ').map(pair=>pair.split(',').map(v=>2*Number(v)).join(',')).join(' '),
    lift:part.lift.map(doublePosition),surface:part.surface?.map(doublePosition)};
}
async function relight(svg,side,descriptions) {
  const id=side==='upper'?'top-vegetables':'bottom-vegetables';
  const row=svg.split('\n').find(line=>line.includes('<g id="'+id+'"'));
  const photos=[...row.matchAll(/<image x="(?!0")[^"]+" y="[^"]+" width="[^"]+" height="[^"]+" href="data:image\/png;base64,[^"]+"\/>/g)];
  assert.equal(photos.length,1);
  const photo=photos[0][0];
  const [,py,ph]=photo.match(/ y="([^"]+)" width="[^"]+" height="([^"]+)"/).map(Number);
  const y=side==='upper'?0:Math.floor(py/2)*2-8;
  const h=side==='upper'?Math.ceil((py+ph+70)/2)*2:1430-y;
  const render = content=>sharp(Buffer.from(wrap(1100,h,content,y)));
  const old=row.match(new RegExp('id="'+side+'-cast-shadow"[^>]*>(<image [^>]+/>)'))[1];
  const [pixels,baseline]=await Promise.all([render(photo).ensureAlpha().raw().toBuffer(),render(old).extractChannel('alpha').raw().toBuffer()]);
  const objects=await Promise.all(descriptions.map(async desc=>{
    const shape=nativePose(desc);
    const obj=await specimen(shape,pixels,h,chroma);
    assert.ok(obj.bounds[0]<=obj.bounds[2],desc.id+' is empty');
    if(shape.surface)obj.surface=field(shape.surface,h);
    return obj;
  }));
  const board=Buffer.alloc(1100*h),faces=Buffer.alloc(1100*h);
  const byId=new Map(objects.map(obj=>[obj.id,obj]));
  for(const obj of objects){
    if(!obj.faceOnly)project(obj,null,h,board,obj.strength);
    for(const id of obj.onto??[]){
      assert.ok(byId.has(id),'Missing receiving surface '+id);
      project(obj,byId.get(id),h,faces,obj.faceOnly?obj.strength:.24);
    }
  }
  // Existing contact is deepest next to the wood. Soften the supplemental
  // cast there while keeping the fine leaf pattern in the open, lit spaces.
  for(let i=0;i<board.length;i++) board[i]=Math.round(board[i]*(.92-.24*baseline[i]/255));
  const count=buf=>buf.reduce((n,v)=>n+(v>3),0);
  const surfacePixels=count(faces),boardPixels=count(board);
  assert.ok(surfacePixels>50 && boardPixels>500);
  const band={id,height:h,y};
  const wood=await layer(band,board,'wood',[61,46,28]);
  const skin=await layer(band,faces,'surfaces',[32,20,12]);
  const next=row.replace(photo,()=>wood+photo+skin);
  assert.equal(next.replace(wood,'').replace(skin,''),row);
  return {svg:svg.replace(row,()=>next),wood,skin,y,h,boardPixels,surfacePixels};
}
async function makeCover(item) {
  const source=path.join(previous,item.key),stem=path.join(destination,item.key);
  const original=await fs.readFile(source+'.svg','utf8');
  const top=await relight(original,'upper',item.upper);
  const bottom=await relight(top.svg,'lower',item.lower);
  let stripped=bottom.svg;
  for(const band of [top,bottom]) stripped=stripped.replace(band.wood,'').replace(band.skin,'');
  assert.equal(stripped,original,'All existing SVG content must survive');
  await fs.writeFile(stem+'.svg',bottom.svg);
  await sharp(Buffer.from(native(bottom.svg))).png().toFile(stem+'.png');
  const [a,b]=await Promise.all([source+'.png',stem+'.png'].map(p=>sharp(p).removeAlpha().raw().toBuffer()));
  const stride=1100*3;
  assert.ok(a.subarray(top.h*stride,bottom.y*stride).equals(b.subarray(top.h*stride,bottom.y*stride)),'Central band changed');
  const changed=(y1,y2)=>{let n=0;for(let p=y1*stride;p<y2*stride;p+=3)if(a[p]!==b[p]||a[p+1]!==b[p+1]||a[p+2]!==b[p+2])n++;return n;};
  const stats={key:item.key,upperChanged:changed(0,top.h),lowerChanged:changed(bottom.y,1430)};
  assert.ok(stats.upperChanged>500 && stats.lowerChanged>500);
  console.log(stats);
  return {...item,file:stem+'.png',stats};
}
async function makeOverview(pages,tmp) {
  const w=1260,h=915, tiles=[];
  const heading=wrap(1180,49,'<text x="0" y="36" font-family="Georgia" font-size="33" fill="#073e28">The Vegetable Guru · Harvest cover trials</text>');
  tiles.push({left:24,top:12,input:Buffer.from(heading)});
  for(const [i,page] of pages.entries()) {
    const left=24+(i%4)*310,top=76+Math.floor(i/4)*412;
    tiles.push({left,top,input:await sharp(page.file).resize(276,359,{fit:'fill'}).png().toBuffer()});
    const label=page.key.slice(0,2)+' · '+page.name;
    tiles.push({left,top:top+368,input:Buffer.from(wrap(300,32,'<text x="0" y="20" font-family="Helvetica" font-size="18" fill="#073e28">'+label+'</text>'))});
  }
  const file=path.join(tmp,'overview.jpg');
  await sharp({create:{width:w,height:h,channels:3,background:'#f3efe5'}}).composite(tiles).jpeg({quality:93,mozjpeg:true,chromaSubsampling:'4:4:4'}).toFile(file);
  return file;
}
async function build() {
  await fs.mkdir(destination,{recursive:true});
  const pages=[{key:'01-original',name:'Original harvest (reference)',file:reference}];
  for(const item of arrangements) pages.push(await makeCover(item));
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'garden-harvest-review-'));
  try{
    const imgs=[await makeOverview(pages,temp)];
    for(const page of pages) {
      const jpg=path.join(temp,page.key+'.jpg');
      await sharp(page.file).jpeg({quality:90,mozjpeg:true,chromaSubsampling:'4:4:4'}).toFile(jpg);
      imgs.push(jpg);
    }
    const pdf=path.join(destination,'The-Vegetable-Guru-Harvest-Cover-Review.pdf');
    execFileSync('swift',['-module-cache-path','/tmp/veg-preview-swift-cache',path.join(__dirname,'review.swift'),pdf,...imgs],{stdio:'inherit'});
  }finally{await fs.rm(temp,{recursive:true});}
}
build().catch(err=>{console.error(err);process.exitCode=1;});
