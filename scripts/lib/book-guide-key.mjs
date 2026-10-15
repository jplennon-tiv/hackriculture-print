import {escapeHtml as esc} from './book-content.mjs';

// The three approved explanations and their nine instructional assets remain.
// This is a new one-page composition, separate from the frozen two-page source.
export function renderGuideKey(data, units, folio = 9) {
  const how = data['how-to'], cal = how.calendar;
  const image = (a, cls = '') => `<img class="${cls}" src="${esc(a.src)}" alt="${esc(a.alt)}">`;
  const paragraphs = items => items.map(t => `<p>${esc(t)}</p>`).join('');
  const endpoint = e => `<figure class="endpoint">${image(e.image)}<figcaption>${esc(e.rating)}${e.caption ? `<span>${esc(e.caption)}</span>` : ''}</figcaption></figure>`;
  const scales = how.scales.map(s => `<section class="key-scale ${s.id}"><h2>${esc(s.heading)}</h2>${paragraphs(s.paragraphs)}<div class="scale-art" aria-label="${esc(s.ariaLabel)}"><figure class="scale-specimen">${s.id === 'water' ? `<div class="core-window">${image(s.image)}</div>` : image(s.image)}</figure><div class="ends">${endpoint(s.left)}<div class="track" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>${endpoint(s.right)}</div></div></section>`).join('');
  const body = `<header class="key-header"><div class="eyebrow">${esc(how.pages[0].eyebrow)}</div><h1>${esc(how.pages[0].heading.text)}<br><span>${esc(how.pages[0].heading.emphasis)}</span></h1>${paragraphs(how.pages[0].paragraphs)}<img src="/docs/assets/vegetable-guru-stock/assets/h5-growing-start-hero-style-v2.png" alt="Seedlings, pots and a hand trowel"></header>
  <section class="key-calendar"><h2>${esc(cal.heading)}</h2>${paragraphs(cal.paragraphs)}<figure class="key-calendar-example">${image(cal.image)}</figure><div class="key-climates">${cal.climates.map((c,i) => `<div class="key-climate">${image(c.image)}<div><h3>${esc(c.heading)} <span>${esc(c.name)}</span></h3><div class="key-swatches"><span>${esc(c.sowLabel)}</span><i style="background:${i ? '#6b9069' : '#d6ea9b'}"></i><span>${esc(c.harvestLabel)}</span><i style="background:${i ? '#ae7950' : '#ff781f'}"></i></div></div></div>`).join('')}</div></section>${scales}`;
  return {body:`<section class="sheet ${folio % 2 === 0 ? 'verso' : ''} guide-key" data-folio="${folio}"><div class="content">${body}</div><footer><span>${esc(data.book.title.toUpperCase())}</span><span>${units.toUpperCase()} · ${folio}</span></footer></section>`};
}
