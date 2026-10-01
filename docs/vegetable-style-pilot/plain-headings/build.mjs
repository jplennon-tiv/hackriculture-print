import fs from 'node:fs/promises';
const root=new URL('./',import.meta.url);
const changes=[
['Grow a little sweetness.','Growing guide'],
['Grow it. <span>Love it.</span>','Growing <span>&amp; harvesting</span>'],
['Pull. Crunch. Store.','Harvesting &amp; storage'],
['Find your favourite.','Recommended varieties'],
['Sow. Cover. Thin.','Sowing &amp; thinning'],
['Your growing year.','Growing calendar'],
["Freshly pulled, they're a different vegetable entirely.",'A practical guide to growing carrots.']
];
for(const unit of ['metric','imperial']){
 let html=await fs.readFile(new URL('../fresh-c/a-rich-'+unit+'.html',root),'utf8');
 for(const [a,b] of changes){if(!html.includes(a))throw Error('Missing '+a);html=html.replace(a,b)}
 html=html.replace('href="rich-a.css"','href="../fresh-c/rich-a.css"').replace('</head>','<link href="../group-colours/theme.css" rel="stylesheet"><style>:root{--group-accent:#ff781f;--group-deep:#a44007;--group-soft:#ffe1b7;--group-wash:#fff0dc;--group-ink:#173e2c;--group-dark:#064d32;--group-paper:#fff8e9}.back h1{font-size:53px}</style></head>');
 await fs.writeFile(new URL(unit+'.html',root),html);
}
await fs.writeFile(new URL('HEADINGS.json',root),JSON.stringify({status:'proposed wording following requested practical tone',changes},null,2)+'\n');
