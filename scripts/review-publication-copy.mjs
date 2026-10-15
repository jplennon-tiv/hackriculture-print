// Editorial review only: the book and raster cover remain untouched.
import fs from 'node:fs';
import path from 'node:path';
import {readBookContent,root,escapeHtml as esc} from './lib/book-content.mjs';

const {data,revision}=readBookContent();
const {book,publication:pub,covers}=data;
const dir=path.join(root,'docs/publication/publication-copy');
fs.mkdirSync(dir,{recursive:true});
const paragraphs=items=>items.map(p=>`<p>${esc(p)}</p>`).join('');
const block=item=>`<section><h3>${esc(item.heading)}</h3>${paragraphs(item.paragraphs)}</section>`;
const html=`<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>The Vegetable Guru · Publication and back-cover copy</title><style>
@font-face{font-family:Lilita;src:url('/fonts/richer-a-1.woff2')}
@font-face{font-family:Nunito;src:url('/fonts/richer-a-6.woff2');font-weight:100 1000}
*{box-sizing:border-box}body{margin:0;background:#e4e7da;color:#173e2c;font:18px/1.55 Nunito,sans-serif}
header,main,footer{max-width:1220px;margin:auto;padding:28px}header{padding-bottom:8px}
h1,h2,h3{font-family:Lilita,sans-serif;font-weight:400;line-height:1.1}h1{font-size:42px;margin:10px 0 18px}h2{font-size:30px;margin:0 0 18px}h3{font-size:24px;margin:25px 0 10px}
p{margin:0 0 15px}.eyebrow{font-size:13px;font-weight:900;letter-spacing:1px}.intro{max-width:900px}.notes{background:#fff8e9;padding:16px 20px;border-left:4px solid #a44007;margin-top:20px;font-size:16px}
main{display:grid;grid-template-columns:1fr 1fr;gap:28px;padding-top:20px;align-items:start}.copy{padding:30px;background:#fff8e9;border-radius:6px}.label{font-size:14px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:#a44007;margin-bottom:18px}.subtitle{font-weight:800}.book-subtitle{font-size:16px}
.facts{display:grid;grid-template-columns:1fr 1fr;gap:18px;border-block:1px solid #bfc8b2;padding:20px 0;margin:25px 0;font-size:16px}.facts dt{font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:1px}.facts dd{margin:4px 0 0}.closing{border-top:1px solid #bfc8b2;padding-top:22px;margin-top:28px;font-size:16px}
.back{background:#074c32;color:#fff8e9}.back .label{color:#bdd971}.back h2{font-size:38px}.back .subtitle{font-size:20px;line-height:1.35;margin-bottom:25px}.back p{margin-bottom:20px}.price{margin-top:28px;font-weight:900}.detail-note{font-size:15px;margin-top:18px}details{margin-top:22px}summary{cursor:pointer;font-weight:800;font-size:16px}.reference{display:block;width:100%;max-width:340px;height:auto;margin:18px auto}figcaption{font-size:14px}figure{margin:0}a{color:#074c32}.back a{color:#fff8e9}footer{font-size:14px;padding-top:4px}footer p{max-width:1000px}
@media(max-width:850px){main{grid-template-columns:1fr}header,main,footer{padding:18px}h1{font-size:34px}.copy{padding:24px}}
</style></head><body>
<header><div class="eyebrow">THE VEGETABLE GURU · COPY REVIEW</div><h1>Publication &amp; back-cover copy</h1>
<p class="intro">Draft wording for your review before it goes into the book. The approved technique headings and current complete preview are preserved.</p>
<p class="notes">Still to confirm: the copyright year, imprint, ISBN, and edition/publication year. The source note replaces the placeholder acknowledgements; personal thanks can be added if you want them.</p></header>
<main><article class="copy publication"><div class="label">Publication page</div><h2>${esc(book.title)}</h2><p class="book-subtitle">${esc(book.subtitle)}</p>
${block(pub.copyright)}<dl class="facts">${['authorName','imprint','isbn','edition'].map(key=>`<div><dt>${esc(pub.labels[key])}</dt><dd>${key==='edition'?'Imperial edition · ':''}${esc(book[key])}</dd></div>`).join('')}</dl>
${block(pub.credits)}${block(pub.acknowledgements)}<div class="closing">${paragraphs(pub.closing)}</div></article>
<div><article class="copy back"><div class="label">Back-cover wording</div><h2>${esc(book.title)}</h2><p class="subtitle">${esc(covers.back.subtitle)}</p><div id="blurb">${paragraphs(covers.back.paragraphs)}</div><div class="price">£${covers.back.priceGBP.toFixed(2)}</div><p class="detail-note">ISBN / barcode space retained</p></article>
<details><summary>Preferred B5 cover reference</summary><figure><img class="reference" src="${esc(covers.back.artwork.src)}" alt="${esc(covers.back.artwork.alt)}"><figcaption>The preferred composition is retained. This reference still shows its original placeholder wording; the draft above is the replacement text.</figcaption></figure></details></div></main>
<footer><p><a href="../whole-book-order-preview/REVIEW.html?revision=flowing-headings#spread=80">Current complete book preview</a> · <a href="README.md">Copy notes and remaining details</a></p><p>The copyright draft preserves uses permitted by law. Reference: <a href="https://www.gov.uk/copyright">UK copyright guidance</a> and <a href="https://www.gov.uk/guidance/exceptions-to-copyright">copyright exceptions</a>.</p></footer>
</body></html>`;
fs.writeFileSync(path.join(dir,'REVIEW.html'),html);
console.log(JSON.stringify({review:'docs/publication/publication-copy/REVIEW.html',bookRevision:revision,backCoverWords:covers.back.paragraphs.join(' ').split(/\s+/).length}));
