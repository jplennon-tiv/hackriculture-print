/** Package existing rendered layers as a lossless, editable Photoshop PSD. */
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
const HERE=path.dirname(fileURLToPath(import.meta.url));
const manifest=JSON.parse(await fs.readFile(path.join(HERE,'LAYERS.json'),'utf8'));
const [W,H]=manifest.native_px,N=W*H;
const u16=n=>{const b=Buffer.alloc(2);b.writeUInt16BE(n);return b;};
const i16=n=>{const b=Buffer.alloc(2);b.writeInt16BE(n);return b;};
const u32=n=>{const b=Buffer.alloc(4);b.writeUInt32BE(n);return b;};
const ascii=s=>Buffer.from(s,'ascii');
const cat=parts=>Buffer.concat(parts);
const lengthPrefixed=b=>cat([u32(b.length),b]);
function pascalName(s){
 const t=Buffer.from(s.replaceAll('—','-'),'ascii').subarray(0,255);
 const b=Buffer.alloc(Math.ceil((1+t.length)/4)*4);b[0]=t.length;t.copy(b,1);return b;
}
const records=[],channelData=[];
for(const layer of [...manifest.layers].reverse()){
 const raw=await sharp(path.join(HERE,layer.ora_file)).ensureAlpha().raw().toBuffer();
 if(raw.length!==N*4)throw Error('Layer dimensions differ');
 const channels=[];
 for(const [id,index] of [[0,0],[1,1],[2,2],[-1,3]]){
  const plane=Buffer.alloc(N);for(let i=0;i<N;i++)plane[i]=raw[i*4+index];
  channels.push(cat([i16(id),u32(N+2)]));channelData.push(cat([u16(0),plane]));
 }
 const extra=cat([u32(0),u32(0),pascalName(layer.label)]);
 records.push(cat([u32(0),u32(0),u32(H),u32(W),u16(4),...channels,ascii('8BIM'+(layer.id==='wood-grain'?'mul ':'norm')),Buffer.from([255,0,0,0]),lengthPrefixed(extra)]));
}
let layerInfo=cat([i16(records.length),...records,...channelData]);
if(layerInfo.length%2)layerInfo=cat([layerInfo,Buffer.alloc(1)]);
const layerAndMask=cat([lengthPrefixed(layerInfo),u32(0)]);
// ResolutionInfo: native resolution at the requested trim, kept without upscaling.
const resolution=cat([u32(Math.round(W/185*25.4*65536)),u16(1),u16(1),u32(Math.round(H/240*25.4*65536)),u16(1),u16(1)]);
const resources=cat([ascii('8BIM'),u16(1005),Buffer.alloc(2),lengthPrefixed(resolution)]);
const preview=await sharp(path.join(HERE,'Layered-Master-Preview.png')).removeAlpha().raw().toBuffer();
const planes=[];for(let c=0;c<3;c++){const b=Buffer.alloc(N);for(let i=0;i<N;i++)b[i]=preview[i*3+c];planes.push(b);}
const output=cat([ascii('8BPS'),u16(1),Buffer.alloc(6),u16(3),u32(H),u32(W),u16(8),u16(3),u32(0),lengthPrefixed(resources),lengthPrefixed(layerAndMask),u16(0),...planes]);
await fs.writeFile(path.join(HERE,'Vegetable-Guru-Layered-Master.psd'),output);
await sharp(path.join(HERE,'Layered-Master-Preview.png')).resize({width:256,height:256,fit:'inside'}).png().toFile(path.join(HERE,'ora-layers/thumbnail.png'));
console.log(JSON.stringify({format:'PSD',layers:records.length,bytes:output.length,compression:'lossless raw channel data',photographic_resampling:false}));
