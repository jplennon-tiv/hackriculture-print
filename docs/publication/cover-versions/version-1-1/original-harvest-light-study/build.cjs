const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const {execFileSync} = require('node:child_process');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const pose = require('./pose.cjs');

const root = path.resolve(__dirname,'../../../../..');
const master = path.resolve(__dirname,'../layered-master');
const previous = path.join(root,'output/tomato-truss-light-study/Tomato-Truss-Study');
const out = path.join(root,'output/original-harvest-light-study');
const w=1100;
const clamp = v => Math.max(0,Math.min(1,v));
const wrap = (width,height,body,y=0) => '<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 '+y+' '+width+' '+height+'">'+body+'</svg>';
const blur = (data,h,s) => sharp(data,{raw:{width:w,height:h,channels:1}}).blur(s).greyscale().raw().toBuffer();

function selectColour(type,r,g,b) {
  switch(type) {
    case 'onion': return clamp((b*.96-r*.26-3)/22);
    case 'roots': return Math.max(clamp((g-b*.90-3)/13)*clamp((r-b*.87)/20),clamp((r-1.18*g)/30)*clamp((r-b)/19));
    case 'green': return clamp((g-.88*r)/17)*clamp((g-.96*b)/21);
    case 'fronds': return clamp((g-.74*r)/19)*clamp((g-.99*b)/24);
    case 'carrot': return clamp((r-g*1.08-3)/27)*clamp((r-b*1.15)/35);
    case 'kale': return Math.max(clamp((g-.88*r)/20),clamp((b-.8*r)/17));
    default: return 1;
  }
}

// Smooth fields fitted to a handful of landmarks. Evaluate once on a coarse grid
// and interpolate for each pixel, including outside the edge of the cutout.
function field(anchors,h,spread=95) {
  const step=9,cols=Math.ceil(w/step)+2,rows=Math.ceil(h/step)+2,grid=new Float32Array(cols*rows);
  for(let y=0;y<rows;y++) for(let x=0;x<cols;x++) {
    let sum=0,weight=0;
    for(const [ax,ay,value] of anchors) {
      const d=(ax-x*step)**2+(ay-y*step)**2+spread, f=1/(d*Math.sqrt(d));
      sum+=value*f;weight+=f;
    }
    grid[y*cols+x]=sum/weight;
  }
  return (x,y)=>{
    const gx=Math.max(0,Math.min(cols-2,x/step)),gy=Math.max(0,Math.min(rows-2,y/step));
    const xx=Math.floor(gx),yy=Math.floor(gy),fx=gx-xx,fy=gy-yy,i=yy*cols+xx;
    return (grid[i]*(1-fx)+grid[i+1]*fx)*(1-fy)+(grid[i+cols]*(1-fx)+grid[i+cols+1]*fx)*fy;
  };
}

async function specimen(shape,photo,h,chooseColour=selectColour) {
  const maskSvg=wrap(w,h,'<polygon points="'+shape.polygon+'" fill="white"/>');
  const region=await sharp(Buffer.from(maskSvg)).blur(shape.feather??1.1).extractChannel('alpha').raw().toBuffer();
  let x0=w,y0=h,x1=0,y1=0;
  const mask=Buffer.alloc(w*h);
  for(let i=0;i<mask.length;i++) {
    if (!region[i] || !photo[i*4+3]) continue;
    const p=i*4;
    mask[i]=Math.round(region[i]/255*photo[p+3]*chooseColour(shape.colour,photo[p],photo[p+1],photo[p+2]));
    if (mask[i]>2) {const x=i%w,y=Math.floor(i/w);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}
  }
  const soft=await Promise.all([0.85,1.7,2.8,4.9].map(s=>blur(mask,h,s)));
  return {...shape,mask,soft,bounds:[x0,y0,x1,y1],z:field(shape.lift,h)};
}

