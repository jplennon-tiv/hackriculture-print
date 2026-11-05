// Source-linked review copy for the 4 November carrot spread.
export function reviseCarrot({unit}) {
  const one = selector => document.querySelector(selector);
  const text = (selector, expected, replacement) => {
    const node = one(selector);
    if (node?.textContent !== expected) throw Error('Unexpected carrot source at ' + selector);
    node.textContent = replacement;
  };
  const metric = unit === 'metric';
  text('.fact-grid article:first-child h3', 'Sow direct', 'Sow');
  text('.sowing_time b', 'DIRECT', 'SOW');
  const extended = one('.new-action-fact');
  if (extended.querySelector('h3').textContent !== 'Extended season') throw Error('Expected Extended season');
  extended.querySelector('p').textContent = 'Early: Mar under cloches. Late: Aug; cover against frost.';
  const snowflake = new Image();
  snowflake.src = '/images/header_chars/season_winter.png';
  snowflake.alt = '';
  extended.classList.remove('new-action-fact');
  extended.prepend(snowflake);

  const planting = one('.planting');
  const methods = [...planting.querySelectorAll('.sowing-method')];
  if (methods.map(x => x.querySelector('h3').textContent).join('|') !== 'Sow direct|Thin only where needed|Extend the season') {
    throw Error('Unexpected planting methods');
  }
  const [sow, , extend] = methods;
  sow.querySelector('h3').textContent = 'Sow';
  const depth = metric ? '1.3 cm' : '½ in.';
  const rows = metric ? '15 cm' : '6 in.';
  sow.querySelector('p').textContent = `Wait if the soil is cold or wet. Make shallow drills ${depth} deep and ${rows} apart, watering them first if dry. Sow very thinly; mixing the seed with dry sand can help. Cover with fine soil or compost and keep moist while the seeds germinate.`;
  extend.querySelector('p').textContent = 'Use short-rooted varieties for early or late crops. Early and later sowings need cloches or a sheltered spot.';
  planting.querySelector('.method-columns').replaceChildren(sow, extend);

  const care = one('.care');
  const thinning = document.createElement('li');
  const spacing = metric ? '5–8 cm' : '2–3 in.';
  thinning.textContent = `Thin crowded seedlings to ${spacing} apart in damp weather or in the evening. Water dry soil first, firm afterwards and clear the thinnings to avoid attracting carrot fly.`;
  care.querySelector('ol').prepend(thinning);

}

// The exposed soil at the left edge of each original drawing is at a
// different height in its transparent canvas. Offset the art, not its caption.
export function alignCarrotSoil() {
  const images = [...document.querySelectorAll('.compact-sequence img')];
  const soilHeights = [545, 323, 533];
  const filenames = ['sow-thinly-v1.png', 'cover-lightly-v1.png', 'thin-later-v1.png'];
  const lines = images.map((img, i) => {
    if (!img.src.endsWith(filenames[i]) || img.naturalHeight !== 887) throw Error('Carrot illustration changed');
    const box = img.getBoundingClientRect();
    const scale = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight);
    return box.top + (box.height - img.naturalHeight * scale) / 2 + soilHeights[i] * scale;
  });
  const offsets = lines.map(y => lines[0] - y);
  for (const [i, img] of images.entries()) img.style.transform = `translateY(${offsets[i]}px)`;
  return offsets.map(y => +(y * 25.4 / 96).toFixed(2));
}
