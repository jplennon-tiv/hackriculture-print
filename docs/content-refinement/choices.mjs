// Crop-specific editorial choices, reviewed against the current master, 30 September.
// Additions retain existing approved text; paths record the source of each addition.
export const additions=[];
const add=(key,slot,index,text,paths)=>additions.push({key,slot,index,text,paths});
const care=(k,i,t,p)=>add(k,'looking_after_the_crop',i,t,p.map(n=>'looking_after_the_crop.'+n));
const harvest=(k,i,t,p)=>add(k,'harvesting',i,t,p.map(n=>'harvesting.'+n));
care('artichoke_globe',1,{metric:'Select the retained shoots when they are 20–30 cm high. Replace ageing crowns gradually with suckers from productive plants, replanting in spring.',imperial:'Select the retained shoots when they are 8–12 in. high. Replace ageing crowns gradually with suckers from productive plants, replanting in spring.'},[3,4]);
harvest('artichoke_globe',0,'Very young heads can be eaten almost whole; on older heads, use the fleshy scale bases and heart.',[2]);
care('asparagus',0,'Deep hoeing can damage the roots. Mulch established beds to suppress weeds, leaving growth points clear. Strong summer fern growth builds the reserves for next spring’s spears.',[0,1,2]);
care('asparagus',2,'Fallen berries can produce unwanted seedlings throughout the bed.',[3]);
harvest('asparagus',1,'Use a sharp knife and avoid adjacent emerging shoots. Check every few days in cool weather and daily in warm spells.',[3,4]);
care('aubergine',1,'For large-fruited varieties, remove further flowers after five or six fruits have set; small-fruited varieties can carry more. Open greenhouse vents on warm days to admit pollinating insects.',[3]);
care('bean_broad',0,'Put stout stakes at the ends or corners of the rows and add intermediate stakes along long rows; run strings around the plants.',[2]);
care('bean_broad',1,'Check seedlings and container crops before flowering too, as they may need water earlier.',[1]);
harvest('bean_broad',1,'Beans picked at this stage are sweet and creamy; leaving them to mature makes them starchier.',[2]);
care('bean_french',2,'Dry roots can cause flower drop and poor pod set, particularly on fast-growing climbing plants.',[2]);
harvest('bean_french',2,'Hang plants upside down under cover so air can circulate around the ripening pods.',[3]);
care('bean_runner',0,'Mulch is particularly useful on light soils and in dry gardens, where roots dry out quickly.',[1]);
harvest('bean_runner',0,'Use two hands, supporting the vine with one while removing the pod with the other, to avoid tearing stems from their supports.',[1]);
care('beet_leaf',0,'Leave the strongest seedlings. Keep the ground clean while plants establish so that weeds do not compete with the young crop.',[0,1]);
care('beet_leaf',1,'Steady moisture maintains picking quality and keeps new leaves tender.',[2]);
harvest('beet_leaf',0,'Twist or pull each outer leaf downwards gently. Do not strip a plant bare: its central leaves must continue feeding the plant.',[0,1]);
harvest('beet_leaf',1,'Chard midribs take longer to cook than the leaf blades, so start them first. Larger leaves are edible but tougher than young salad leaves.',[2]);
harvest('beet_leaf',2,'In a mild winter this second flush may last a month or two before flowering stems appear.',[3]);
care('beetroot',1,'A mulch can help even out moisture. Dry conditions reduce yield as well as making roots woody.',[3]);
harvest('beetroot',0,'Take roots from clumps gently so that the smaller plants can continue swelling; a well-maintained patch can crop for two months or more.',[1]);
care('broccoli',0,'A cover touching the leaves lets pigeons peck through it. Late calabrese is especially vulnerable to caterpillar damage.',[0,2]);
harvest('brussels_sprouts',1,'Do not leave mature buttons on the stem too long: slugs, frost and fungal spots can spoil older sprouts.',[2]);
harvest('cabbage',0,'Using thinnings as spring greens gives the remaining plants space to heart and spreads the harvest beyond a single cut.',[0]);
harvest('cabbage',2,'Keep only sound heads for longer storage and inspect them regularly so that rot does not spread.',[4]);
care('capsicum',0,'Mulch to keep moisture even. Water at the roots rather than over the fruit, which can rot if kept damp.',[1,2]);
care('capsicum',1,'Check leaf undersides for red spider mite; introduce suitable biological control early if needed. In hot weather, damp down the greenhouse floor while maintaining airflow.',[3,4]);
harvest('capsicum',0,'Reaching full colour can take another two to four weeks. Green picking generally gives an earlier, heavier crop; leaving fruit to ripen gives fuller flavour but fewer fruits.',[0,1]);
harvest('capsicum',1,'Spread or hang chillies so air can circulate. Use fully ripe fruit for drying; partly coloured fruit can go mouldy. Late peppers ripen slowly as autumn cools.',[2,3]);
care('carrot',2,'Soak sufficiently for moisture to reach the roots; light surface watering is of little use.',[2]);
harvest('carrot',1,'Roots left standing in late autumn grow slowly and become more exposed to slug or maggot damage.',[1]);
harvest('cauliflower',1,'Cut each plant as soon as it is ready rather than waiting for the whole row. Even a smaller tight curd is better than one left to open.',[2]);
harvest('cauliflower',-1,'One curd is the whole crop from a plant. Cut well below the head for immediate use, then clear the plant so the ground is available for the next crop.',[3]);
care('celeriac',0,'Its shallow, fibrous roots dry readily; consistent moisture helps the swollen stem-base reach a useful size.',[1]);
care('celeriac',1,'Do not earth it up like celery. Draw loose soil away if hoeing has buried the crown, and remove unwanted side shoots.',[3,4]);
harvest('celeriac',0,'Main lifting for storage is often in October or November, especially where winter waterlogging is likely.',[0]);
harvest('celeriac',1,'Loosen with a spade or trowel and sever the fleshy roots as you lift. Avoid excessive trimming of roots intended for storage; the moist packing helps prevent them drying out.',[1,3]);
harvest('celery',0,'Check plants once the leaf canopy has closed: older outer stems become tougher and side shoots can develop at the base.',[0]);
harvest('chicory',2,'Light makes pale chicon leaves greener and more bitter. A second crop is usually smaller than the first.',[2,3]);
care('cucumber_greenhouse',0,'Keep the plant from becoming a dense tangle. Depending on the variety, one or two upper side shoots can trail down after the leader reaches its support.',[2,3]);
care('cucumber_greenhouse',2,'Check the seed packet: varieties that require pollination must retain their male flowers.',[4]);
harvest('cucumber_greenhouse',0,'Cut rather than pull fruit from the vine. Mature fruit left to ripen can slow or stop the production of new flowers and cucumbers.',[1,2]);
care('cucumber_outdoor',1,'Open covers before they overheat the crop. Shelter is most useful while plants are young and vulnerable.',[1]);
care('cucumber_outdoor',2,'On the ground, rest developing fruit on a tile or similar support to keep it clear of wet soil and reduce rotting.',[4]);
harvest('cucumber_outdoor',0,'Outdoor crops develop more slowly than greenhouse crops, but can keep producing from midsummer into early autumn in warm conditions.',[1]);
care('endive',1,'Shade spring or summer crops if necessary during hot spells; hot, dry conditions check growth and encourage bolting.',[1]);
care('endive',3,'Cover only a few plants at a time and check for slugs beneath each cover.',[4]);
harvest('endive',2,'Keep soil around lifted roots and use plants promptly. Continue checking the stored plants and remove leaves as they decay.',[3]);
care('florence_fennel',0,'A surface dressing of compost is useful on light ground or after an earlier crop has used much of the fertility.',[2]);
harvest('florence_fennel',0,{metric:'Baby bulbs can be taken at about 5 cm across; full bulbs are commonly cut at about 10–15 cm while still tender.',imperial:'Baby bulbs can be taken at about 2 in. across; full bulbs are commonly cut at about 4–6 in. while still tender.'},[1]);
care('garlic',0,'The small amount of visible winter growth does not necessarily indicate failure: in cold weather cloves may remain quiet until roots and leaves grow strongly in spring.',[0]);
care('garlic',1,'Use tender scapes raw or cooked. Softneck garlic normally produces no flower stalk and usually stores longer than hardneck types.',[3,4]);
harvest('garlic',1,{metric:'Handle bulbs gently to avoid bruising. Shelter them from rain during curing and avoid temperatures above 30°C; trim only when leaves and skins are dry.',imperial:'Handle bulbs gently to avoid bruising. Shelter them from rain during curing and avoid temperatures above 86°F; trim only when leaves and skins are dry.'},[4,5]);
harvest('kale',1,{metric:'Take shoots while young and tender, typically about 10–12 cm long; timing varies with the variety and weather.',imperial:'Take shoots while young and tender, typically about 4–5 in. long; timing varies with the variety and weather.'},[1]);
// Kohl rabi already carries its fuller harvest text and has under 3 mm below page two.
care('leek',0,'Thick compost or well-rotted manure dressings feed the soil as well as retaining moisture. Do not fill new dibbed holes with dry soil; watering-in is enough.',[0,1]);
care('leek',1,'Raise plants under cover where leek moth is troublesome, and put the mesh in place as soon as they are planted out.',[3]);
harvest('leek',0,'Avoid wrenching out plants from firm ground. Green leaves are useful in soups, stews and stocks as well as the white shank.',[1,5]);
harvest('lettuce',2,'The best quality comes from young, steadily growing plants. Some cut hearts produce small new shoots, useful for an extra picking if other lettuce is scarce.',[2,3]);
care('lettuce',1,'Deep watering encourages roots to reach down; daily light sprinkling can favour slugs and shallow rooting.',[1]);
care('marrow_courgette',0,'A midsummer compost dressing around the roots helps sustain the large leaves and continuing fruit production.',[1]);
harvest('marrow_courgette',0,'Remove small, misshapen first fruits promptly; leaving overgrown fruit on the plant slows further cropping.',[0,1]);
care('squash_pumpkin',0,'Large leaves shade the soil but do not remove the need for watering while fruit swells. Clear weeds before their seeds fall beneath the canopy.',[0,1]);
care('squash_pumpkin',1,'Ordinary eating varieties can carry several fruits on strong plants; the one-fruit approach is for giant show pumpkins. Tiles or boards can keep fruit off persistently wet soil.',[3,4]);
harvest('squash_pumpkin',1,'Bring curing fruit under cover if frost or rain threatens. Keep stored fruit apart and inspect regularly for soft patches. Never carry a squash by its stalk: a break allows rot to enter.',[3,5]);
harvest('mushroom',-1,'Between flushes, maintain the kit’s recommended moisture with clean water and wait for the next crop. Once exhausted, remove old substrate, wash and rinse reusable containers, and let them dry before starting again.',[2,4]);
care('onion_shallot',0,'Shallow roots make onions poor competitors with weeds. Keep autumn plantings clean before winter, when hoeing becomes difficult; use a shallow hoe around established plants.',[0,1,7,9]);
care('onion_shallot',1,'Avoid excess nitrogen, which encourages thick necks and poor storage. Stop watering storage bulbs once they have swollen and are ripening.',[3,7]);
harvest('onion_shallot',1,'Drying often takes about two weeks; wait until necks and outer skins are dry. Use shallow trays, nets or ropes for storage. Overwintered onions generally keep less well than suitable spring crops.',[4,5,12]);
care('oriental_leaves',0,'Fast, steady growth gives tender leaves. Late July and August sowings generally suffer less flea-beetle and butterfly damage than spring or early-summer sowings.',[0,1]);
care('parsnip',1,'Early checks to growth reduce the crop even though mature tap roots can reach deep moisture. Fine compost between established rows helps moisture retention where humus is lacking.',[3,4]);
harvest('parsnip',0,'Do not simply pull against firm ground: long tap roots snap easily. Dry autumn conditions can make lifting cleaner.',[1]);
care('pea',0,'Even dwarf peas benefit from short twiggy sticks, keeping pods clear of dirt and slugs. Fit strong supports for tall varieties before their stems begin to sprawl.',[1,2]);
care('pea',1,'Good support improves airflow through the foliage. Avoid wetting leaves in hot, muggy weather, when mildew spreads readily.',[5]);
harvest('pea',0,'Use two hands, holding the vine while removing each pod so the stem is not torn. Leaving filled pods to ripen reduces further cropping.',[2,3]);
care('potato',0,'Keep leafy tops exposed when earthing up and replenish the covering if tubers emerge. Check beneath mulches for slugs; a mulch does not guarantee undamaged tubers.',[2,3]);
harvest('potato',0,'Flowering alone is not a reliable test for earlies: feel carefully beneath one plant to check tuber size. Remove even tiny tubers at the final lifting to reduce volunteers and disease carry-over.',[0,3]);
harvest('potato',1,'Dry maincrops for a few hours in shade before moving them into darkness. Jute, canvas or paper sacks allow air through; avoid sealed plastic bags.',[4,5]);
// Radish already retains the useful timing and storage distinctions; no padding prose.
care('rhubarb',3,'Do not force the same crown in consecutive years. Allow its leaves to rebuild the plant after forcing, with no further harvest that season.',[4]);
harvest('salsify_scorzonera',2,'Scorzonera can grow on into a second year for larger roots. Salsify is normally lifted in its first winter; roots become less useful as it flowers.',[4]);
care('spinach',1,'Choose hardy winter varieties and ventilate covers in mild weather. Winter growth is slow, so pick lightly.',[2]);
harvest('spinach',0,'Spread pickings across several plants instead of stripping one bare. Regular light picking encourages fresh leaves while leaving the growing centre intact.',[3,4]);
harvest('swede',0,'Where winters are mild, sound roots may remain useful into April, but inspect them and finish before new spring growth begins.',[1,4]);
care('sweet_corn',0,'Cold spring soil slows growth and gives slugs more opportunity; later planting is more reliable on cold, heavy or slug-prone ground.',[0]);
harvest('sweet_corn',0,'Test frequently as the silks brown: the best stage passes quickly. Kernel colour varies by variety and is not a reliable ripeness test on its own.',[2]);
care('tomato_greenhouse',0,'Retain plenty of healthy foliage to feed and shade fruit. Side-shooting applies to cordons; follow the supplier’s pruning advice for bush and semi-determinate varieties.',[1,5]);
care('tomato_greenhouse',1,'Water the soil or compost rather than the leaves. Dry-to-wet swings encourage splitting and blossom-end rot; keep ventilation and shade adjusted as conditions change.',[2,3,7]);
harvest('tomato_greenhouse',0,'Use shallow trays at room temperature for ripening. A ripe apple or banana nearby can help; keep checking and remove any fruit that decays.',[2]);
care('tomato_outdoor',0,{metric:'Add cordon ties about every 30 cm as plants grow and remove side shoots while small, around 2.5 cm long. Keep plenty of healthy foliage.',imperial:'Add cordon ties about every 12 in. as plants grow and remove side shoots while small, around 1 in. long. Keep plenty of healthy foliage.'},[0,1]);
harvest('tomato_outdoor',0,'Keep ripening trays at room temperature; a ripe apple or banana nearby can help. Pick with stalks attached where possible and avoid damaging the skin.',[1,4]);
// Turnip has under 2 mm below page two: preserve its full useful selection.
export const introCaps={bean_french:5,bean_runner:4,beet_leaf:6,beetroot:6,broccoli:4,carrot:5,cauliflower:5,celery:5,cucumber_outdoor:3,mushroom:13,onion_shallot:4,parsnip:5,potato:5,rhubarb:6,salsify_scorzonera:5,sweet_corn:4};
export const notes={artichoke_jerusalem:'Current care and harvest already preserve full useful source advice; retain it.',kohl_rabi:'Full harvest text retained; second page nearly full. No filler added.',radish:'Existing care and harvest retain timing, succession and winter-storage distinctions; no extra prose needed.',turnip:'Second page nearly full; preserve useful selections and avoid additional bulk.',mushroom:'Preserve the kit-growing route; no invented varieties or generic sowing advice to fill the sparse first page.'};
// Measured editorial second pass: retain the highest-value additions on dense pages.
for(let i=additions.length-1;i>=0;i--){const c=additions[i];
 if(c.key==='celery'||c.key==='cucumber_outdoor'&&c.slot==='harvesting'||c.key==='onion_shallot'&&c.slot==='looking_after_the_crop'&&c.index===0||c.key==='potato'&&c.slot==='looking_after_the_crop'||c.key==='sweet_corn'&&c.slot==='looking_after_the_crop')additions.splice(i,1);
}
const revise=(key,slot,index,text)=>{const c=additions.find(c=>c.key===key&&c.slot===slot&&c.index===index);if(!c)throw Error(key);c.text=text;};
revise('leek','looking_after_the_crop',0,'Do not fill new dibbed holes with dry soil; watering-in is enough.');
revise('onion_shallot','looking_after_the_crop',1,'Avoid excess nitrogen: thick-necked bulbs store poorly.');
revise('onion_shallot','harvesting',1,'Wait until necks and outer skins are dry, often about two weeks.');
revise('tomato_greenhouse','looking_after_the_crop',1,'Dry-to-wet swings encourage splitting and blossom-end rot.');
revise('tomato_greenhouse','harvesting',0,'Ripen at room temperature; a ripe apple or banana nearby can help.');
// Retain the one-line header/body relationship where an extra intro sentence forced compaction.
delete introCaps.cucumber_outdoor;delete introCaps.parsnip;delete introCaps.rhubarb;
// Final dense-page choices: keep operational detail rather than explanatory repetition.
revise('leek','looking_after_the_crop',1,'Fit mesh as soon as plants go outside where leek moth is troublesome.');
revise('leek','harvesting',0,'Green leaves are useful in soups, stews and stocks.');
revise('potato','harvesting',0,'Flowering alone is not a reliable readiness test. Remove tiny tubers too, to reduce volunteers and disease carry-over.');
revise('potato','harvesting',1,'Use jute, canvas or paper sacks; avoid sealed plastic bags.');
revise('tomato_greenhouse','looking_after_the_crop',0,'Retain healthy foliage to feed and shade fruit. Follow separate pruning instructions for bush and semi-determinate varieties.');
// Fuller distinctions in shorter columns; no new master claims.
care('tomato_outdoor',1,'Open cloches in warm weather to prevent overheating and keep checking for blight. Search beneath bush foliage for ripe or slug-damaged fruit.',[4,5]);
harvest('tomato_outdoor',0,'Tall outdoor types commonly crop from August to October; bush types may start in July and finish by September. For bottling or green-tomato chutney, use a tested preserving recipe.',[2,5]);
care('radish',0,'Dry checks can make roots hot, woody or pithy, so avoid letting young rows dry out between waterings.',[0,2]);
care('radish',-1,'Sow winter radishes at their recommended later dates. Sowing them too early can send plants to seed in summer instead of producing a useful autumn root crop.',[4]);
care('turnip',2,'Late spring and early summer seedlings particularly benefit from protection. Maintaining moisture and rapid growth also helps them withstand damage.',[3]);
harvest('turnip',0,'Pull larger roots from crowded baby-crop rows first, giving the smaller ones room to grow on.',[1]);
care('kale',0,'Avoid treading heavily on wet soil while tending the crop; check that tall plants remain firm after windy weather.',[0,1]);
harvest('kale',2,{metric:'Cut finished healthy stems into short lengths, about 10–15 cm, to help them break down.',imperial:'Cut finished healthy stems into short lengths, about 4–6 in., to help them break down.'},[5]);
care('kohl_rabi',2,'Steady growth matters: dry checks make swollen stems tough and woody. Autumn crops also need enough room as they grow more slowly in falling temperatures.',[2,3]);
harvest('salsify_scorzonera',0,'Long, slender roots are normal: there is no fixed minimum thickness to wait for before lifting.',[0]);
care('oriental_leaves',2,'Take small regular pickings of pak choi and keep the ground clean; slugs favour its large outer leaves.',[5]);
notes.radish='Useful winter-sowing and drought explanations restored in the shorter column; existing storage timing retained.';
notes.turnip='Page length preserved; only the shorter care/harvest column receives source-linked detail.';
notes.kohl_rabi='Full harvest retained; care expands the reason for steady moisture and autumn spacing.';

