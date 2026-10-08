// Approved Compact Book v1 Kale copy. Exact source matches protect later edits.
// Full canonical prose and the production A4 companions remain untouched.
export function kaleBookCopy(unit: string){
 const shoot=unit==='metric'?'10–12 cm':'4–5 in.';
 const rows=unit==='metric'?'45–60 cm':'18–24 in.';
 const stem=unit==='metric'?'10–15 cm':'4–6 in.';
 return [
  ['.remember>div:nth-child(1) h3','Use settled, fertile soil.','Fertile, settled soil'],
  ['.remember>div:nth-child(1) p','Choose sun or light shade and good drainage; firm transplants securely.','Drain well; firm transplants.'],
  ['.remember>div:nth-child(2) h3','Keep plants steady.','Keep plants steady'],
  ['.remember>div:nth-child(2) p','Water young plants and support loose stems against wind rock.','Water; prevent wind rock.'],
  ['.remember>div:nth-child(3) h3','Keep the spring crop growing.','Spring feeding'],
  ['.remember>div:nth-child(3) p','Feed weak plants organically as growth resumes, only if needed.','Feed only weak spring growth.'],
  ['.soil li:nth-child(1)','Choose sun or light shade and well-drained soil. Kale tolerates many soils, but fertile ground gives heavier crops.','Choose sun or light shade and well-drained soil. Kale tolerates many soils but yields best in fertile ground.'],
  ['.soil li:nth-child(2)','Follow an early crop. Weed and improve the bed with mature compost where needed; let prepared soil settle or use a no-dig bed. Firm transplants without compacting wet ground. Lime only if a soil test indicates a need.','Follow early crops; weed and add mature compost as needed. Use settled or no-dig soil. Firm transplants without compacting wet ground; lime only if a soil test indicates a need.'],
  ['.care li:nth-child(1)','Weed carefully, water young plants and secure loose stems against wind rock. Avoid treading heavily on wet soil while tending the crop; check that tall plants remain firm after windy weather.','Weed carefully and water young plants. Check and secure loose stems after windy weather, without treading heavily on wet soil.'],
  ['.care li:nth-child(3)','Use supported insect-proof mesh where needed. Check beneath covers, keep them clear of leaves and secure bird protection. Leaf colour does not confer immunity.','Support insect-proof mesh where needed and secure bird protection. Keep covers clear of leaves and check beneath them; leaf colour gives no immunity.'],
  ['.care li:nth-child(4)','Use an organic liquid feed only if growth is weak as spring growth resumes; do not feed simply because it is March.','Give an organic liquid feed only if spring growth is weak.'],
  ['.harvest li:nth-child(1)','Pick a few tender outer leaves at a time, leaving the growing top and enough foliage for repeat crops. Avoid tough or yellow leaves.','Pick tender outer leaves little and often. Leave the growing top and enough foliage for repeat crops; reject tough or yellow leaves.'],
  ['.harvest li:nth-child(2)',`Pick tender side shoots from late winter into spring. Removing a mature crown to encourage shoots is a separate harvest route, not a routine requirement for leaf picking. Take shoots while young and tender, typically about ${shoot} long; timing varies with the variety and weather.`,`Pick young, tender side shoots in late winter and spring, usually about ${shoot} long; timing varies with variety and weather. Removing a mature crown encourages shoots; this is a separate method, not routine leaf picking.`],
  ['.harvest li:nth-child(3)',`Pick Red Russian leaves young; baby-leaf picking is not restricted to spring. Chop healthy finished stems before composting; follow disease guidance for affected roots. Cut finished healthy stems into short lengths, about ${stem}, to help them break down.`,`Pick Red Russian leaves young; baby-leaf harvest is not limited to spring. Chop healthy finished stems into short ${stem} pieces to help them compost; follow disease guidance for affected roots.`],
  ['.stages article:nth-child(1) p','Sow thinly in a seed bed or modules. Cover the seed and thin crowded seedlings.','Sow thinly in a seed bed or modules; cover and thin seedlings.'],
  ['.stages article:nth-child(2) p','Move young plants with the lowest leaves just above the soil. Firm well and water in.','Set lowest leaves just above soil; firm well and water in.'],
  ['.measurements>span:first-child',`Final rows Usually ${rows} between rows of full-size plants; adjust for variety and growing method.`,`Final rows Usually ${rows} apart for full-size plants; adjust for variety and method.`,'Final rows'],
  ['.tips>div:nth-of-type(1) p','Choose spacing for your variety and growing method; larger plants need more room.','Match spacing to variety and method; give larger plants more room.'],
  ['.planting>p:nth-of-type(2)','Water nursery rows before lifting. June–early July sowings can follow early crops; transplant promptly when ready, often in July or early August. Allow time to establish and protect both early and late crops from pests.','Water nursery rows before lifting. After early crops, sow June–early July; transplant promptly when ready, often July–early August. Allow establishment time and protect all crops from pests.']
 ].map(([selector,expected,proposed,label])=>({selector,expected,proposed,label}));
}
