import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {readBookLayout, bookLayoutRevision, bookLayoutFiles} from '../../../hackriculture-data/lib/book-layout.mjs';

export const root = fileURLToPath(new URL('../../', import.meta.url));
export const sharedRoot = path.resolve(root, '../hackriculture-data');
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const escapeHtml = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const esc = escapeHtml;
const image = (value, cls = '') => `<img${cls ? ` class="${cls}"` : ''} src="${esc(value.src)}" alt="${esc(value.alt)}">`;
const paragraphs = (items, cls = '') => items.map(text => `<p${cls ? ` class="${cls}"` : ''}>${esc(text)}</p>`).join('');
const rule = '<div class="colour-rule" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>';

export function readBookContent() {
  const revision = bookLayoutRevision(sharedRoot), data = readBookLayout({root: sharedRoot});
  const inputs = Object.fromEntries(bookLayoutFiles.map(name => [`../hackriculture-data/book-layout/${name}.json`, sha256(fs.readFileSync(path.join(sharedRoot, 'book-layout', name + '.json')))]));
  const assets = {};
  function check(value) {
    if (!value || typeof value !== 'object') return;
    if (typeof value.src === 'string') {
      const file = value.src.startsWith('/images/') ? 'public' + value.src : value.src.slice(1);
      if (!fs.existsSync(path.join(root, file))) throw Error('Book illustration missing: ' + file);
      assets[file] = sha256(fs.readFileSync(path.join(root, file)));
    }
    for (const child of Object.values(value)) check(child);
  }
  check(data);
  if (bookLayoutRevision(sharedRoot) !== revision) throw Error('Book copy changed while loading. Please retry.');
  return {data, revision, inputs, assets};
}

const sheet = (book, units, folio, cls, body, entry = false) => `<section class="sheet ${folio % 2 === 0 ? 'verso' : ''} ${cls}" data-folio="${folio}"><div class="content">${body}</div>${folio === 1 ? '' : `<footer><span>${esc(book.title.toUpperCase())}</span><span${entry ? ' class="footer-right"' : ''}>${units.toUpperCase()} · ${folio}</span></footer>`}</section>`;

export function renderOpeningPages(data, units) {
  const {book, publication: pub, introduction: intro, author} = data;
  const words = book.title.split(/\s+/), subtitle = book.subtitle.split(/\s+/);
  const titleLines = words.length >= 3 ? [words[0], words.slice(1, -1).join(' '), words.at(-1)] : ['', book.title, ''];
  const title = `${rule}<div class="eyebrow">${esc(book.brand.toUpperCase())}</div><h1 class="book-title">${titleLines.map((line, i) => `<span class="${['the', 'vegetable', 'guru'][i]}">${esc(line)}</span>`).join('')}</h1><p class="subtitle">${esc(subtitle.slice(0, 2).join(' '))}<br>${esc(subtitle.slice(2).join(' '))}</p><p class="author">${esc(book.authorName)}</p><div class="title-art" aria-label="${esc(book.titleArtworkLabel)}">${book.titleArtwork.map((art, i) => `<div class="tile ${['tomato', 'onion', 'pea', 'carrot', 'kale'][i]}">${image(art)}</div>`).join('')}</div><p class="imprint">${esc(book.imprint)}</p>`;
  const block = item => `<section class="publication-block"><h3>${esc(item.heading)}</h3>${paragraphs(item.paragraphs)}</section>`;
  const publication = `${rule}<div class="eyebrow">${esc(pub.eyebrow)}</div><h1>${esc(book.title)}</h1><p class="book-subtitle">${esc(book.subtitle)}</p><h2>${esc(pub.heading)}</h2>${block(pub.copyright)}<dl class="facts">${['authorName', 'imprint', 'isbn', 'edition'].map(key => `<div><dt>${esc(pub.labels[key])}</dt><dd>${esc(book[key])}</dd></div>`).join('')}</dl>${block(pub.credits)}${block(pub.acknowledgements)}${paragraphs(pub.closing, 'closing')}`;
  const welcome = `<header><div class="eyebrow">${esc(book.title.toUpperCase())}</div>${image(intro.illustration, 'harvest')}<h1>${esc(intro.heading)}</h1><p>${esc(intro.strapline)}</p></header><p class="lead">${esc(intro.lead)}</p><div class="body-copy">${paragraphs(intro.paragraphs)}</div><blockquote class="pullquote">${esc(intro.quote)}</blockquote><section class="about"><div><h2>${esc(author.heading)}</h2>${paragraphs(author.paragraphs)}<p class="author-signoff">${esc(book.authorName)} · ${esc(book.brand)}</p></div><div class="tile">${image(author.illustration)}</div></section>`;
  return {body: sheet(book, units, 1, 'title-page', title) + sheet(book, units, 2, 'publication', publication) + sheet(book, units, 3, 'welcome', welcome), copyBlocks: [intro.lead, ...intro.paragraphs, intro.quote, ...author.paragraphs, ...pub.copyright.paragraphs, ...pub.credits.paragraphs, ...pub.acknowledgements.paragraphs, ...pub.closing]};
}

