const fs = require('node:fs/promises');
const path = require('node:path');
const assert = require('node:assert/strict');
const sharp = require('sharp');
const os = require('node:os');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '../../../../..');
const previous = path.join(root,'output/natural-harvest-shadow-trials/01-original');
const reference = path.resolve(__dirname,'../layered-master/sources/cream-trial-before-restoration.png');
const out = path.join(root,'output/tomato-truss-light-study');
const width=505, height=455, raw={width,height,channels:1};
const clamp = v => Math.max(0,Math.min(1,v));
const wrap = (w,h,content) => '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'">'+content+'</svg>';

// Image-space fruit ellipses, in front-to-back order. The final value is the
// maximum downwards shadow throw at the dome's apex under the reference light.
const fruit = [
  [124,270,52,50,76], [287,274,76,66,94], [426,290,49,48,71],
  [386,215,53,68,97], [207,195,89,86,119], [337,112,79,79,123]
];
function skinHeight(x,y) {
  let nearest=Infinity, outsideHeight=0;
  for (const [cx,cy,rx,ry,h] of fruit) {
    const r2=((x-cx)/rx)**2+((y-cy)/ry)**2;
    if (r2<1) return h*(0.40+0.60*Math.sqrt(1-r2));
    if (r2<nearest) {nearest=r2; outsideHeight=h*0.40;}
  }
  return nearest < 1.18 ? outsideHeight : 0;
}

