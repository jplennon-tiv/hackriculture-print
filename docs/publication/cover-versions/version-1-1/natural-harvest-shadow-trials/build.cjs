const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const sharp = require('sharp');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { arrangements } = require('../natural-harvest-trials/ARTWORK.json');

const root = path.resolve(__dirname, '../../../../..');
const source = path.join(root, 'output/natural-harvest-trials');
const out = path.join(root, 'output/natural-harvest-shadow-trials');
const width = 1100, height = 1430;
const photoFilter = ' filter="url(#harvest-shadow)"';
const native = svg => svg.replace('width="185mm" height="240mm"', 'width="1100" height="1430"');
const wrap = (w, h, content) => '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'">'+content+'</svg>';
const xmlImage = buffer => 'data:image/png;base64,' + buffer.toString('base64');
const clamp = v => Math.max(0, Math.min(1,v));

async function surfaceShadow(photo, band) {
  const top = band === 'upper' ? 0 : 800;
  const rows = band === 'upper' ? 500 : height-top;
  const image = wrap(width,rows,'<g transform="translate(0,-'+top+')">'+photo+'</g>');
  const alpha = await sharp(Buffer.from(image)).extractChannel('alpha').raw().toBuffer();
  const blur = sigma => sharp(alpha,{raw:{width,height:rows,channels:1}})
    .blur(sigma).greyscale().raw().toBuffer();
  const [contact, outline, mid, soft, mass] = await Promise.all([1.5,3.2,6.5,12,26].map(blur));
  // Broad, solid forms lift the silhouette farther from the wood. Lightweight
  // tips retain just a short cast. Sample along the same down-left ray in both bands.
  const sample = (map,x,y) => {
    const ix=Math.round(x), iy=Math.round(y);
    return ix>=0 && ix<width && iy>=0 && iy<rows ? map[iy*width+ix]/255 : 0;
  };
  const rgba = Buffer.alloc(width*rows*4);
  for (let y=0; y<rows; y++) {
    for (let x=0; x<width; x++) {
      const bulk = clamp((sample(mass,x+8,y-15)-0.06)/0.62);
      const reach = 0.30 + 0.70*bulk;
      const ground = sample(contact,x+1.5,y-3.5) * (0.23 + 0.26*bulk);
      const near = sample(outline,x+3.5*reach,y-8*reach) * (0.25+0.22*bulk);
      const cast = sample(mid,x+12*reach,y-20*reach) * (0.26+0.32*bulk);
      const ambient = sample(soft,x+17*reach,y-25*reach) * (0.13+0.20*bulk);
      const a = 1 - (1-ground)*(1-near)*(1-cast)*(1-ambient);
      const i=(y*width+x)*4;
      rgba[i]=54; rgba[i+1]=42; rgba[i+2]=24; rgba[i+3]=Math.round(255*a);
    }
  }
  const png = await sharp(rgba,{raw:{width,height:rows,channels:4}}).png().toBuffer();
  return '<g id="'+band+'-cast-shadow" inkscape:groupmode="layer" inkscape:label="Cast shadow on wood" opacity="1"><image x="0" y="'+top+'" width="'+width+'" height="'+rows+'" href="'+xmlImage(png)+'"/></g>';
}

function textImage(w,h,title,size,heading=false) {
  return Buffer.from(wrap(w,h,'<text x="0" y="'+size+'" fill="#073e28" font-family="'+(heading?'Georgia':'Helvetica')+'" font-size="'+size+'">'+title+'</text>'));
}
async function board(w,h,tiles) {
  return sharp({create:{width:w,height:h,channels:3,background:'#f4f0e7'}})
    .composite(tiles).png().toBuffer();
}

async function build() {
  await fs.mkdir(out,{recursive:true});
  const temp = await fs.mkdtemp(path.join(os.tmpdir(),'vegetable-shadow-pdf-'));
  const tiles=[], pages=[];
  for (const [n,item] of arrangements.entries()) {
    const base = await fs.readFile(path.join(source,item.key+'.svg'),'utf8');
    let svg=base;
    const shadowGroups=[];
    for (const [band,id] of [['upper','top-vegetables'],['lower','bottom-vegetables']]) {
      const group = new RegExp('(<g id="'+id+'"[^>]*>)(<image[^>]+/>)(</g>)');
      const match = svg.match(group);
      assert.ok(match && match[2].includes(photoFilter),'Expected the previous photo and shadow for '+id);
      const photo=match[2].replace(photoFilter,'');
      const shadow=await surfaceShadow(photo,band);
      shadowGroups.push(shadow);
      svg=svg.replace(group,()=>match[1]+shadow+photo+match[3]);
    }
    // Exact equivalence covers the images, positions, paper, wood, text, ribbon and badges.
    let clean=svg;
    for (const shadow of shadowGroups) clean=clean.replace(shadow,'');
    assert.equal(clean,base.replaceAll(photoFilter,''));
    const stem=path.join(out,item.key);
    await fs.writeFile(stem+'.svg',svg);
    await sharp(Buffer.from(native(svg))).png().toFile(stem+'.png');
    const jpg=path.join(temp,item.key+'.jpg');
    await sharp(stem+'.png').jpeg({quality:90,mozjpeg:true,chromaSubsampling:'4:4:4'}).toFile(jpg);
    pages.push(jpg);
    const left=24+(n%4)*276, top=65+Math.floor(n/4)*374;
    tiles.push({input:await sharp(stem+'.png').resize(250,325,{fit:'fill'}).png().toBuffer(),left,top},
      {input:textImage(270,35,item.name,17),left,top:top+331});
    console.log(item.name);
  }
  tiles.push({input:textImage(1060,45,'The Vegetable Guru · Shadow trials',32,true),left:24,top:11});
  const overview=await board(1126,815,tiles);
  await fs.writeFile(path.join(out,'Shadow-Trials-Overview.png'),overview);
  const grid=path.join(temp,'overview.jpg');
  await sharp(overview).jpeg({quality:92,mozjpeg:true,chromaSubsampling:'4:4:4'}).toFile(grid);
  // Two matching areas on the redrawn cover, alongside the equivalent motifs in the source.
  const comparisonTiles=[{input:textImage(1080,45,'Shadows on the cream wood',33,true),left:24,top:13}];
  const columns=[
    ['Original artwork',path.resolve(__dirname,'../layered-master/sources/cream-trial-before-restoration.png'),[[0,182],[171,1138]]],
    ['Previous trial',path.join(source,'01-original.png'),[[45,191],[190,1142]]],
    ['Revised trial',path.join(out,'01-original.png'),[[45,191],[190,1142]]]
  ];
  for (const [n,[label,file,areas]] of columns.entries()) {
    const left=24+362*n;
    comparisonTiles.push({input:textImage(350,35,label,22),left,top:75});
    for (const [j,[x,y]] of areas.entries()) {
      comparisonTiles.push({input:await sharp(file).extract({left:x,top:y,width:348,height:202}).png().toBuffer(),left,top:116+215*j});
    }
  }
  const comparison=await board(1118,550,comparisonTiles);
  const details=path.join(temp,'comparison.jpg');
  await sharp(comparison).jpeg({quality:94,mozjpeg:true,chromaSubsampling:'4:4:4'}).toFile(details);
  const target=path.join(out,'Vegetable-Guru-Shadow-Review.pdf');
  execFileSync('swift',['-module-cache-path',path.join(os.tmpdir(),'veg-preview-swift-cache'),path.join(__dirname,'review.swift'),target,details,grid,...pages],{stdio:'inherit'});
  await fs.rm(temp,{recursive:true});
}
build().catch(e=>{console.error(e);process.exitCode=1;});
