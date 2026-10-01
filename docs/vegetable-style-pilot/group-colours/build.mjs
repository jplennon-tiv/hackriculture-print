import fs from 'node:fs/promises';
const root=new URL('./',import.meta.url);
const palettes=JSON.parse(await fs.readFile(new URL('palettes.json',root),'utf8'));
const previous=JSON.parse(await fs.readFile(new URL('../../../src/print/vegetable_palettes.json',root),'utf8'));
const groups=JSON.parse(await fs.readFile(new URL('../../../../hackriculture-data/vegetable_groups.json',root),'utf8'));
const data=palettes.map(p=>({...p,previous:previous[p.group].highlight,crops:groups[p.group]}));
let html=await fs.readFile(new URL('../fresh-c/a-rich-metric.html',root),'utf8');
html=html.replace('href="rich-a.css"','href="../fresh-c/rich-a.css"').replace('</head>','<link href="theme.css?revision=paper-3" rel="stylesheet"></head>');
html=html.replace('</body>',`<script>
const palettes=${JSON.stringify(palettes)};
function theme(group,ribbon,page,paper='tinted'){const p=palettes.find(x=>x.id===group)||palettes[0];for(const key of ['accent','deep','soft','wash','ink','dark','paper'])document.documentElement.style.setProperty('--group-'+key,p[key]);document.body.dataset.paper=paper==='cream'?'cream':'tinted';document.body.dataset.ribbon='group';document.body.dataset.page=['1','2'].includes(String(page))?String(page):'both';document.body.dataset.group=p.id;}
const params=new URLSearchParams(location.search);theme(params.get('group'),params.get('ribbon'),params.get('page'),params.get('paper'));
addEventListener('message',event=>{const d=event.data;if(d&&d.type==='colour-study')theme(d.group,d.ribbon,d.page,d.paper)});
</script></body>`);
await fs.writeFile(new URL('preview.html',root),html);
let review=await fs.readFile(new URL('review-template.html',root),'utf8');
review=review.replace('/*PALETTES*/',JSON.stringify(data));
await fs.writeFile(new URL('REVIEW.html',root),review);
await fs.writeFile(new URL('TINTED.html',root),review);
console.log('Built isolated eight-group colour study; approved files not touched.');