// Heights belong to this particular pose. The long branch lifts between calyx
// attachments. The loose sprig in front rests close to the tabletop.
const vineAnchors = [
  [95,40,133], [97,110,128], [84,207,91], [178,84,139], [216,120,142],
  [283,28,144], [307,88,148], [242,171,150], [287,235,80],
  [324,184,135], [374,175,92], [375,215,120], [411,248,96], [421,270,73]
];
function vineHeight(x,y) {
  if (x<182 && y>277) return 4+11*clamp((y-285)/110);
  let sum=0, weight=0;
  for (const [sx,sy,z] of vineAnchors) {
    const w=1/((x-sx)**2+(y-sy)**2+60)**1.5;
    sum+=z*w; weight+=w;
  }
  return sum/weight;
}
function mattes(photo) {
  const count=width*height;
  const vine=Buffer.alloc(count), skin=Buffer.alloc(count);
  const caster=new Float32Array(count), receiver=new Float32Array(count);
  for (let i=0;i<count;i++) {
    const x=i%width,y=Math.floor(i/width);
    const [r,g,b,a]=photo.subarray(4*i,4*i+4);
    const trussArea=x<470 && !(x>400 && y<145) && !(x>453 && y<245);
    // In this photograph the olive branches, fine sepals and leaflets separate
    // chromatically from tomato skins. The local gate excludes the neighbouring onion.
    const stem=trussArea ? clamp((g-0.78*r-1)/(0.17*Math.max(g,20)))*clamp((g-1.08*b-1)/15) : 0;
    vine[i]=Math.round(a*stem);
    const z=skinHeight(x,y);
    const warm=clamp((r-g-5)/24)*clamp((g-0.77*b)/16);
    skin[i]=trussArea && z>0 ? Math.round(a*(1-stem)*warm) : 0;
    receiver[i]=z;
    caster[i]=vineHeight(x,y);
  }
  return {vine,skin,caster,receiver};
}
// Corresponding points on the outlines of the original and redrawn fruit.
// Store current x/y, then reference x/y. The stems themselves changed pose.
const landmarks = [
  [74,269,27,255],[121,316,78,307],[168,274,124,256],
  [126,199,86,185],[200,278,159,260],[210,119,160,107],
  [217,272,187,257],[284,336,251,321],[357,273,319,255],
  [380,288,351,269],[425,333,395,319],[469,289,440,271],
  [275,77,252,70],[339,36,312,24],[405,112,384,99],
  [419,168,405,158],[141,327,96,325],[166,398,124,422],
  [82,371,40,376],[51,143,8,132]
];
async function originalLight() {
  const region={left:0,top:0,width,height};
  const rgb=await sharp(reference).extract(region).removeAlpha().blur(1.05).raw().toBuffer();
  const mask=await sharp(path.resolve(__dirname,'../layered-master/assets/top-vegetables.png'))
    .extract(region).extractChannel('alpha').raw().toBuffer();
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
    if(x*239/254+y<248 || (y>350 && x>266) || (y>414 && x>125)) mask[y*width+x]=255;
  }
  const blocked=await sharp(mask,{raw}).blur(3.8).greyscale().raw().toBuffer();
  return (x,y)=>{
    let weight=0,dx=0,dy=0;
    for (const [tx,ty,sx,sy] of landmarks) {
      const w=1/((x-tx)**2+(y-ty)**2+20)**1.35;
      weight+=w; dx+=w*(sx-tx); dy+=w*(sy-ty);
    }
    const sx=Math.round(x+dx/weight),sy=Math.round(y+dy/weight);
    if(sx<0 || sx>=width || sy<0 || sy>=height) return [0,0];
    const i=sy*width+sx;
    const valid=clamp((36-blocked[i])/32)*clamp(sx/12)*clamp((470-x)/27);
    const darkness=clamp((247-rgb[i*3])/204);
    return [darkness,valid];
  };
}
// Trace from each receiver back toward the light. The wood has zero height.
// Fruit heights vary across their domes, bending and shortening the same cast.
async function plates(photo,previousBoard) {
  const original=await originalLight();
  const {vine,skin,caster,receiver}=mattes(photo);
  const sigmas=[0.8,1.4,2.2,3.3,4.8];
  const softened=await Promise.all(sigmas.map(s=>sharp(vine,{raw}).blur(s).greyscale().raw().toBuffer()));
  const board=Buffer.alloc(width*height), fruitFace=Buffer.alloc(width*height);
  const dx=1.06, max=156;
  function trace(x,y,z) {
    let maximum=0;
    for (let d=0;d<=max-z;d++) {
      const sx=x+Math.round(d*dx), sy=y-d;
      if (sx>=width || sy<0) break;
      const i=sy*width+sx;
      if (Math.abs(caster[i]-z-d)>1.6) continue;
      const level=Math.min(4,d/32), lo=Math.floor(level), hi=Math.ceil(level);
      const alpha=softened[lo][i]+(softened[hi][i]-softened[lo][i])*(level-lo);
      maximum=Math.max(maximum,alpha);
    }
    return maximum;
  }
  for (let y=0;y<height;y++) for(let x=0;x<width;x++) {
    const i=y*width+x;
    // A tomato shades a pool of wood beneath its rounded shoulder. The low
    // body cast overlaps the fine vine casts, leaving irregular light windows.
    let shade=0;
    for (const [cx,cy,rx,ry] of fruit) {
      const sx=(x-cx+0.48*rx)/(0.96*rx), sy=(y-cy-0.55*ry)/(0.69*ry);
      const edge=Math.sqrt(sx*sx+sy*sy);
      const penumbra=clamp((1.23-edge)/0.50);
      const pool=0.39*penumbra*penumbra*(3-2*penumbra);
      shade=Math.max(shade,pool);
    }
    const leaf=trace(x,y,0)/255*0.46;
    const base=previousBoard[i]/255;
    const constructed=1-(1-base)*(1-shade)*(1-leaf);
    const [measured,valid]=original(x,y);
    // Transfer only the light falling on exposed original wood, never its RGB or
    // any original vegetable. Retain a contribution from the actual redrawn vine.
    const mixed=constructed+(measured-constructed)*valid*0.67;
    board[i]=Math.round(255*clamp((mixed-base)/Math.max(0.002,1-base)));
    if(skin[i]) fruitFace[i]=Math.round(trace(x,y,receiver[i])*0.24*skin[i]/255);
  }
  return Promise.all([board,fruitFace].map(async (matte,n)=>{
    const aa=await sharp(matte,{raw}).blur(0.65).greyscale().raw().toBuffer();
    const rgba=Buffer.alloc(width*height*4);
    for(let i=0;i<aa.length;i++){
      // The face plate cannot darken the green truss, onion or gaps.
      rgba[i*4]=n?32:61; rgba[i*4+1]=n?20:46; rgba[i*4+2]=n?12:28;
      rgba[i*4+3]=n?Math.min(aa[i],skin[i]):aa[i];
    }
    return sharp(rgba,{raw:{width,height,channels:4}}).png().toBuffer();
  }));
}
function layer(id,label,png) {
  return '<g id="'+id+'" inkscape:groupmode="layer" inkscape:label="'+label+'"><image width="'+width+'" height="'+height+'" href="data:image/png;base64,'+png.toString('base64')+'"/></g>';
}
async function build() {
  await fs.mkdir(out,{recursive:true});
  const base=await fs.readFile(previous+'.svg','utf8');
  const band=base.split('\n').find(s=>s.includes('<g id="top-vegetables"'));
  const photo=band.match(/(<image [^>]+\/>)(?=<\/g>$)/)[1];
  const pixels=await sharp(Buffer.from(wrap(width,height,photo))).ensureAlpha().raw().toBuffer();
  const oldLayer=band.match(/id="upper-cast-shadow"[^>]*>(<image [^>]+\/>)/)[1];
  const oldAlpha=await sharp(Buffer.from(wrap(width,height,oldLayer))).extractChannel('alpha').raw().toBuffer();
  const [wood,skin]=await plates(pixels,oldAlpha);
  const onBoard=layer('tomato-truss-on-board','Tomato truss cast on wood',wood);
  const onFruit=layer('tomato-truss-on-fruit','Tomato foliage cast on fruit',skin);
  const svg=base.replace(band,()=>band.replace(photo,()=>onBoard+photo+onFruit));
  assert.equal(svg.replace(onBoard,'').replace(onFruit,''),base);
  const file=path.join(out,'Tomato-Truss-Study');
  await fs.writeFile(file+'.svg',svg);
  await sharp(Buffer.from(svg.replace('width="185mm" height="240mm"','width="1100" height="1430"'))).png().toFile(file+'.png');
  const sources=[['Original artwork',reference],['Previous trial',previous+'.png'],['Truss shadow study',file+'.png']];
  const tiles=[], cardWidth=486, cardHeight=430, margin=15;
  for(const [n,[label,src]] of sources.entries()) {
    const left=margin+n*(cardWidth+margin);
    const text=wrap(cardWidth,42,'<text x="0" y="29" font-family="Helvetica" font-size="23" fill="#073e28">'+label+'</text>');
    tiles.push({input:Buffer.from(text),left,top:6},
      {input:await sharp(src).extract({left:0,top:0,width:cardWidth,height:cardHeight}).png().toBuffer(),left,top:52});
  }
  await sharp({create:{width:3*cardWidth+4*margin,height:cardHeight+67,channels:3,background:'#f4f0e7'}})
    .composite(tiles).jpeg({quality:94,mozjpeg:true,chromaSubsampling:'4:4:4'}).toFile(path.join(out,'Tomato-Truss-Comparison.jpg'));
  const scratch=await fs.mkdtemp(path.join(os.tmpdir(),'vegetable-truss-proof-'));
  try {
    const page=path.join(scratch,'cover.jpg');
    await sharp(file+'.png').jpeg({quality:93,mozjpeg:true,chromaSubsampling:'4:4:4'}).toFile(page);
    execFileSync('swift',['-module-cache-path','/tmp/veg-preview-swift-cache',path.join(__dirname,'review.swift'),
      path.join(out,'Tomato-Truss-Shadow-Review.pdf'),path.join(out,'Tomato-Truss-Comparison.jpg'),page],{stdio:'inherit'});
  } finally {
    await fs.rm(scratch,{recursive:true});
  }
}
build().catch(e=>{console.error(e);process.exitCode=1;});
