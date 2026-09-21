// One-shot user-requested artwork correction, 21 September 2026.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {readCollection,saveCollections,revision,refreshGenerated} from '../../hackriculture-data/lib/records.mjs';
import {layoutSourceSignature} from '../src/lib/aiPrint.ts';
const rev=revision(),data=readCollection('troubles'),g=data.potato_troubles;
assert.equal(g.ai_layout.status,'draft');
assert.equal(g.ai_layout.source_signature,layoutSourceSignature(g));
const c=g.conditions.gapping;
assert.equal(c.image,'/images/troubles/potato_troubles/gapping.png');
c.image='/images/troubles/potato_troubles/gapping-row-v2.png';
c.image_revision=createHash('sha256').update(fs.readFileSync(new URL('../public'+c.image,import.meta.url))).digest('hex');
g.ai_layout.source_signature=layoutSourceSignature(g);
g.ai_layout.updated_at=new Date().toISOString();
g.ai_layout.updated_by='AI: user-requested Gapping artwork correction (model not recorded)';
console.log(saveCollections({troubles:data},{actor:'User-authorised Gapping artwork correction',expectedRevision:rev}));
refreshGenerated();
