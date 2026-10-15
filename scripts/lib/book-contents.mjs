import {escapeHtml as esc} from './book-content.mjs';

// Existing house-style stock, reused without changing the source images.
export const contentsArtwork = [
  {id:'H1',folio:4,role:'header',file:'docs/assets/vegetable-guru-stock/assets/h1-roots-beetroot-hero-style-v2.png'},
  {id:'H2',folio:5,role:'header',file:'docs/assets/vegetable-guru-stock/assets/h2-roots-turnips-hero-style-v2.png'},
  {id:'H5',folio:5,role:'lower',file:'docs/assets/vegetable-guru-stock/assets/h5-growing-start-hero-style-v2.png'},
  {id:'H6',folio:5,role:'lower',file:'docs/assets/vegetable-guru-stock/assets/h6-growing-harvest-hero-style-v2.png'}
];

// This is a proposed placement map. It never changes saved source PDF folios.
export function createContentsPlan(base, sources, approvedGuides = {}) {
  const plan = structuredClone(base);
  plan.status = 'Approved combined Guides opener at right-hand page 9, 15 October 2026. Source PDFs retain original folios.';
  plan.openingPlan = [
    [1, 'Title'], [2, 'Publication details'],
    [3, 'Blank: places the contents on facing pages'],
    [4, 'Contents: Vegetable Guides'], [5, 'Contents: Vegetable Troubles and Growing Techniques'],
    [6, 'Blank: faces the Introduction'], [7, 'Introduction — why grow your own'],
    [8, 'Blank: faces the combined Vegetable Guides opener'], [9, 'Vegetable Guides — how to use the guides']
  ].map(([page, content]) => ({page, content}));
  const topicOrder = ['technique:organic', 'technique:plot-location', 'technique:plot-layout', 'technique:plot-layout-branching',
    'cultivation:overview', 'cultivation:no-dig', 'cultivation:digging', 'cultivation:digging-finish',
    'technique:compost-bins', 'technique:compost-use', 'technique:rotation', 'technique:sowing', 'technique:watering',
    'technique:greenhouse-choose', 'technique:greenhouse-beds', 'technique:greenhouse-no-dig-seasons'];
  const topicMap = {};
  for (const [unit, edition] of Object.entries(plan.editions)) {
    let cursor = plan.openingPlan.length + 1;
    edition.openingPagesReserved = plan.openingPlan.length;
    edition.sectionOpeners = [{source:'opening:varieties',startPage:9,label:'Vegetable Guides'}];
    edition.extraBlanks = [{page:3,reason:'Places the contents on facing pages'}, {page:6,reason:'Faces the Introduction'}, {page:8,reason:'Faces the combined Vegetable Guides opener'}];
    let troublesStarted = false;
    for (const doc of edition.documents) {
      if (doc.type === 'trouble' && !troublesStarted) {
        edition.extraBlanks.push({page:cursor,reason:'Faces Vegetable Troubles opener'});
        edition.sectionOpeners.push({source:'opening:troubles',startPage:cursor+1,label:'Vegetable Troubles'});
        cursor += 2; troublesStarted = true;
      }
      doc.sourceStartPage = doc.startPage;
      const replacement = doc.type === 'vegetable' && approvedGuides[unit]?.[doc.key];
      if (replacement) {
        if (replacement.physicalPages !== 2) throw Error('Approved replacement must be two pages');
        doc.approvedReplacement = {...replacement, previousPdf:doc.pdf, previousSha256:doc.sha256};
        doc.pdf = replacement.pdf; doc.sha256 = replacement.sha256; doc.physicalPages = 2;
      }
      doc.startPage = cursor; doc.endPage = cursor + doc.physicalPages - 1;
      doc.blankAfterPages = doc.type === 'vegetable' ? doc.physicalPages % 2 : 0;
      doc.blankFoliosAfter = Array.from({length:doc.blankAfterPages}, (_, i) => doc.endPage + i + 1);
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

export function renderUpdatedContents(data, units, plan) {
  const toc = data.contents, extra = toc.expanded;
  if (!extra) throw Error('Missing expanded contents copy');
  const edition = plan.editions[units];
  const sources = new Map(edition.additions.map(d => [d.source, d.startPage]));
  for (const d of edition.sectionOpeners) sources.set(d.source, d.startPage);
  sources.set('opening:how-to', 9); sources.set('back:index', edition.index.startPage);
  const documents = new Map(edition.documents.map(d => [d.type + ':' + d.key, d]));
  if (documents.size !== edition.documents.length) throw Error('Duplicate guide identity');
  const seen = new Set(), references = [];
  const links = new Map([...extra.gettingStarted.entries, ...extra.groups.flatMap(g => g.entries), extra.index].map(x => [x.source, x]));
  if (links.size !== sources.size) throw Error('Missing or duplicate contents destination');
  const destination = source => {
    const item = links.get(source), folio = sources.get(source);
    if (!item || !Number.isInteger(folio) || seen.has(source)) throw Error('Missing or duplicate contents destination: ' + source);
    seen.add(source); references.push({...item, startPage:folio}); return {item, folio};
  };
  const row = source => {
    const {item, folio} = destination(source);
    return `<li data-source="${esc(source)}"><span>${esc(item.label)}</span><span class="page-ref">${folio}</span></li>`;
  };
  const guideRow = (item, type) => {
    const identity = type + ':' + item.key, doc = documents.get(identity);
    if (!doc || seen.has(identity)) throw Error('Missing or duplicate guide: ' + identity);
    seen.add(identity); references.push({type, key:item.key, label:item.label, startPage:doc.startPage});
    return `<li data-toc="${esc(item.label)}"><span>${esc(item.label)}</span><span class="page-ref">${doc.startPage}</span></li>`;
  };
  const section = source => {
    const {item, folio} = destination(source);
    return `<h2 class="contents-section" data-source="${esc(source)}"><span>${esc(item.label)}</span><span class="page-ref">${folio}</span></h2>`;
  };
  const art = (folio,role) => contentsArtwork.filter(a=>a.folio===folio&&a.role===role).map(a=>`<img src="/${esc(a.file)}" alt="" aria-hidden="true" data-artwork="${a.id}">`).join('');
  const sheet = (folio, body) => `<section class="sheet ${folio % 2 === 0 ? 'verso' : ''} contents-unified" data-folio="${folio}"><div class="content"><header class="contents-header"><h1>${esc(extra.page.heading.text)}</h1>${art(folio,'header')}</header>${body}${folio===5?`<div class="contents-lower-art" aria-hidden="true">${art(folio,'lower')}</div>`:''}</div><footer><span>${esc(data.book.title.toUpperCase())}</span><span>${units.toUpperCase()} · ${folio}</span></footer></section>`;
  const crops = toc.families.flatMap(f => f.entries);
  const first = sheet(4, `<ul class="opening-list">${['technique:why-grow'].map(row).join('')}</ul>${section('opening:varieties')}<div class="contents-grid"><ul>${row('opening:how-to')}${crops.slice(0,21).map(x => guideRow(x,'vegetable')).join('')}</ul><ul>${crops.slice(21).map(x => guideRow(x,'vegetable')).join('')}</ul></div>`);
  const second = sheet(5, `<div class="contents-grid"><section>${section('opening:troubles')}<ul>${toc.troubles.map(x => guideRow(x,'trouble')).join('')}</ul></section><section>${section('opening:techniques')}<ul>${extra.groups.flatMap(g => g.entries).map(x => row(x.source)).join('')}</ul><ul class="index-link">${row(extra.index.source)}</ul></section></div>`);
  if (seen.size !== sources.size + documents.size || [...sources.keys(),...documents.keys()].some(s => !seen.has(s))) throw Error('Contents do not cover every destination');
  if (references.some((r,i) => i && r.startPage < references[i-1].startPage)) throw Error('Contents are not in manuscript order');
  return {body:first + second, references};
}
