// Original editable vector pilot. Production mappings and approved artwork are untouched.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import sharp from 'sharp';
import {revision} from '../../../hackriculture-data/lib/records.mjs';
const dir='public/images/icon-pilot/monochrome-v2';fs.mkdirSync(dir,{recursive:true});
const before=revision(),ink='#30352f',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const audit=JSON.parse(fs.readFileSync('docs/icon-pilot/MONOCHROME-AUDIT.json'));
const locked=JSON.parse(fs.readFileSync('docs/icon-pilot/COLOURED-SET-APPROVAL.json'));
const originals=new Map(audit.assets.map(a=>[a.path,a.sha256]));
for(const a of locked.icons)for(const ext of ['svg','png'])originals.set(`public/images/coloured-icons/style-a-v1/${a.key}.${ext}`,a[`${ext}_sha256`]);
const guard=()=>{for(const[p,h]of originals)assert.equal(sha(fs.readFileSync(p)),h,p);assert.equal(revision(),before);};guard();
const shape=d=>`<path d="${d}"/>`;
const line=(d,w=4)=>`<path d="${d}" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const ellipse=(x,y,rx,ry)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`;
let cutId=0;
const cut=(body,cuts)=>{const id="cut"+(++cutId);return `<defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="96" height="96"><rect width="96" height="96" fill="white"/><g fill="none" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">${cuts}</g></mask></defs><g mask="url(#${id})">${body}</g>`;};
const incision=d=>`<path d="${d}"/>`;
const entries=[
 ['aphid','Aphid','risk','aphid','Pear-shaped body, six legs, antennae and two short rear tubes. Fewer fine marks; a clear insect silhouette.',
  line('M39 24L29 13L21 10M57 24L67 13L75 10M34 38L22 30L12 35M62 38L74 30L84 35M29 50L17 49L9 61M67 50L79 49L87 61M32 66L21 73L22 86M64 66L75 73L74 86',4.5)+cut(ellipse(48,26,12,10)+shape('M36 34C32 42 24 53 27 65C30 79 39 85 48 85C57 85 66 79 69 65C72 53 64 42 60 34Z')+line('M35 65L31 78M61 65L65 78',5),incision('M38 37Q48 41 58 37M37 49Q34 61 40 67'))],
 ['frost','Frost','risk','frost','One bold six-armed snowflake. Recognisable without a leaf or tiny scattered stars.',
  line('M48 9V87M14 28L82 68M14 68L82 28M36 16L48 28L60 16M36 80L48 68L60 80M15 41L31 38L27 22M69 74L65 58L81 55M15 55L31 58L27 74M69 22L65 38L81 41',5)],
 ['mildew','Mildew','risk','powdery_mildew','Three broad powder-like patches cut through a leaf. A general mildew cue, not a species-level diagnosis.',
  cut(shape('M20 75C9 52 22 23 48 16C60 12 73 11 84 10C85 34 79 57 66 70C54 83 35 87 20 75Z'),
  '<path fill="black" stroke="none" d="M39 28C40 21 51 23 52 28C61 27 65 36 58 40C57 48 47 48 44 42C34 44 30 32 39 28ZM63 47C67 42 74 48 71 53C77 58 69 65 64 61C58 67 53 58 58 54C54 49 59 44 63 47ZM29 57C33 51 40 54 40 59C48 58 50 67 43 70C41 78 31 76 31 71C24 72 20 62 29 57Z"/>')+line('M12 87L23 74',5)],
 ['clubroot','Clubroot','risk','club_root','Swollen, club-shaped root lobes beneath a small crown. Clearly different from a healthy branching root.',
  line('M48 17V38M13 37H31M65 37H83',4)+shape('M46 25C29 25 22 17 24 8C38 7 46 14 46 25ZM50 24C49 11 61 7 74 10C72 21 62 27 50 24Z')+
  shape('M43 33H54L55 42C65 41 71 49 68 57C78 61 76 75 67 76C67 86 56 91 51 82L48 63L43 69C42 81 34 88 28 82C23 77 29 69 31 65C20 66 17 57 22 51C26 46 33 46 38 45Z')+
  line('M25 80L21 87M64 84L67 90',3.5)],
 ['poor_germination','Poor germination','risk','poor_germination','A sparsely emerged row: one seedling over three seeds. Reserved for emergence, not bitterness or soft tubers.',
  line('M11 51H85M27 50V31',4)+shape('M27 34C11 34 10 23 12 19C23 18 29 25 27 34ZM28 30C29 17 39 15 47 17C46 28 38 34 28 30Z')+
  cut(ellipse(26,68,7,10),incision('M28 61L24 68L28 74'))+ellipse(51,68,7,10)+ellipse(76,68,7,10)+line('M26 77L23 86',3.5)],
 ['small_roots','Small roots','risk','forked_root','A short, single root with a short depth marker. A new meaning, separate from the forked-root symbol currently used.',
  shape('M45 39C23 37 19 20 23 13C38 13 45 25 45 39ZM49 35C46 18 58 11 71 12C72 24 62 35 49 35Z')+line('M46 30V46M15 47H32M63 47H83',4)+
  cut(shape('M34 45Q46 41 60 45C62 58 58 71 47 78C37 72 31 59 34 45Z'),incision('M36 53H44M54 62H59'))+line('M76 54V78M70 54H82M70 78H82',3.5)],
 ['broccoli','Broccoli','crop','broccoli','A clustered crown above a clear branching stalk. Broad cuts replace fine botanical texture.',
  cut(shape('M30 44L43 60L37 87H60L54 60L68 43Z')+shape('M17 51C5 48 6 30 18 26C17 15 31 9 40 16C47 5 62 9 67 19C82 15 93 32 84 41C91 53 76 62 66 53C55 61 42 55 37 49C32 58 21 57 17 51Z'),incision('M33 42L48 61L63 41M48 62V79M19 32Q22 26 28 29M45 22Q51 17 57 24M69 32Q76 29 79 36'))],
 ['cauliflower','Cauliflower','crop','cauliflower','A rounded curd held by two large wrapper leaves. Distinct from both cabbage and broccoli.',
  cut(shape('M22 55C13 47 16 34 24 32C20 21 32 14 40 18C47 7 62 12 64 23C77 18 86 29 79 39C90 44 85 58 75 61L49 75Z')+
  shape('M9 41C27 42 42 53 48 75C54 54 70 43 88 41C88 63 75 85 48 89C22 85 10 66 9 41Z'),incision('M19 49Q38 57 48 78Q59 57 78 49M28 35Q31 29 37 34M44 24Q50 20 54 26M58 38Q64 32 70 39M37 46Q44 39 50 46'))],
 ['lettuce','Lettuce','crop','lettuce','A broad open head with nested, ruffled leaves. A deliberate head shape rather than a fine fern-like clump.',
  cut(shape('M17 70C8 66 8 55 14 49C4 36 12 25 23 27C21 14 35 9 43 17C52 6 66 11 67 22C82 17 90 30 82 41C94 47 91 61 81 65C83 78 69 88 57 84C48 93 34 86 31 81C23 86 12 79 17 70Z'),incision('M22 34C18 46 24 61 40 72M70 30C80 45 70 63 57 73M35 26C27 38 33 53 46 59M57 24C67 35 62 46 51 50M22 58Q28 69 38 72M72 58Q68 70 58 74M39 76Q48 80 57 76'))],
 ['leek','Leek','crop','leek','A substantial shaft, broad fan of leaves and a few roots. Diagonal composition uses the slot more effectively.',
  '<g transform="rotate(25 48 48)">'+cut(shape('M39 57L17 17Q31 16 41 40L37 8Q48 6 49 45L60 9Q71 13 59 49L80 25Q87 33 59 59L58 78Q48 85 38 78Z'),incision('M44 43L46 58M56 42L51 58M44 63V74M52 63V74'))+line('M40 80L34 88M46 83L43 91M52 83L55 91M58 80L64 88',3.5)+'</g>'],
 ['cucumber','Greenhouse cucumber','crop','cucumber_greenhouse','A long smooth fruit set diagonally, with two broad ridges and a short stem. Outdoor cucumber remains a separate later drawing.',
  line('M70 22C75 10 84 20 87 9',4)+cut(shape('M61 21C71 16 84 26 80 38C75 53 48 81 33 87C19 92 9 77 16 65C25 50 45 29 61 21Z'),incision('M63 31C49 42 31 62 24 76M72 36C63 51 46 69 34 79'))],
 ['salsify_scorzonera','Salsify / scorzonera','crop','salsify_scorzonera','Two long slender roots and strap-like leaves. A shared crop cue without the thick cone and feathery top of a carrot.',
  shape('M36 37C25 27 21 14 26 6C34 15 38 25 38 35C38 20 44 9 51 7C53 20 47 30 41 38C51 28 61 25 67 28C62 36 53 41 41 43Z')+
  cut(shape('M31 39Q36 35 42 41C42 52 34 73 22 91C26 68 26 48 31 39Z'),incision('M31 52L35 53M28 65L31 66'))+
  shape('M62 43C53 39 50 31 52 24C62 28 65 35 65 42C65 27 72 16 79 15C81 29 72 39 68 44C77 37 84 37 89 40C83 47 75 49 67 49Z')+
  cut(shape('M57 46Q63 42 68 48C65 63 53 80 40 91C48 72 51 57 57 46Z'),incision('M57 59L61 61M51 71L54 73'))]
];
const checks=[],icons=[];
for(const [key,label,family,oldKey,meaning,body]of entries){
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="384" height="384" role="img" aria-label="${label.replaceAll('&','&amp;')}"><g fill="currentColor" style="color:var(--icon-color,${ink})">${body}</g></svg>\n`;
 fs.writeFileSync(`${dir}/${key}.svg`,svg);await sharp(Buffer.from(svg)).png().toFile(`${dir}/${key}.png`);
 const {data,info}=await sharp(`${dir}/${key}.png`).ensureAlpha().raw().toBuffer({resolveWithObject:true});let clear=0,painted=0,edge=0;const colors=new Set();
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const p=(y*info.width+x)*4,a=data[p+3];if(!a)clear++;else{painted++;if(a===255)colors.add([...data.subarray(p,p+3)].join(','));if(!x||!y||x===info.width-1||y===info.height-1)edge++;}}
 assert.ok(clear>0&&painted>0);assert.equal(edge,0,key);for(const color of colors)assert.ok(color.split(',').every((v,i)=>Math.abs(Number(v)-[48,53,47][i])<=1),key+' has a second ink colour');
 checks.push({key,width:info.width,height:info.height,clear,painted,edge,opaque_colors:[...colors]});
 icons.push({key,label,family,meaning,old:`/images/${family==='risk'?'key_risks':'vegetable_icons'}/${oldKey}.png`,svg:`/images/icon-pilot/monochrome-v2/${key}.svg`,png:`/images/icon-pilot/monochrome-v2/${key}.png`,sha256:sha(Buffer.from(svg))});
}
assert.equal(icons.length,12);guard();
fs.writeFileSync('docs/icon-pilot/MONOCHROME-PILOT-MANIFEST.json',JSON.stringify({status:'pilot_for_review',style:'Rounded botanical silhouette with broad transparent cutouts',authoring:'Original AI-assisted SVG path construction',shared_revision:before,icons},null,2)+'\n');
fs.writeFileSync('docs/icon-pilot/MONOCHROME-PILOT-CHECKS.json',JSON.stringify({status:'asset_checks_passed',shared_data_unchanged:true,production_and_approved_artwork_unchanged:originals.size,checks},null,2)+'\n');
let unique=0;
function drawing(i,size,color){const suffix='-'+(++unique);return fs.readFileSync('public'+i.svg,'utf8').replace('width="384" height="384"',`width="${size}" height="${size}"`).replace('var(--icon-color,#30352f)',color).replace(/id="(cut\d+)"/g,(_,id)=>`id="${id}${suffix}"`).replace(/url\(#(cut\d+)\)/g,(_,id)=>`url(#${id}${suffix})`);}
async function cards(family){let out='';for(const i of icons.filter(i=>i.family===family)){
 const size=family==='risk'?32:34,color=family==='risk'?'#30352f':i.key==='cucumber'?'#C6402D':i.key==='leek'?'#7B5A92':i.key==='salsify_scorzonera'?'#D85B00':i.key==='lettuce'?'#1A7A5E':'#2F7D32';
 const thumb='data:image/png;base64,'+(await sharp('public'+i.old).resize(128,128,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toBuffer()).toString('base64');
 const old=n=>family==='risk'?`<img src="${thumb}" width="${n}" height="${n}" alt="Current ${i.label}">`:`<span class="mask" style="width:${n}px;height:${n}px;background:${color};mask-image:url('${thumb}');-webkit-mask-image:url('${thumb}')"></span>`;
 out+=`<article><h3>${i.label}</h3><div class="comparison"><div><span class="tag">Current</span><div class="art">${old(86)}</div><div class="small">${old(size)}<small>${size}px</small></div></div><div><span class="tag">Pilot</span><div class="art">${drawing(i,86,color)}</div><div class="small">${drawing(i,size,color)}<small>${size}px</small></div></div></div><p>${i.meaning}</p><div class="links"><a href="../../public${i.svg}">SVG</a> · <a href="../../public${i.png}">PNG</a></div></article>`;
 }return out;}
const html=`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Monochrome icon pilot · twelve drawings</title><style>*{box-sizing:border-box}body{margin:0;background:#f4f2eb;color:#293a2f;font:15px/1.5 system-ui}main{max-width:1320px;margin:auto;padding:32px}h1{font:600 35px/1.2 Georgia;margin:8px 0 18px}h2{font:600 26px Georgia;margin:32px 0 14px}.eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:.15em}.intro{max-width:960px}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}article{background:var(--paper,#fffdf8);border:1px solid #d1d9ca;border-radius:10px;padding:16px 18px}h3{font-size:17px;margin:0 0 12px}.comparison{display:grid;grid-template-columns:1fr 1fr;text-align:center;gap:16px}.comparison>div+div{border-left:1px solid #dbe0d4;padding-left:16px}.tag{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:#65705e}.art{height:100px;display:flex;align-items:center;justify-content:center}.small{display:flex;align-items:center;justify-content:center;gap:9px;height:48px}small{font-size:10px;color:#64705e}article p{font-size:12px;min-height:54px;margin:12px 0 8px}.links{font-size:11px}a{color:#35613e}.mask{display:inline-block;mask-size:contain;mask-repeat:no-repeat;mask-position:center;-webkit-mask-size:contain;-webkit-mask-repeat:no-repeat;-webkit-mask-position:center}.controls{display:flex;gap:10px;flex-wrap:wrap;margin:20px 0}button{padding:8px 14px;background:white;border:1px solid #acb99f;border-radius:5px;font:inherit;cursor:pointer}.check .art,.check .small{background:repeating-conic-gradient(#e0e5da 0% 25%,transparent 0% 50%) 0 0/12px 12px}.swatches{display:flex;gap:18px;align-items:center;margin:15px 0;padding:18px;background:var(--paper,#fffdf8);border:1px solid #d1d9ca;border-radius:8px}.note{background:#e6ebde;padding:14px 20px;max-width:1060px}footer{font-size:12px;margin-top:30px;max-width:1050px}@media(max-width:900px){.grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:600px){main{padding:20px 14px}.grid{grid-template-columns:1fr}h1{font-size:29px}}</style><main><div class="eyebrow">Hackriculture · monochrome pilot · for review</div><h1>Twelve clearer small symbols.</h1><p class="intro">Six Key Risks and six crop-bubble drawings. A rounded single-colour family, with broad transparent cutouts and fewer fine marks. Each comparison includes the existing 32px or 34px print size; the larger view is only for inspecting the drawing.</p><div class="note">Current category colours and icon sizes are retained. Production artwork, saved mappings and approved gardening records are unchanged. “Small roots” is a new meaning; its current comparison shows the forked-root icon it presently receives.</div><div class="controls"><button onclick="document.body.classList.toggle('check')">Show transparency</button><button onclick="document.documentElement.style.setProperty('--paper','#fffdf8')">Neutral background</button><button onclick="document.documentElement.style.setProperty('--paper','#e6efd9')">Green background</button><button onclick="document.documentElement.style.setProperty('--paper','#fae6de')">Warm background</button></div><section id="risks"><h2>Key Risks · six drawings</h2><div class="grid">${await cards('risk')}</div></section><section id="crops"><h2>Crop bubbles · six drawings</h2><div class="grid">${await cards('crop')}</div></section><h2>One drawing, different inks</h2><p>The cutouts remain transparent. SVG masters can take any single colour; PNG exports use the dark ink.</p><div class="swatches">${['#30352f','#2F7D32','#C6402D','#7B5A92','#D85B00'].map(c=>drawing(icons.find(i=>i.key==='broccoli'),40,c)).join('')}</div><footer><p>Original AI-assisted SVG drawings and transparent 384px PNGs. This pilot establishes the drawing language; it does not change the 250 risk-label mappings or resolve the previously recorded naming conflicts.</p><p><a href="MONOCHROME-REVIEW.html">Existing full inventory</a> · <a href="MONOCHROME-PILOT-MANIFEST.json">Pilot manifest</a> · <a href="MONOCHROME-PILOT-CHECKS.json">Checks</a></p></footer></main></html>`;
fs.writeFileSync('docs/icon-pilot/MONOCHROME-PILOT.html',html);console.log('12 monochrome SVG/PNG pairs and comparison board ready; originals unchanged.');
