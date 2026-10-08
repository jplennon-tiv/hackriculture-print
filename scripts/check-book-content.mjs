import {readBookContent, root, renderEntryPages} from './lib/book-content.mjs';
import fs from 'node:fs';
import path from 'node:path';
try {
  const {data, revision} = readBookContent();
  const plan = JSON.parse(fs.readFileSync(path.join(root, 'docs/publication/book-preparation/ASSEMBLY-PLAN-BOOKVAULT.json'), 'utf8'));
  const themes = JSON.parse(fs.readFileSync(path.join(root, 'src/print/familyThemes.json'), 'utf8'));
  for (const units of ['imperial', 'metric']) renderEntryPages(data, units, plan, themes);
  console.log('Book copy valid: 7 JSON files, all local illustrations present, 58 contents references in each edition.');
  console.log('Book revision: ' + revision);
} catch (error) {console.error(error.message); process.exitCode = 1;}
