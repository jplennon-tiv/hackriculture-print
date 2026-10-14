import {renderEntryPages, escapeHtml as esc} from './book-content.mjs';

// This is a proposed placement map. It never changes saved source PDF folios.
export function createContentsPlan(base, sources) {
  const plan = structuredClone(base);
  plan.status = 'John-requested section order, 14 October 2026; new opener designs and contents remain for review. Source PDFs retain original folios.';
  plan.openingPlan = [
    [1, 'Title'], [2, 'Publication details'], [3, 'Welcome and author'],
    [4, 'Contents: vegetables'], [5, 'Contents: vegetables and Troubles'],
    [6, 'Contents: openings, Growing Techniques and index'],
    [7, 'Why Grow Your Own'], [8, 'Blank: faces Vegetable Varieties opener'],
    [9, 'Vegetable Varieties'], [10, 'How to use: calendar'], [11, 'How to use: difficulty and core needs']
  ].map(([page, content]) => ({page, content}));
  const topicOrder = ['technique:organic', 'technique:plot-location', 'technique:plot-layout', 'technique:plot-layout-branching',
    'cultivation:overview', 'cultivation:no-dig', 'cultivation:digging', 'cultivation:digging-finish',
    'technique:greenhouse-choose', 'technique:greenhouse-beds', 'technique:greenhouse-no-dig-seasons',
    'technique:rotation', 'technique:compost-bins', 'technique:compost-use', 'technique:watering', 'technique:sowing'];
  const topicMap = {};
  for (const [unit, edition] of Object.entries(plan.editions)) {
    let delta = plan.openingPlan.length - edition.openingPagesReserved;
    let cursor = plan.openingPlan.length + 1;
    edition.openingPagesReserved = plan.openingPlan.length;
    edition.sectionOpeners = [{source:'opening:varieties',startPage:9,label:'Vegetable Varieties'}];
    edition.extraBlanks = [{page:8,reason:'Faces Vegetable Varieties opener'}];
    let troublesStarted = false;
    for (const doc of edition.documents) {
      if (doc.type === 'trouble' && !troublesStarted) {
        edition.extraBlanks.push({page:cursor,reason:'Faces Vegetable Troubles opener'});
        edition.sectionOpeners.push({source:'opening:troubles',startPage:cursor+1,label:'Vegetable Troubles'});
        cursor += 2; delta += 2; troublesStarted = true;
      }
      doc.sourceStartPage = doc.startPage;
      doc.startPage += delta; doc.endPage += delta;
      doc.blankFoliosAfter = doc.blankFoliosAfter.map(p => p + delta);
      if (doc.startPage !== cursor || doc.endPage !== doc.startPage + doc.physicalPages - 1) throw Error('Non-contiguous source plan: ' + doc.id);
      if (doc.type === 'vegetable' && doc.startPage % 2) throw Error('Crop opening no longer faces its second page');
      doc.startSide = doc.startPage % 2 ? 'recto' : 'verso';
      cursor = doc.endPage + doc.blankAfterPages + 1;
    }
    const map = sources[unit];
    const locate = (source, folio) => {
      if (!map[source]) throw Error('Missing approved source: ' + source);
      return {source, ...map[source], startPage: folio, physicalPages: 1};
    };
    edition.sectionOpeners.push({source:'opening:techniques',startPage:cursor++,label:'Growing Techniques'});
    edition.additions = [locate('technique:why-grow', 7), ...topicOrder.map(s => locate(s, cursor++))];
    edition.index = {...map['back:index'], source: 'back:index', startPage: cursor, endPage: cursor + map['back:index'].physicalPages - 1};
    edition.lastContentPage = edition.index.endPage;
    edition.endBlankPages = edition.lastContentPage % 2;
    edition.plannedEvenTotal = edition.lastContentPage + edition.endBlankPages;
    if (edition.endBlankPages) edition.extraBlanks.push({page:edition.plannedEvenTotal,reason:'End balancing page'});
    edition.techniquePages = topicOrder.length;
    topicMap[unit] = Object.fromEntries(edition.additions.map(d => [d.source, d.startPage]));
  }
  return {plan, topicMap};
}

export function renderUpdatedContents(data, units, plan, themes) {
  const extra = data.contents.expanded;
  if (!extra) throw Error('Missing expanded contents copy');
  const copy = structuredClone(data);
  copy.contents.pages[0].note = extra.firstPageNote;
  copy.contents.pages[1].note = extra.secondPageNote;
  const original = renderEntryPages(copy, units, plan, themes);
  const edition = plan.editions[units];
  const sources = new Map(edition.additions.map(d => [d.source, d.startPage]));
  for (const d of edition.sectionOpeners) sources.set(d.source,d.startPage);
  sources.set('opening:welcome', 3); sources.set('opening:how-to', 10); sources.set('back:index', edition.index.startPage);
  const seen = new Set(); const additionalReferences = [];
  const row = item => {
    const folio = sources.get(item.source);
    if (!Number.isInteger(folio) || seen.has(item.source)) throw Error('Missing or duplicate contents destination: ' + item.source);
    seen.add(item.source); additionalReferences.push({...item, startPage: folio});
    return `<li data-source="${esc(item.source)}"><span>${esc(item.label)}</span><span class="page-ref">${folio}</span></li>`;
  };
  const group = g => `<section class="topic-group"><h3>${esc(g.heading)}</h3><ul>${g.entries.map(row).join('')}</ul></section>`;
  const p = extra.page;
  const third = `<section class="sheet verso contents-extra" data-folio="6"><div class="content">
    <header class="page-header"><div class="eyebrow">${esc(p.eyebrow)}</div><img class="harvest" src="${esc(data.contents.illustration.src)}" alt="${esc(data.contents.illustration.alt)}"><h1>${esc(p.heading.text)} <span>${esc(p.heading.emphasis)}</span></h1>${p.paragraphs.map(t=>`<p>${esc(t)}</p>`).join('')}</header>
    <section class="getting-started"><h2>${esc(extra.gettingStarted.heading)}</h2><ul>${extra.gettingStarted.entries.map(row).join('')}</ul></section>
    <h2 class="techniques-heading">${esc(extra.techniquesHeading)}</h2>
    <div class="contents-grid techniques-grid"><div>${extra.groups.slice(0,3).map(group).join('')}</div><div>${extra.groups.slice(3).map(group).join('')}</div></div>
    <section class="index-link"><ul>${row(extra.index)}</ul><p>${esc(extra.index.description)}</p></section>
    <p class="contents-note">${esc(extra.note)}</p></div><footer><span>${esc(data.book.title.toUpperCase())}</span><span>${units.toUpperCase()} · 6</span></footer></section>`;
  if (seen.size !== sources.size || [...sources.keys()].some(s => !seen.has(s))) throw Error('Contents do not cover all added pages');
  return {body: original.contentsBody + third, references: [...original.contents, ...additionalReferences]};
}