export function renderEntryPages(data, units, plan, themes) {
  const {book, contents: toc, 'how-to': how} = data;
  const docs = plan.editions[units].documents;
  const maps = Object.fromEntries(['vegetable', 'trouble'].map(type => {
    const items = docs.filter(d => d.type === type), map = new Map(items.map(d => [d.key, d]));
    if (map.size !== items.length) throw Error('Duplicate assembly identity: ' + type);
    return [type, map];
  }));
  const seen = new Set(), refs = [];
  const row = (item, type) => {
    const doc = maps[type].get(item.key), identity = type + ':' + item.key;
    if (!doc || seen.has(identity) || !Number.isInteger(doc.startPage) || doc.startPage < 8) throw Error('Missing, duplicate or invalid assembly reference: ' + identity);
    seen.add(identity); refs.push({type, key: item.key, label: item.label, startPage: doc.startPage});
    return `<span>${esc(item.label)}</span><span class="page-ref">${doc.startPage}</span>`;
  };
  const family = f => {
    const theme = themes.find(t => t.id === f.id);
    if (!theme) throw Error('Missing family theme: ' + f.id);
    return `<section class="family" style="--deep:${theme.deep};--soft:${theme.soft}"><h3>${esc(f.heading)}</h3><ul>${f.entries.map(item => `<li data-toc="${esc(item.label)}">${row(item, 'vegetable')}</li>`).join('')}</ul></section>`;
  };
  const header = (item, art, cls = '', ribbon = '', breakTitle = false) => `<header class="page-header ${cls}"><div class="eyebrow">${esc(item.eyebrow)}</div>${image(art, 'harvest')}<h1>${esc(item.heading.text)}${breakTitle ? '<br>' : ' '}<span>${esc(item.heading.emphasis)}</span></h1>${ribbon ? `<div class="ribbon">${esc(ribbon)}</div>` : ''}${paragraphs(item.paragraphs)}</header>`;
  const first = sheet(book, units, 4, 'contents-first', header(toc.pages[0], toc.illustration, '', toc.ribbon) + `<div class="contents-grid"><div>${toc.families.slice(0, 2).map(family).join('')}</div><div>${toc.families.slice(2, 5).map(family).join('')}</div></div><p class="contents-note">${esc(toc.pages[0].note)}</p>`, true);
  const second = sheet(book, units, 5, 'contents-second', header(toc.pages[1], toc.illustration) + `<div class="contents-grid"><div>${toc.families.slice(5).map(family).join('')}</div><section class="troubles"><h2>${esc(toc.troublesHeading)}</h2>${toc.troubles.map(item => `<div class="trouble-item" data-toc="${esc(item.label)}">${row(item, 'trouble')}</div>`).join('')}</section></div><p class="contents-note">${esc(toc.pages[1].note)}</p>`, true);
  if (seen.size !== maps.vegetable.size + maps.trouble.size) throw Error('Contents/assembly coverage mismatch');
  const cal = how.calendar;
  const calendarBody = `<section class="calendar-explainer"><h2>${esc(cal.heading)}</h2>${paragraphs(cal.paragraphs, 'explanation')}<div class="calendar-study"><figure class="specimen">${image(cal.image, 'calendar-capture')}</figure><div class="calendar-legend">${cal.climates.map((climate, i) => `<div class="climate-group"><h3>${esc(climate.heading)}</h3><p class="climate-name">${esc(climate.name)}</p>${image(climate.image)}<div class="climate-key"><span>${esc(climate.sowLabel)}</span><i class="calendar-chip" style="background:${i ? '#6b9069' : '#d6ea9b'}"></i><span>${esc(climate.harvestLabel)}</span><i class="calendar-chip" style="background:${i ? '#ae7950' : '#ff781f'}"></i></div></div>`).join('')}</div></div></section>`;
  const endpoint = end => `<figure class="endpoint">${image(end.image)}<figcaption>${esc(end.rating)}${end.caption ? `<span>${esc(end.caption)}</span>` : ''}</figcaption></figure>`;
  const scalesBody = how.scales.map(scale => {
    const water = scale.id === 'water';
    const specimen = water ? `<div class="core-window">${image(scale.image, 'core')}</div>` : image(scale.image, 'badge');
    return `<section class="scale-section"><h2>${esc(scale.heading)}</h2>${paragraphs(scale.paragraphs, 'explanation')}<section class="study-row ${water ? 'water' : 'difficulty-row'}" aria-label="${esc(scale.ariaLabel)}"><figure class="specimen">${specimen}</figure><div class="interpretation"><div class="ends">${endpoint(scale.left)}<div class="track${water ? ' water-track' : ''}" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>${endpoint(scale.right)}</div></div></section></section>`;
  }).join('');
  const calendar = sheet(book, units, 6, 'how-calendar', header(how.pages[0], how.illustration, 'how-header', '', true) + calendarBody, true);
  const scales = sheet(book, units, 7, 'how-scales', header(how.pages[1], how.illustration, 'scales-header', '', true) + scalesBody, true);
  return {body: first + second + calendar + scales, contents: refs, copyBlocks: [...cal.paragraphs, ...how.scales.flatMap(s => s.paragraphs)]};
}
