// Frozen approved-page assembly. No catalogue export or legacy opener regeneration.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {root} from './lib/book-content.mjs';
const python=process.env.BOOK_PYTHON||'/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const manifest=path.join(root,'docs/publication/whole-book-order-preview/navigation-polish-2026-11-22/SOURCE.json');
if(!fs.existsSync(manifest))throw new Error('The approved 22 November source manifest is missing. Restore it before rebuilding; do not fall back to older page designs.');
for(const kind of ['reading','native']) {
  execFileSync(python,['scripts/book-navigation-polish.py','build',kind],{cwd:root,stdio:'inherit'});
  execFileSync(python,['scripts/book-navigation-polish.py','verify',kind],{cwd:root,stdio:'inherit'});
}
execFileSync(python,['scripts/book-navigation-polish.py','install'],{cwd:root,stdio:'inherit'});
console.log('Current contents, index and Troubles presentation rebuilt and checked. Installation requires the exact visually inspected output hashes. Supplier files are unchanged.');