function project(obj,receiver,h,target,weight) {
  const [x0,y0,x1,y1]=obj.bounds;
  const maxThrow=Math.ceil(Math.max(...obj.lift.map(a=>a[2])));
  const minX=Math.max(0,x0-Math.ceil(maxThrow*1.06)-12),maxX=Math.min(w-1,x1+12);
  const minY=Math.max(0,y0-12),maxY=Math.min(h-1,y1+maxThrow+12);
  for(let y=minY;y<=maxY;y++) for(let x=minX;x<=maxX;x++) {
    const i=y*w+x;
    if(receiver && !receiver.mask[i]) continue;
    const z=receiver ? (receiver.surface?.(x,y) ?? Math.min(receiver.receiver,receiver.z(x,y)*.72)) : 0;
    let d=obj.z(x,y)-z;
    for(let k=0;k<3;k++) d=obj.z(x+1.06*d,y-d)-z;
    if(d<.5) continue;
    const sx=Math.round(x+1.06*d),sy=Math.round(y-d);
    if(sx<0 || sx>=w || sy<0 || sy>=h) continue;
    const level=Math.min(3,d/17),lo=Math.floor(level),hi=Math.ceil(level),j=sy*w+sx;
    let a=(obj.soft[lo][j]+(obj.soft[hi][j]-obj.soft[lo][j])*(level-lo))*weight;
    // A different surface receives the cast. The raised feature is in front.
    if(receiver) a*=receiver.mask[i]/255*(1-obj.mask[i]/255);
    target[i]=Math.max(target[i],Math.round(a));
  }
}

async function paperSample(p) {
  const region={left:0,top:p.y,width:w,height:p.height};
  const fixed=['title','subtitle','author','youtube-sticker','measurements-sticker'];
  const alpha=await Promise.all([p.id,...fixed].map(id=>sharp(path.join(master,'assets',id+'.png'))
    .extract(region).extractChannel('alpha').raw().toBuffer()));
  const excluded=Buffer.alloc(w*p.height);
  for(let i=0;i<excluded.length;i++) {
    const x=i%w,y=Math.floor(i/w);
    excluded[i]=Math.max(...alpha.map(m=>m[i]));
    if(!p.y && (x*239/254+y<254 || (y>348 && x>265 && x<433) || y>414)) excluded[i]=255;
    if(p.y && ((x-907)**2+(y-279)**2<144**2 || (x-155)**2+(y-450)**2<101**2 || (y<117&&x>285&&x<800))) excluded[i]=255;
  }
  const blocked=await blur(excluded,p.height,4.7);
  // The median rejects small soil flecks before sampling the lighting on wood.
  const rgb=await sharp(path.join(master,'sources/cream-trial-before-restoration.png')).extract(region).removeAlpha().median(5).blur(1.5).raw().toBuffer();
  const dx=field(p.landmarks.map(([x,y,rx])=>[x,y,rx-x]),p.height,40);
  const dy=field(p.landmarks.map(([x,y,,ry])=>[x,y,ry-y]),p.height,40);
  return (x,y)=>{
    const xx=Math.round(x+dx(x,y)),yy=Math.round(y+dy(x,y));
    if(xx<0||xx>=w||yy<0||yy>=p.height)return [0,0];
    const i=yy*w+xx,j=i*3;
    const valid=clamp((30-blocked[i])/27)*clamp(xx/8)*clamp((w-1-xx)/8);
    return [clamp((247-rgb[j])/204),valid];
  };
}

async function layer(p,matte,side,colour) {
  const bytes=Buffer.alloc(matte.length*4);
  const aa=await blur(matte,p.height,.65);
  for(let i=0;i<aa.length;i++) {
    const j=i*4;
    bytes[j]=colour[0];bytes[j+1]=colour[1];bytes[j+2]=colour[2];
    bytes[j+3]=side==='surfaces'?Math.min(aa[i],matte[i]):aa[i];
  }
  const png=await sharp(bytes,{raw:{width:w,height:p.height,channels:4}}).png().toBuffer();
  const name=side==='wood'?'Cast from individual vegetables onto wood':'Shadows on neighbouring vegetables';
  return '<g id="'+p.id+'-'+side+'" inkscape:groupmode="layer" inkscape:label="'+name+'"><image x="0" y="'+p.y+'" width="'+w+'" height="'+p.height+'" href="data:image/png;base64,'+png.toString('base64')+'"/></g>';
}

