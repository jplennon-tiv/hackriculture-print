import fs from'node:fs';import assert from'node:assert/strict';import crypto from'node:crypto';
const file='src/print/plantingIllustrations.ts',before=fs.readFileSync('tmp/planting-followup/plantingIllustrations.before.ts','utf8'),after=fs.readFileSync(file,'utf8'),keys=['asparagus','cucumber_outdoor','tomato_greenhouse'],sha=s=>crypto.createHash('sha256').update(s).digest('hex');
// Compare every other crop declaration and all shared resolver/helper code byte for byte.
const strip=s=>keys.reduce((text,k)=>text.replace(new RegExp('^    '+k+': [\\s\\S]*?(?=^    \\w+:|^};)','m'),''),s);
assert.equal(strip(before),strip(after));assert.notEqual(before,after);
const baseline=JSON.parse(fs.readFileSync('docs/vegetable-ai-pilot/PAGE-FILL-CODE-CHECKS.json'));assert.equal(sha(before),baseline.files[file].current);
fs.writeFileSync('docs/vegetable-ai-pilot/PLANTING-FOLLOWUP-CODE-CHECKS.json',JSON.stringify({at:new Date().toISOString(),reason:'Only three crop-specific measurement declarations changed; other crop declarations and shared code byte-identical. Historical PDF evidence retained for unaffected crops.',affected_crops:keys,unaffected_crop_config_and_shared_code_identical:true,files:{[file]:{previous:sha(before),current:sha(after)}}},null,2)+'\n');
console.log('Three crop bindings changed; all other declarations and shared code identical.');
