// Reassemble the crop's saved three-page trial as the book's facing pair.
export function assembleRevision({folios, links}) {
  const one = selector => document.querySelector(selector);
  const planting = one('.planting');
  const care = one('.care');
  // Reunite the three-page study's original blocks on the recto.
  const root = one('.rich-print');
  const recto = one('.sheet.recto');
  const third = one('.mock-continuation');
  const growing = (third || recto).querySelector('.growing-columns');
  growing.classList.remove('continuation-columns');
  root.classList.remove('three-page-sowing');
  const soil = one('.soil');
  const harvest = one('.harvest');
  const footer = recto.querySelector('footer');
  for (const block of [growing, one('.pests'), one('.tips')]) recto.insertBefore(block, footer);
  growing.children[0].append(soil, planting);
  growing.children[1].append(care, harvest);
  third?.remove();
  soil.classList.remove('full-soil');
  growing.style.gridTemplateColumns = '1fr 1fr';
  planting.classList.add('lead-ins');

  for (const [i, sheet] of [...root.querySelectorAll('.sheet')].entries()) {
    sheet.querySelector('.section-label').textContent = 'VEGETABLE GUIDES';
    sheet.querySelector('.folio').textContent = String(folios[i]);
  }
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'See also');
  nav.append('See also: ');
  for (const [i, link] of links.entries()) {
    if (i) nav.append(' · ');
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.text;
    nav.append(a);
  }
  footer.querySelector('.folio').before(nav);
}

// Try the relative widths of the advice columns and the three table columns
// independently. All measurements include the book title and its live footer.
export function measurePracticalLayout({name, width, problem, signs}) {
  const recto = document.querySelector('.recto');
  const grid = recto.querySelector('.growing-columns');
  const section = selector => recto.querySelector(selector);
  const soil = section('.soil');
  const planting = section('.planting');
  const care = section('.care');
  const harvest = section('.harvest');
  const [left, right] = grid.children;
  soil.classList.toggle('full-soil',name === 'soil above');
  if (name === 'soil above') { grid.before(soil); left.append(planting); right.append(care,harvest); }
  else if (name === 'planting beside care') { left.append(planting); right.append(soil,care,harvest); }
  else { left.append(soil,planting); right.append(care,harvest); }
  grid.style.gridTemplateColumns = `${width}fr ${100-width}fr`;
  const headers = recto.querySelectorAll('.pests thead th');
  for (const [i,header] of [...headers].entries()) header.style.setProperty('width',[problem,signs,100-problem-signs][i]+'%','important');
  const remaining = section('footer').getBoundingClientRect().top - section('.tips').getBoundingClientRect().bottom;
  return remaining * 25.4/96;
}