async function revise(base,p) {
  const row=base.split('\n').find(s=>s.includes('<g id="'+p.id+'"'));
  const photos=[...row.matchAll(/<image x="(?!0")[^"]+" y="[^"]+" width="[^"]+" height="[^"]+" href="data:image\/png;base64,[^"]+"\/>/g)];
  assert.equal(photos.length,1);
  const photo=photos[0][0];
  const old=row.match(new RegExp('id="'+p.oldShadow+'"[^>]*>(<image [^>]+/>)'))[1];
  const render=tag=>sharp(Buffer.from(wrap(w,p.height,tag,p.y)));
  const [pixels,baseline,paper]=await Promise.all([render(photo).ensureAlpha().raw().toBuffer(),render(old).extractChannel('alpha').raw().toBuffer(),paperSample(p)]);
  const shapes=await Promise.all(p.objects.map(s=>specimen(s,pixels,p.height)));
  const board=Buffer.alloc(w*p.height),surface=Buffer.alloc(w*p.height);
  for(const s of shapes) {
    if(!s.faceOnly) project(s,null,p.height,board,s.strength);
    for(const id of s.onto??[]) project(s,shapes.find(k=>k.id===id),p.height,surface,s.faceOnly?s.strength:.23);
  }
  const near=await blur(board,p.height,15);
  for(let i=0;i<board.length;i++) {
    const x=i%w,y=Math.floor(i/w);
    const protectedEdge=411+59*clamp((y-70)/41);
    const gate=p.y ? 1 : clamp((x-protectedEdge)/22);
    if(!gate){board[i]=0;surface[i]=0;continue;}
    const base=baseline[i]/255;
    const model=1-(1-base)*(1-board[i]/255);
    const [measured,valid]=paper(x,y);
    const blend=p.referenceMix*valid*clamp((near[i]+baseline[i])/36);
    const density=model+blend*(measured-model);
    board[i]=Math.round(255*gate*clamp((density-base)/Math.max(.003,1-base)));
    surface[i]=Math.round(surface[i]*gate);
  }
  const wood=await layer(p,board,'wood',[61,46,28]);
  const veg=await layer(p,surface,'surfaces',[32,20,12]);
  const replacement=row.replace(photo,()=>wood+photo+veg);
  assert.equal(replacement.replace(wood,'').replace(veg,''),row);
  return base.replace(row,()=>replacement);
}

async function comparisons(src,dest,crops) {
  const tile=390,gap=14,band=190,width=3*tile+4*gap;
  const list=[['Original artwork',path.join(master,'sources/cream-trial-before-restoration.png')],['Truss proof',previous+'.png'],['Full shadow study',src]];
  const items=[];
  for(const [c,[label,img]] of list.entries()) {
    const left=gap+c*(tile+gap);
    items.push({left,top:8,input:Buffer.from(wrap(tile,38,'<text x="0" y="26" font-family="Helvetica" font-size="22" fill="#073e28">'+label+'</text>'))});
    for(const [r,crop] of crops.entries()) {
      const [x,y,ox,oy]=crop;
      items.push({left,top:50+r*(band+gap),input:await sharp(img).extract({left:c?x:ox,top:c?y:oy,width:tile,height:band}).png().toBuffer()});
    }
  }
  await sharp({create:{width,height:50+crops.length*(gap+band),channels:3,background:'#f4f0e7'}}).composite(items)
    .jpeg({quality:94,mozjpeg:true,chromaSubsampling:'4:4:4'}).toFile(dest);
}

async function build() {
  await fs.mkdir(out,{recursive:true});
  let svg=await fs.readFile(previous+'.svg','utf8');
  for(const band of [pose.upper,pose.lower]) svg=await revise(svg,band);
  const stem=path.join(out,'Original-Harvest-Cast-Shadows');
  await fs.writeFile(stem+'.svg',svg);
  await sharp(Buffer.from(svg.replace('width="185mm" height="240mm"','width="1100" height="1430"'))).png().toFile(stem+'.png');
  const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'veg-light-review-'));
  try {
    const page=path.join(tmp,'cover.jpg'), detail=path.join(tmp,'detail.jpg');
    await sharp(stem+'.png').jpeg({quality:93,mozjpeg:true,chromaSubsampling:'4:4:4'}).toFile(page);
    await comparisons(stem+'.png',detail,[[625,0,644,0],[465,162,457,147],[30,872,0,865],[356,1204,300,1194],[703,1225,706,1222]]);
    execFileSync('swift',['-module-cache-path','/tmp/veg-preview-swift-cache',path.join(__dirname,'review.swift'),stem+'.pdf',page,detail],{stdio:'inherit'});
  }finally{await fs.rm(tmp,{recursive:true});}
}
module.exports={specimen,project,layer,field,selectColour};
if (require.main===module) build().catch(err=>{console.error(err);process.exitCode=1;});
