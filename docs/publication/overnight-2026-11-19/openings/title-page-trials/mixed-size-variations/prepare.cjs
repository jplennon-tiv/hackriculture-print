const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require(path.join(process.cwd(), 'node_modules/sharp'));
const root = process.cwd();
const work = __dirname;
const openings = 'docs/publication/overnight-2026-11-19/openings/';
const previous = JSON.parse(fs.readFileSync(path.join(work, '../a-revision/VARIANTS.json')));
const inventory = JSON.parse(fs.readFileSync(openings + 'contents-thumbnail-review/THUMBNAILS.json'));
const assets = {...previous.assets};
for (const [key, number] of [['tomatoes', 10], ['chard', 11], ['cauliflower', 15], ['cabbage', 16]]) {
  const item = inventory.entries.find(x => x.number === number);
  assets[key] = {...item, status: 'Approved on contents pages 4–5; see swapped-headers/APPROVAL.json'};
}
const picture = (key, role, x, y, size) => ({key, role, x, y, w:size, h:size});
const text = (cx, top) => ({cx, tops:[top, top+12, top+35, top+66, top+74, top+90, top+99]});
const variants = [
  {id:'01', title:'Lower-left anchor', text:text(97, 43), photos:[
    picture('tomatoes','large',20,153,69), picture('chard','medium',126,171,43),
    picture('pea','thumbnail',26,24,23), picture('onion','thumbnail',149,18,21), picture('courgette','thumbnail',99,207,21)]},
  {id:'02', title:'Lower-right anchor', text:text(97,42), photos:[
    picture('peppers','large',107,156,70), picture('cabbage','medium',22,177,42),
    picture('pea','thumbnail',29,25,22), picture('onion','thumbnail',143,20,20), picture('courgette','thumbnail',75,204,22)]},
  {id:'03', title:'Diagonal sweep', text:text(131,74), photos:[
    picture('peppers','large',18,15,64), picture('tomatoes','medium',126,23,43),
    picture('onion','thumbnail',26,103,22), picture('pea','thumbnail',53,146,21), picture('courgette','thumbnail',103,204,23)]},
  {id:'04', title:'Side gallery', text:{cx:130,tops:[44,56,80,114,122,145,156]}, photos:[
    picture('chard','large',17,74,62), picture('peppers','medium',27,149,42),
    picture('onion','thumbnail',149,14,22), picture('pea','thumbnail',87,206,21), picture('courgette','thumbnail',142,190,24)]},
  {id:'05', title:'Pictures above', text:text(97,91), photos:[
    picture('cabbage','large',103,13,68), picture('tomatoes','medium',23,27,43),
    picture('pea','thumbnail',28,203,22), picture('onion','thumbnail',83,211,19), picture('courgette','thumbnail',145,200,23)]},
  {id:'06', title:'Loose corner frame', text:text(97,88), photos:[
    picture('peppers','large',18,16,63), picture('chard','medium',130,179,43),
    picture('onion','thumbnail',143,22,23), picture('pea','thumbnail',98,54,20), picture('courgette','thumbnail',25,199,23)]}
];
(async () => {
  for (const a of Object.values(assets)) {
    const bytes=fs.readFileSync(a.file),hash=crypto.createHash('sha256').update(bytes).digest('hex');
    if(hash!==a.sha256)throw new Error('Source changed: '+a.file);
    const m=await sharp(bytes).metadata(); a.nativePixels=[m.width,m.height];
  }
  fs.writeFileSync(path.join(work,'VARIANTS.json'),JSON.stringify({date:'2026-11-22',status:'Six standalone proposals; selection and final approval pending',folio:1,trimMM:[185,240],text:previous.text,assets,variants,notes:[
    'Requested by John: one large, one medium and a scatter of thumbnails, using existing artwork, in six layouts.',
    'Every option has one 62–70 mm square, one 42–43 mm square and three 19–24 mm thumbnails.',
    'Photographic A direction, original live typefaces and current title wording retained. Typography repositioned for each composition.',
    'No new artwork, retouching, rotation, stretching, frames, shadows, branding or imprint. Proportional square fit only.',
    'No visible folio, matching the preceding title-page proof. This remains folio 1.',
    'Existing native-resolution artwork is reused for layout comparison; lower-resolution generated tiles will need separate production consideration after selection.',
    'Original pages, approved artwork and installed book remain unchanged. Full-book integration and supplier work are separate.'
  ]},null,2)+'\n');
})();
