// John's 4 November working copy. Metric depths and spacings use the existing book pairs.
export function reviseLeek({unit}) {
  const metric = unit === 'metric';
  const fact = document.querySelector('.fact-grid .new-action-fact');
  const calendar = document.querySelector('.calendar');
  const label = calendar.querySelector('.planting-time b');
  const methods = [...document.querySelectorAll('.sowing-method')];
  const oldHeadings = methods.map(method => method.querySelector('h3').textContent);
  if (fact.querySelector('h3').textContent !== 'Transplant' || label.textContent !== 'MOVE OUT' ||
      oldHeadings.join('|') !== 'Sow in a nursery bed|Lift and transplant|For an earlier crop') {
    throw Error('Expected the reviewed leek source');
  }
  const icon = new Image();
  icon.src = '/images/coloured-icons/style-a-v1/planting.svg';
  icon.alt = '';
  fact.prepend(icon);
  fact.classList.remove('new-action-fact');
  label.textContent = 'TRANSPLANT';
  for (const row of calendar.querySelectorAll('.month-row')) row.style.gridTemplateColumns = '65px repeat(12,1fr)';
  calendar.querySelector('p').textContent = 'Early: sow indoors late winter; transplant in Apr if ready.';

  const sow = methods[0];
  const transplant = methods[1];
  const depth = metric ? '1.5 cm' : '⅝ in.';
  const height = metric ? '20 cm' : '8 in.';
  const hole = metric ? '15 cm' : '6 in.';
  const gaps = metric ? '15–20 cm' : '6–8 in.';
  const rows = metric ? '30 cm' : '12 in.';
  sow.querySelector('p').textContent = `Sow fresh seed thinly, ${depth} deep. This is a small bed for raising plants to move later.`;
  transplant.querySelector('p').textContent = `Lift when the plants are about ${height} tall and pencil-thick. Water dry ground before lifting with a fork. Trim root ends and leaf tips with sharp scissors. Make ${hole} deep holes, ${gaps} apart in rows ${rows} apart. Lower one plant into each hole and water in.`;
  document.querySelector('.method-columns').replaceChildren(sow, transplant);

  const moth = [...document.querySelectorAll('.pests tbody tr')].find(row => row.cells[0].textContent === 'Leek moth');
  if (moth?.cells[1].textContent !== 'Leaf mines, shredded leaves; caterpillars inside.') throw Error('Unexpected leek moth text');
  moth.cells[1].textContent = 'Mined, torn leaves. Caterpillars inside.';
}
