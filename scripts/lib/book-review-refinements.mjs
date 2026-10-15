// Whole-book presentation only. Frozen topics, shared copy and A4 stay unchanged.
export const sectionNames = {
  vegetable: 'Vegetable Guides', trouble: 'Vegetable Troubles', technique: 'Growing Techniques',
};

export function sectionLabel(folio, edition) {
  if (folio >= edition.index.startPage) return 'INDEX';
  const section = [...edition.sectionOpeners].reverse().find(s => folio >= s.startPage);
  if (!section) return 'THE VEGETABLE GURU';
  const kind = {'opening:varieties':'vegetable','opening:troubles':'trouble','opening:techniques':'technique'}[section.source];
  return sectionNames[kind].toUpperCase();
}

// Topic families share both the running title and the prominent first line.
// Exact source headings guard against applying replacements to changed source copy.
const topic = (source, before, group, name, qualifier) => ({
  source, before, group, lines:[name,qualifier], eyebrow:`Growing Techniques - ${group}`,
});
export const topicHeadings = {
  organic: topic('technique:organic', 'Organic growing:\nthe core ideas', 'Organic growing', 'Organic growing', 'The core ideas'),
  'plot-location': topic('technique:plot-location', 'Start with\nthe right spot', 'Planning a new plot', 'Planning your plot', 'Choosing the right spot'),
  'plot-layout': topic('technique:plot-layout', 'Beds and paths\nthat work for you', 'Beds and paths', 'Beds and paths', 'Straight paths and keyholes'),
  'plot-layout-branching': topic('technique:plot-layout-branching', 'Beds and paths\ncontinued', 'Beds and paths', 'Beds and paths', 'Finger paths and leaf patterns'),
  overview: topic('cultivation:overview', 'Dig or No-Dig\nChoosing your approach', 'Cultivation', 'Dig or No-Dig', 'Choosing your approach'),
  'no-dig': topic('cultivation:no-dig', 'Getting started with\nNo-Dig', 'Cultivation', 'Dig or No-Dig', 'No dig'),
  digging: topic('cultivation:digging', 'Getting started with\nDigging', 'Cultivation', 'Dig or No-Dig', 'Digging part 1'),
  'digging-finish': topic('cultivation:digging-finish', 'Digging continued', 'Cultivation', 'Dig or No-Dig', 'Digging part 2'),
  'compost-bins': topic('technique:compost-bins', 'Making compost\nthe secret’s in the bin', 'Making and using compost', 'Making compost', 'The secret’s in the bin'),
  'compost-use': topic('technique:compost-use', 'Making compost\nfeed it, leave it, use it', 'Making and using compost', 'Making compost', 'Feed it, leave it, use it'),
  rotation: topic('technique:rotation', 'Simple crop\nrotation', 'Crop rotation', 'Crop rotation', 'A simple plan'),
  sowing: topic('technique:sowing', 'Sowing and planting:\na sound start', 'Sowing and planting', 'Sowing and planting', 'A sound start'),
  watering: topic('technique:watering', 'Water the roots,\nread the soil', 'Watering', 'Watering', 'Read the soil, water the roots'),
  'greenhouse-choose': topic('technique:greenhouse-choose', 'Greenhouses\nwhat, where & how big?', 'Greenhouses', 'Greenhouses', 'What, where & how big?'),
  'greenhouse-beds': topic('technique:greenhouse-beds', 'Greenhouse\ngrowing options', 'Greenhouses', 'Greenhouses', 'Pots and raised beds'),
  'greenhouse-no-dig-seasons': topic('technique:greenhouse-no-dig-seasons', 'Greenhouse\ngrowing options', 'Greenhouses', 'Greenhouses', 'No-dig beds and seasons'),
};
