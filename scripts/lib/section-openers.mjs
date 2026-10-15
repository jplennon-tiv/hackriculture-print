import {escapeHtml as esc} from './book-content.mjs';

export function renderSectionOpeners(data, units, edition) {
  if (!data.book.sectionOpeners) throw Error('Missing editable section-openers copy');
  return data.book.sectionOpeners.map((s,i)=>{
    const folio=edition.sectionOpeners.find(p=>p.source==='opening:'+s.id)?.startPage;
    if (!folio || (s.id==='varieties' ? folio%2!==0 : folio%2!==1)) throw Error('Unexpected section-opening side: '+s.id);
    return `<section class="sheet ${folio % 2 === 0 ? 'verso' : ''} section-opener section-${esc(s.id)}" data-folio="${folio}"><div class="content">
      <p class="section-number"><span>${String(i+1).padStart(2,'0')}</span> ${esc(data.book.title.toUpperCase())}</p>
      <h1>${esc(s.heading.text)}<span>${esc(s.heading.emphasis)}</span></h1>
      <p class="strapline">${esc(s.strapline)}</p>
      <figure class="section-art">${s.illustrations.map(a=>`<img src="${esc(a.src)}" alt="${esc(a.alt)}">`).join('')}</figure>
      ${s.paragraphs.map(p=>`<p class="section-intro">${esc(p)}</p>`).join('')}
      <p class="section-closing">${esc(s.closing)}</p></div><footer><span>${esc(data.book.title.toUpperCase())}</span><span>${units.toUpperCase()} · ${folio}</span></footer></section>`;
  }).join('');
}