additions.find(c=>c.key==='turnip'&&c.slot==='harvesting'&&c.index===0).paths=['looking_after_the_crop.2'];
// Read-through: integrate additions smoothly and remove repeated cautions.
const redundant=additions.findIndex(c=>c.key==='cabbage'&&c.slot==='harvesting'&&c.index===2);if(redundant>=0)additions.splice(redundant,1);
revise('rhubarb','looking_after_the_crop',3,'Do not force the same crown in consecutive years.');
export const textOverrides=[
 {key:'capsicum',slot:'looking_after_the_crop',index:0,text:'Water regularly at the roots without leaving compost sodden. Mulch to keep moisture even and keep fruit dry to reduce rot. Ventilate in hot weather without chilling young plants.'},
 {key:'capsicum',slot:'looking_after_the_crop',index:1,text:'Use an organic potassium-rich feed as fruits swell. Stake and loosely tie tall or heavily laden plants. Check leaf undersides for red spider mite and introduce suitable biological control early if needed. In hot weather, damp down the greenhouse floor while maintaining airflow.'},
 {key:'capsicum',slot:'harvesting',index:0,text:'Cut glossy green fruit for an earlier, heavier crop, or leave it to reach the variety’s mature colour for fuller flavour. Full ripening can take another two to four weeks and usually reduces the number of new fruits produced.'},
 {key:'capsicum',slot:'harvesting',index:1,text:'Cut with a short stalk rather than pulling. For drying, use sound, fully ripe chillies; spread or hang them in a warm, dry, airy place. Partly coloured fruit can go mouldy, and any mouldy fruit should be discarded. Late peppers ripen slowly as autumn cools.'}
];
