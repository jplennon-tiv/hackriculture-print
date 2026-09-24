// Candidate edits stay in memory until the guarded save, after proof checks.
import assert from 'node:assert/strict';
import {layoutDependencies,resolveVegetableExtracts,resolveVegetablePrintLayout} from '../../src/lib/vegetablePrint.ts';
export const crops=['bean_broad','bean_french','marrow_courgette','garlic','radish'];
export function prepare(data){
 const result=structuredClone(data);
 for(const key of crops){const v=result[key];assert.equal(v.ai_print_layout.locked,false);assert.deepEqual(resolveVegetableExtracts(v).warnings,[]);assert.equal(resolveVegetablePrintLayout(v).warning,null);}
 result.bean_broad.troubles['No Pods'].applies_to=['bean_broad'];
 for(const k of ['bean_broad','bean_french']){
  const mice=result[k].troubles.Mice;assert.ok(mice&&!mice.short_text);
  // Keep the original long control in full master advice, then condense the table.
  mice.text+=' '+mice.control;
  mice.control='Trap mice; raise seed in modules; protect sowings.';
 }
 const short=(k,label,text)=>{const row=result[k].troubles[label];assert.ok(row&&!row.short_text);row.short_text=text;};
 short('bean_broad','Black Bean Aphid','Black aphids cluster on soft tips, especially on spring-sown broad beans.');
 short('bean_broad','Pea and Bean Weevil','U-shaped notches mark young leaves; seedlings may be badly damaged.');
 const birds=result.bean_broad.troubles.Birds;birds.text+=' '+birds.control;
 birds.control='Protect seed and seedlings with netting or guards.';
 const mice=result.bean_broad.troubles.Mice;mice.text+=' '+mice.signs;mice.signs='Seeds or seedlings vanish overnight.';
 short('marrow_courgette','SLUGS','Slugs chew seedlings, especially in cold, wet weather.');
 short('marrow_courgette','MILDEW','White powder coats leaves, often late in the season.');
 short('garlic','BIRDS OR FROST LIFTING CLOVES','Cloves lifted by birds or frost.');
 short('radish','BOLTING','Winter radishes sown before July may flower before forming usable roots.');
 for(const key of crops){const v=result[key];v.ai_print_layout.dependencies=layoutDependencies(v);v.ai_print_layout.updated_at=new Date().toISOString();v.ai_print_layout.updated_by='admin: John authorised page-fit corrections; applied by AI:gpt-6-astra';assert.equal(resolveVegetablePrintLayout(v).warning,null);}
 return result;
}
