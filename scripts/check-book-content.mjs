import {readBookContent, root, renderEntryPages} from './lib/book-content.mjs';
import fs from 'node:fs';
import path from 'node:path';
import {bookLayoutFiles} from '../../hackriculture-data/lib/book-layout.mjs';
import {renderUpdatedContents} from './lib/book-contents.mjs';
try {
  const {data, revision} = readBookContent();
  const plan = JSON.parse(fs.readFileSync(path.join(root, 'docs/publication/book-preparation/ASSEMBLY-PLAN-BOOKVAULT.json'), 'utf8'));
  const themes = JSON.parse(fs.readFileSync(path.join(root, 'src/print/familyThemes.json'), 'utf8'));
  for (const units of ['imperial', 'metric']) renderEntryPages(data, units, plan, themes);
  let references = 58;
  if (data.contents.expanded) {
    const expandedPlan = JSON.parse(fs.readFileSync(path.join(root, 'docs/publication/contents-update/ASSEMBLY-PROPOSAL.json'), 'utf8'));
    for (const units of ['imperial', 'metric']) references = renderUpdatedContents(data, units, expandedPlan, themes).references.length;
  }
  console.log(`Book copy valid: ${bookLayoutFiles.length} JSON files, all local illustrations present, ${references} current contents references in each edition, ${data.index.entries.length} index entries.`);
  console.log('Book revision: ' + revision);
} catch (error) {console.error(error.message); process.exitCode = 1;}
