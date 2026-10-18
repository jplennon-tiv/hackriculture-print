// Current complete-book route. Reuses approved native page bodies; no catalogue export.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {root} from './lib/book-content.mjs';
import {buildNavigationOverlays} from './lib/book-navigation.mjs';
const python=process.env.BOOK_PYTHON||'/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const poppler=process.env.BOOK_POPPLER||'/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/bin/override';
const run=(bin,args)=>execFileSync(bin,args,{cwd:root,stdio:'inherit',env:{...process.env,PATH:poppler+path.delimiter+process.env.PATH}});
run(process.execPath,['scripts/check-book-content.mjs']);
run(process.execPath,['scripts/build-updated-contents.mjs']);
run(python,['scripts/check-updated-contents.py']);
run(process.execPath,['scripts/build-book-index.mjs','--plan=docs/publication/contents-update/ASSEMBLY-PROPOSAL.json','--topic-map=docs/publication/contents-update/TOPIC-FOLIOS.json','--review-dir=docs/publication/whole-book-order-preview/index','--output-dir=tmp/pdfs/whole-book-order-preview','--start-page=166','--integrated','--book-pdf=/output/pdf/whole-book-order-preview/the-vegetable-guru-order-preview.pdf']);
const footers=await buildNavigationOverlays({includeHeadings:false});
fs.writeFileSync(path.join(root,'docs/publication/whole-book-order-preview/integration-2026-10-18/FOOTERS.json'),JSON.stringify(footers,null,2)+'\n');
run(python,['scripts/integrate-approved-book.py']);
run(python,['scripts/check-book-navigation.py']);
run(python,['scripts/review-whole-book-preview.py']);
console.log('Full preview rebuilt. Inspect the changed pages and record the visual review separately.');
