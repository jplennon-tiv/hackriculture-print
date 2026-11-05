// Working copy for the remaining three crops, against the conventional trial.
export function reviseRemaining({crop,unit}) {
  const metric = unit === 'metric';
  const dim = (imperial, metres) => metric ? metres : imperial;
  const section = name => document.querySelector('.' + name);
  const iconDir = '/images/coloured-icons/style-a-v1/';
  const facts = [...document.querySelectorAll('.fact-grid article')];
  function fact(old, title, value, icon) {
    const node = facts.find(el => el.querySelector('h3').textContent === old);
    if (!node) throw Error('Missing fact: ' + old);
    node.querySelector('h3').textContent = title;
    if (value) node.querySelector('p').textContent = value;
    if (icon) {
      let image = node.querySelector('img');
      if (!image) { image = new Image(); node.prepend(image); }
      image.alt = '';
      image.src = icon.startsWith('/') ? icon : iconDir + icon + '.svg';
      node.classList.remove('new-action-fact');
    }
  }
  function list(name, entries) {
    const ol = section(name).querySelector('ol,ul');
    ol.replaceChildren(...entries.map(copy => {
      const li = document.createElement('li');
      li.textContent = copy;
      return li;
    }));
  }
  function methods(copy) {
    const body = document.querySelector('.planting .method-columns');
    const original = body.querySelector('.sowing-method');
    body.replaceChildren(...copy.map(([title,text]) => {
      const el = original.cloneNode(true);
      el.querySelector('h3').textContent = title;
      el.querySelector('p').textContent = text;
      return el;
    }));
  }
  function tableCopy(label, selector, before, after) {
    const row = [...document.querySelectorAll('.pests tbody tr')].find(r=>r.querySelector('th,strong').textContent===label);
    const el = row?.querySelector(selector);
    if (el?.textContent !== before) throw Error('Changed source row: ' + label);
    el.textContent = after;
  }
  const cal = section('calendar');
  const sowLabel = cal.querySelector('.sowing_time b');
  if (crop === 'beetroot') {
    fact('Sow direct','Sow');
    fact('Later sowings','Later sowings','Sow late May–Jul for storage.','succession');
    sowLabel.textContent = 'SOW';
    methods([['Sow',`Place two seed clusters every ${dim('4 in.','10 cm')}, ${dim('1 in.','2.5 cm')} deep, in rows ${dim('12 in.','30 cm')} apart. Keep the seedbed moist. Soaking the clusters for a few hours or overnight can help germination.`]]);
    list('care',[
      `Each seed cluster can produce several seedlings. When they are ${dim('1 in.','2.5 cm')} high, thin to one plant at each spot. Protect them from birds.`,
      'Hoe gently. Mulch and water evenly. Drought makes roots woody and a sudden soaking can split them.',
      'Fleece can bring the crop forward. Weed beneath it regularly. Pick young leaves to use like spinach.'
    ]);
    list('harvest',[
      'Pull globe roots before they reach cricket-ball size.',
      'Fork up storage roots in autumn without piercing them. Twist off the leaves, leaving short stalks.',
      'In mild winters roots can stay in the ground. Lift before severe frost. Pack sound roots apart in paper sacks or moist sand and keep cool.'
    ]);
  } else if (crop === 'tomato_outdoor') {
    sowLabel.textContent = 'SOW INDOORS';
    fact('Plant out','Plant out','Late May under cloches. Early Jun in the open.','planting');
    fact('Plant spacing','Plant spacing',`${dim('18–24 in.','45–60 cm')} apart. Give vigorous varieties more room. Follow the packet spacing for basket types.`);
    cal.querySelector('p').textContent = 'Bright: usual months · Muted: less usual';
    // The earlier month applies only to protected plants.
    cal.querySelectorAll('.planting-time span')[4].className = 'extra';
    section('intro').textContent = 'Outdoor tomatoes need a warm, sunny spot out of the wind. Choose a variety suited to British summers, whether you buy young plants or raise your own. In cooler gardens a cloche helps the fruit ripen. Tall cordons need a support. Bush varieties need less pruning and can grow in pots or under cloches.';
    list('soil',[
      'Choose a sunny, sheltered spot with fertile, well-drained soil. Add mature compost and improve heavy clay well before planting.',
      'On a patio, use pots or growbags.'
    ]);
    tableCopy('Slugs','td:last-child','Keep fruit off soil; check and hand-pick near vulnerable plants.','Raise low fruit off the soil. Pick off slugs near plants.');
    tableCopy('Aphids','td:last-child','Tolerate light colonies; squash damaging ones; encourage predators.','Squash damaging colonies. Encourage predators.');
    tableCopy('Grey mould (Botrytis)','td span','Grey mould on damaged stems or fruit.','Grey fuzz on damaged stems or fruit.');
    methods([
      ['Sow indoors','Fill pots or a seed tray with seed compost. Keep warm for germination. Give seedlings plenty of light.'],
      ['Prick out and pot on','At the first true leaves, lift tray seedlings into individual pots. Hold a leaf and support the roots. Pot on when the roots fill the pot.'],
      ['Harden off','Introduce plants to outdoor conditions over about two weeks. Protect from frost.'],
      ['Plant out','Wait for warm weather after frost risk has passed. Plants should be well rooted, with the first flowers opening. Water first, keep the rootball intact and plant slightly deeper than in the pot.']
    ]);
    list('care',[
      `Tie cordons about every ${dim('12 in.','30 cm')}. Pinch out side shoots when ${dim('1 in.','2.5 cm')} long. Remove yellow leaves sparingly. Bushes usually need no pruning. Support heavy stems.`,
      'Water roots evenly, especially in pots or growbags. Feed organically as fruit develops. Keep low fruit off wet soil. Ventilate cloches in warmth and check for blight.'
    ]);
    list('harvest',[
      'Pick ripe fruit gently, keeping the stalk if possible. Use promptly. Cordons usually crop August–October and bushes July–September.',
      'Ripen sound green fruit indoors in shallow trays at room temperature. Check for rot. A ripe apple or banana nearby helps. Use tested recipes for bottling or green-tomato chutney.'
    ]);
  } else if (crop === 'potato') {
    fact('Plant tubers','Chit','From midwinter.','germination');
    fact('Preparing & planting','Plant tubers','First earlies late Mar–Apr. Second earlies early–mid Apr. Maincrops mid–late Apr.','/images/heroes/richer-a/potato.png');
    fact('Depth','Trench depth',`About ${dim('6 in.','15 cm')}.`);
    sowLabel.textContent = 'PLANT TUBERS';
    tableCopy('Blight','td','Brown collapsing foliage; tubers may rot.','Brown, collapsed tops. Tubers may rot.');
    tableCopy('Blight','td:last-child','Remove affected haulm; allow skins to set before lifting where possible.','Remove blighted tops. If possible, lift once skins set.');
    tableCopy('Colorado beetle','td:last-child','Contain securely, photograph and report; do not release.','Contain, photograph and report. Do not release.');

    methods([
      ['Chit','Stand certified seed potatoes with their eyes upwards in a cool, light, frost-free place to sprout. Chitting is most useful for first earlies.'],
      ['Plant in the ground',`Early crops need a mild or protected spot. Dig a trench or holes about ${dim('6 in.','15 cm')} deep. Set tubers on the bottom, sprouts up. Cover gently and water well.`],
      ['Under mulch','Lay tubers on the soil. Cover thickly with mulch to exclude light. Top up as they grow and check for slugs.'],
      ['In containers','Use a large pot with drainage holes. Set tubers on a shallow layer of compost. Cover and top up as the stems grow.']
    ]);
    list('care',[
      'Protect shoots from frost. Earth up or mulch to keep tubers covered. Weed carefully. Water as tubers swell, especially in pots.',
      'If blight takes hold, remove affected tops and debris. If conditions allow, wait about two weeks before lifting. Use sound tubers promptly.'
    ]);
    list('harvest',[
      'Test-lift earlies for size. Flowering alone is a poor guide. Eat fresh. Fork up maincrops after the tops die, before hard frost. Gather even tiny tubers to reduce regrowth and disease.',
      'Dry briefly out of strong light. Store sound, dry tubers in paper or hessian sacks somewhere cool, dark and frost-free. Use bruised but sound tubers first. Discard any rot.'
    ]);
  }
  if (crop !== 'beetroot') {
    for (const row of cal.querySelectorAll('.month-row')) row.style.gridTemplateColumns='74px repeat(12,1fr)';
  }
}

// Align the undisturbed edge of the bed. The tomato pictures show a pot and
// open ground, so they do not share a soil datum.
export function levelPlantingPictures(crop) {
  const samples = {
    potato: {files:['sprouts-up-v1.png','cover-gently-v1.png'], edges:[56,87], target:80},
    beetroot: {files:['sow-clusters-v2.png','thin-seedlings-v1.png'], edges:[115,120], target:120}
  };
  const sample = samples[crop];
  if (!sample) return [];
  return [...document.querySelectorAll('.compact-sequence img')].map((image,i) => {
    if (!image.src.endsWith('/'+sample.files[i])) throw Error('Unexpected sequence image');
    const box = image.getBoundingClientRect();
    const height = Math.min(box.height,box.width*image.naturalHeight/image.naturalWidth);
    const dy = (sample.target-sample.edges[i])*height/180;
    image.style.transform = `translateY(${dy}px)`;
    return +(dy*25.4/96).toFixed(2);
  });
}
