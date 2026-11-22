// Frozen approved-page assembly. No catalogue export or legacy opener regeneration.
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {root} from './lib/book-content.mjs';
const python=process.env.BOOK_PYTHON||'/Users/johnlennon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3';
const manifest=path.join(root,'docs/publication/whole-book-order-preview/integration-2026-11-22/SOURCES.json');
if(!fs.existsSync(manifest))throw new Error('The approved 22 November source manifest is missing. Restore it before rebuilding; do not fall back to older page designs.');
for(const step of ['integrate-approved-book','prepare-book-reading-copy','audit-book-resolution','check-book-visuals','install-book-integration'])execFileSync(python,[`scripts/${step}-2026-11-22.py`],{cwd:root,stdio:'inherit'});
console.log('Approved pages assembled and checked. Inspect changed renders before recording a fresh visual review. Supplier files are unchanged.');
