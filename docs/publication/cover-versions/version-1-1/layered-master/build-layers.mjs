/** Build native layout layers from frozen pixels. No generative redraw, sharpening or resampling of photographs. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'../../../../..');
const W=1100,H=1430,N=W*H;

const assets=path.join(HERE,'assets'),sources=path.join(HERE,'sources');
await fs.mkdir(assets,{recursive:true});await fs.mkdir(sources,{recursive:true});
async function source(name, original) {
 const saved=path.join(sources,name);
 try { await fs.access(saved); } catch { await fs.copyFile(path.join(ROOT,original),saved); }
 return saved;
}
const sourceOriginal=await source('repaired-cover.png','generated_images/exec-c8bd4eb0-0092-4b0a-89dd-a6a5bb83c88e.png');
const underlayOriginal=await source('hidden-area-underlay.png','generated_images/exec-41fa538a-612f-4cd4-93fe-aaf6ff8a9cbc.png');
const original=await sharp(sourceOriginal).removeAlpha().raw().toBuffer();
const underlay=await sharp(underlayOriginal).removeAlpha().raw().toBuffer();
if(original.length!==N*3||underlay.length!==N*3)throw Error('Unexpected dimensions');
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const xml=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
function hidden(x,y){
 const diagonal=y+x*239/254;
 return (x<280&&y<260&&diagonal>139&&diagonal<245)
 || ((x-905)**2/141**2+(y-1124)**2/149**2<1)
 || ((x-155)**2/101**2+(y-1292)**2/105**2<1);
}
const photoPixels=Buffer.from(original),hiddenMask=new Uint8Array(N);
for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(hidden(x,y)){
 const i=y*W+x;hiddenMask[i]=1;underlay.copy(photoPixels,i*3,i*3,i*3+3);
}
// The background-removal result supplies alpha only. Its generated RGB is never used.
const alphaOriginal=await source('vegetable-alpha-reference.png','generated_images/exec-c4441a8f-c2dd-4284-9fda-1fec1f77cc37.png');
const alphaInfo=await sharp(alphaOriginal).metadata();
if(alphaInfo.width!==W||alphaInfo.height!==H||!alphaInfo.hasAlpha)throw Error('Unexpected alpha source');
const alpha=await sharp(alphaOriginal).extractChannel('alpha').raw().toBuffer();
const photomasks={top:new Uint8Array(N),bottom:new Uint8Array(N)};
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
 const i=y*W+x;
 // No image resampling: only alpha is transferred to the same original pixel location.
 if(y<500)photomasks.top[i]=alpha[i];
 if(y>800)photomasks.bottom[i]=alpha[i];
}
const records=[];
async function saveLayer(name,mask,pixels=original){
 const rgba=Buffer.alloc(N*4);
 for(let i=0;i<N;i++){if(!mask[i])continue;const j=i*3,k=i*4;rgba[k]=pixels[j];rgba[k+1]=pixels[j+1];rgba[k+2]=pixels[j+2];rgba[k+3]=mask[i];}
 const file=name+'.png';await sharp(rgba,{raw:{width:W,height:H,channels:4}}).png().toFile(path.join(assets,file));
 records.push({name,file:'assets/'+file,sha256:hash(await fs.readFile(path.join(assets,file))),full_canvas_px:[W,H]});return file;
}
for(const [name,mask] of Object.entries(photomasks)){
 await saveLayer(name+'-vegetables',mask,photoPixels);
 let protectedCount=0,changed=0,reconstructed=0;
 for(let i=0;i<N;i++)if(mask[i]===255){if(hiddenMask[i])reconstructed++;else{protectedCount++;const j=i*3;if(photoPixels[j]!==original[j]||photoPixels[j+1]!==original[j+1]||photoPixels[j+2]!==original[j+2])changed++;}}
 records.at(-1).visible_opaque_original_pixels=protectedCount;records.at(-1).changed_original_RGB_pixels=changed;records.at(-1).hidden_reconstructed_opaque_pixels=reconstructed;
 if(changed)throw Error('Photographic pixels changed');
}
function textAlpha(r,g,b){
 if(g+5<r||g+5<b)return 0;
 if(r<130&&b<120&&g<180)return 255;
 return Math.round(clamp((245-r)/110)*255);
}
for(const [name,region] of [
 ['title',(x,y)=>((x>=130&&x<980&&y>=414&&y<748)||(x>=270&&x<440&&y>=350&&y<440))],
 ['subtitle',(x,y)=>x>=280&&x<825&&y>=755&&y<867],
 ['author',(x,y)=>x>=320&&x<790&&y>=888&&y<960],
 ['ribbon-lettering',(x,y)=>x<275&&y<250&&y+x*239/254>155&&y+x*239/254<222]
]){
 const mask=new Uint8Array(N);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(region(x,y)){const i=y*W+x,j=i*3;mask[i]=textAlpha(original[j],original[j+1],original[j+2]);}
 await saveLayer(name,mask);
}
for(const [name,cx,cy,rx,ry] of [['youtube-sticker',905,1124,135,140],['measurements-sticker',155,1292,91,92]]){
 const mask=new Uint8Array(N);
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){
  const d=Math.sqrt(((x-cx)/rx)**2+((y-cy)/ry)**2);mask[y*W+x]=Math.round(clamp((1-d)*Math.min(rx,ry)+.5)*255);
 }
 await saveLayer(name,mask);
}
const woodOriginal=await source('cream-wood.png','generated_images/exec-fb4a9081-29b1-47d1-ac9e-fa5efd45a8c1.png');
await fs.copyFile(woodOriginal,path.join(assets,'wood-texture.png'));
const images={};for(const p of [...records.map(r=>r.file),'assets/wood-texture.png'])images[path.basename(p,'.png')]='data:image/png;base64,'+(await fs.readFile(path.join(HERE,p))).toString('base64');
const defaults={width:W,height:H,trim_mm:[185,240],paper:'#fcf1df',ribbon:'#f2cc35',wood_opacity:.38};
const configPath=path.join(HERE,'layout.json');
let config;try{config={...defaults,...JSON.parse(await fs.readFile(configPath,'utf8'))};}catch{config=defaults;await fs.writeFile(configPath,JSON.stringify(config,null,2)+'\n');}
const defs=`<defs>
 <filter id="wood-grey"><feColorMatrix type="saturate" values="0"/></filter>
 <filter id="contact" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="1" dy="4" stdDeviation="4" flood-color="#493c29" flood-opacity=".18"/></filter>
 <filter id="badge-shadow" x="-15%" y="-15%" width="130%" height="130%"><feDropShadow dx="1" dy="4" stdDeviation="3" flood-color="#342b1d" flood-opacity=".24"/></filter>
 </defs>`;
const groups=[];
const add=(id,label,body)=>groups.push({id,label,body});
add('paper-colour','01 Paper colour',`<rect width="${W}" height="${H}" fill="${config.paper}"/>`);
add('wood-grain','02 Scrubbed wood texture',`<image href="${images['wood-texture']}" width="${W}" height="${H}" preserveAspectRatio="none" filter="url(#wood-grey)" opacity="${config.wood_opacity}" style="mix-blend-mode:multiply"/>`);
for(const [id,label] of [['top-vegetables','03 Top photographic vegetables'],['bottom-vegetables','04 Bottom photographic vegetables']])add(id,label,`<image href="${images[id]}" width="${W}" height="${H}"${id==='top-vegetables'?' filter="url(#contact)"':''}/>`);
for(const [id,label] of [['title','05 Title artwork'],['subtitle','06 Subtitle artwork'],['author','07 Author artwork']])add(id,label,`<image href="${images[id]}" width="${W}" height="${H}"/>`);
add('organic-ribbon','08 Organic ribbon — editable fill',`<path d="M0 143 L153 0 H254 L0 239 Z" fill="${config.ribbon}" filter="url(#badge-shadow)"/><image href="${images['ribbon-lettering']}" width="${W}" height="${H}"/>`);
for(const [id,label] of [['youtube-sticker','09 YouTube sticker'],['measurements-sticker','10 Traditional measurements sticker']])add(id,label,`<image href="${images[id]}" width="${W}" height="${H}" filter="url(#badge-shadow)"/>`);
const head=`<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="185mm" height="240mm" viewBox="0 0 ${W} ${H}"><title>The Vegetable Guru — cream cover layered working master</title><desc>Ten independently movable layout layers. Photographic RGB pixels preserved; hidden areas reconstructed separately. Lettering is preserved graphic artwork, not live editable text. Native source resolution 1100 by 1430.</desc>${defs}`;
const svg=head+groups.map(g=>`<g id="${g.id}" inkscape:groupmode="layer" inkscape:label="${xml(g.label)}">${g.body}</g>`).join('\n')+'</svg>';
await fs.writeFile(path.join(HERE,'Vegetable-Guru-Layered-Master.svg'),svg);
const nativeSvg=s=>s.replace('width="185mm" height="240mm"',`width="${W}" height="${H}"`);
await sharp(Buffer.from(nativeSvg(svg))).png().toFile(path.join(HERE,'Layered-Master-Preview.png'));
await fs.mkdir(path.join(HERE,'ora-layers'),{recursive:true});
for(let i=0;i<groups.length;i++){
 const g=groups[i],single=head+`<g id="${g.id}">${g.body}</g></svg>`;
 await sharp(Buffer.from(nativeSvg(single))).png().toFile(path.join(HERE,'ora-layers',String(i+1).padStart(2,'0')+'-'+g.id+'.png'));
}
// Diagnostic alternative colours prove that the background and ribbon are independent.
const diagnostic=svg.replace(`fill="${config.paper}"`,'fill="#354a66"').replace(`fill="${config.ribbon}"`,'fill="#d83b25"');
await sharp(Buffer.from(nativeSvg(diagnostic))).png().toFile('/tmp/vg-layer-dark-background-check.png');
const manifest={date:'2026-11-16',status:'Layered technical master; visual/user review pending',source:path.relative(HERE,sourceOriginal),source_sha256:hash(await fs.readFile(sourceOriginal)),underlay:path.relative(HERE,underlayOriginal),underlay_sha256:hash(await fs.readFile(underlayOriginal)),native_px:[W,H],layers:groups.map((g,i)=>({index:i+1,id:g.id,label:g.label,ora_file:'ora-layers/'+String(i+1).padStart(2,'0')+'-'+g.id+'.png'})),assets:records,alpha_reference:{source:path.relative(HERE,alphaOriginal),sha256:hash(await fs.readFile(alphaOriginal)),usage:'Alpha only; generated RGB discarded. No bottom-group drop shadow.'},background:{source:path.relative(HERE,woodOriginal),sha256:hash(await fs.readFile(woodOriginal)),display:'Separate cream fill and subdued grayscale wood texture from a dedicated full-portrait background.'},limitations:['Previously obscured areas are reconstructed; not recovered original camera pixels.','Photographic RGB pixels in visible opaque regions are unchanged; transparency mattes are new. Bottom-group cast and contact shadows removed; top-group contact shadow retained.','Lettering is preserved as separately movable graphic artwork, not editable font text.','Native photographic resolution remains 1100 x 1430; not a final high-resolution print master.']};
await fs.writeFile(path.join(HERE,'LAYERS.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({layers:groups.length,source_pixels_changed:0,svg:path.join(HERE,'Vegetable-Guru-Layered-Master.svg'),preview:path.join(HERE,'Layered-Master-Preview.png')}));
