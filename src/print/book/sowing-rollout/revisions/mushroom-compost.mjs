// This opening panel takes the place normally occupied by the variety list.
export function addMushroomCompostPanel(copy) {
  const front = document.querySelector('.sheet.front');
  const risks = front.querySelector('.key-risks');
  if (!risks || front.querySelector('.varieties, .mushroom-compost')) {
    throw Error('The Mushroom opening no longer has the expected space above Key risks.');
  }
  function element(tag, text) {
    const node = document.createElement(tag);
    node.textContent = text;
    return node;
  }
  const panel = document.createElement('section');
  panel.className = 'mushroom-compost';
  panel.append(element('h2', copy.title), element('p', copy.intro));
  const stages = document.createElement('div');
  stages.className = 'compost-stages';
  for (const { title, text } of copy.stages) {
    const stage = document.createElement('div');
    stage.append(element('h3', title), element('p', text));
    stages.append(stage);
  }
  const smallBatch = element('p', '');
  smallBatch.className = 'small-batch';
  smallBatch.append(element('strong', copy.smallBatch.title), ' ', copy.smallBatch.text);
  panel.append(stages, smallBatch);
  risks.before(panel);
}
