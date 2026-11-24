import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const sharp=createRequire(import.meta.url)('sharp');
const HERE=path.dirname(fileURLToPath(import.meta.url));
const width=1680,height=1558,pad=36,gap=24,tileW=520,tileH=675;
const labels=['21A · upper left','21B · top centre','21C · lower right','9A · upper left','9B · top centre','9C · lower right'];
const components=[];
const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
let overlay='<svg width="'+width+'" height="'+height+'" xmlns="http://www.w3.org/2000/svg"><style>text{font-family:Helvetica,Arial,sans-serif;fill:#254033}</style><text x="36" y="39" font-size="26" font-weight="700">Vegetable Guides — title studies</text><text x="36" y="66" font-size="17">21 · red cabbage (first choice)     /     9 · leeks (second choice)</text>';
for(let i=0;i<6;i++){
 const col=i%3,row=Math.floor(i/3),left=pad+col*(tileW+gap),top=103+row*725;
 const file=path.join(HERE,'renders/page-'+(i+1)+'.png');
 const input=await sharp(file).resize(tileW,tileH,{fit:'fill'}).png().toBuffer();
 components.push({input,left,top});
 overlay+='<text x="'+left+'" y="'+(top-12)+'" font-size="18" font-weight="700">'+esc(labels[i])+'</text>';
}
overlay+='<text x="36" y="1539" font-size="16">Trimmed page views · Title only · Layout proofs: image detail is below the 300 dpi production target</text></svg>';
components.push({input:Buffer.from(overlay),left:0,top:0});
await sharp({create:{width,height,channels:3,background:'#f3f1ea'}}).composite(components).png().toFile(path.join(HERE,'Vegetable-Guru-21-and-9-Title-Comparison.png'));
console.log('Comparison rendered from all six actual PDF pages.');

