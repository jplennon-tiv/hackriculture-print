import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {bookLayoutRevision, readBookLayout, saveBookLayout, validateBookLayout, bookLayoutFiles} from '../../hackriculture-data/lib/book-layout.mjs';
import {root, sharedRoot, renderOpeningPages, renderEntryPages} from './lib/book-content.mjs';

const data = readBookLayout();
const plan = JSON.parse(fs.readFileSync(path.join(root, 'docs/publication/book-preparation/ASSEMBLY-PLAN-BOOKVAULT.json'), 'utf8'));
const themes = JSON.parse(fs.readFileSync(path.join(root, 'src/print/familyThemes.json'), 'utf8'));
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'guru-book-copy-'));
  t.after(() => fs.rmSync(dir, {recursive: true, force: true}));
  fs.mkdirSync(path.join(dir, 'book-layout'));
  fs.copyFileSync(path.join(sharedRoot, 'records.json'), path.join(dir, 'records.json'));
  for (const name of bookLayoutFiles) fs.writeFileSync(path.join(dir, 'book-layout', name + '.json'), JSON.stringify(data[name], null, 3) + '\n\n');
  return dir;
}
test('paragraph edits render as escaped text, not HTML', () => {
  const copy = structuredClone(data); copy.author.paragraphs = ['A new paragraph with "quotes" & <script>alert(1)</script>.'];
  const {body} = renderOpeningPages(copy, 'imperial');
  assert.ok(body.includes('&lt;script&gt;alert(1)&lt;/script&gt;'));
  assert.ok(!body.includes('<script>'));
  assert.ok(body.includes('A new paragraph'));
});
test('contents display labels can change without changing identity or folios', () => {
  const copy = structuredClone(data), item = copy.contents.families[0].entries[0];
  item.label = 'A renamed display label';
  for (const units of ['imperial', 'metric']) {
    const output = renderEntryPages(copy, units, plan, themes);
    const ref = output.contents.find(r => r.key === item.key && r.type === 'vegetable');
    assert.equal(ref.startPage, plan.editions[units].documents.find(d => d.key === item.key && d.type === 'vegetable').startPage);
    assert.equal(ref.label, item.label); assert.equal(output.contents.length, 58);
  }
  const bad = structuredClone(plan); bad.editions.imperial.documents.find(d => d.type === 'vegetable').key = 'missing';
  assert.throws(() => renderEntryPages(copy, 'imperial', bad, themes), /assembly reference/);
});
test('validation identifies malformed copy and duplicate record keys', () => {
  const copy = structuredClone(data); copy.author.paragraphs = 'not an array';
  assert.throws(() => validateBookLayout(copy), /author.json.paragraphs/);
  copy.author = data.author;
  copy.contents.families[0].entries[1].key = copy.contents.families[0].entries[0].key;
  assert.throws(() => validateBookLayout(copy), /exactly once/);
});
test('guarded saves back up exact bytes, preserve unknown fields, and leave other documents alone', t => {
  const dir = fixture(t), bookPath = path.join(dir, 'book-layout/book.json');
  const before = fs.readFileSync(bookPath), contentsBefore = fs.readFileSync(path.join(dir, 'book-layout/contents.json'));
  const book = {...data.book, authorName: 'A test author', futureField: {keep: true}};
  const result = saveBookLayout({book}, {root: dir, expectedRevision: bookLayoutRevision(dir), actor: 'test author'});
  assert.equal(result.changed, 1);
  const journal = JSON.parse(fs.readFileSync(path.join(dir, result.backup, 'transaction.json'), 'utf8'));
  assert.equal(journal.state, 'complete'); assert.equal(journal.files[0].fields['/authorName'].updated_by, 'test author');
  assert.equal(journal.files[0].fields['/title'], undefined);
  assert.deepEqual(fs.readFileSync(path.join(dir, result.backup, journal.files[0].backup)), before);
  const next = readBookLayout({root: dir}); assert.deepEqual(next.book.futureField, {keep: true});
  assert.deepEqual(fs.readFileSync(path.join(dir, 'book-layout/contents.json')), contentsBefore);
  const noOp = saveBookLayout({book: next.book}, {root: dir, expectedRevision: result.revision, actor: 'test author'});
  assert.equal(noOp.changed, 0); assert.equal(noOp.backup, undefined);
});
test('stale revisions, active writers and invalid multi-file saves cannot overwrite copy', t => {
  const dir = fixture(t), revision = bookLayoutRevision(dir), file = path.join(dir, 'book-layout/author.json');
  fs.appendFileSync(file, '\n');
  assert.throws(() => saveBookLayout({book: data.book}, {root: dir, expectedRevision: revision, actor: 'test'}), {code: 'STALE_DATA'});
  const fresh = bookLayoutRevision(dir);
  assert.throws(() => saveBookLayout({book: {...data.book, title: 'Changed'}, author: {paragraphs: []}}, {root: dir, expectedRevision: fresh, actor: 'test'}), /author.json/);
  assert.equal(bookLayoutRevision(dir), fresh);
  fs.writeFileSync(path.join(dir, '.records.lock'), '');
  assert.throws(() => saveBookLayout({book: data.book}, {root: dir, expectedRevision: fresh, actor: 'test'}), /busy/);
  assert.ok(fs.existsSync(path.join(dir, '.records.lock')));
});
test('malformed JSON names the file', t => {
  const dir = fixture(t); fs.writeFileSync(path.join(dir, 'book-layout/author.json'), '{broken');
  assert.throws(() => readBookLayout({root: dir}), /book-layout\/author.json:/);
});
test('a failed multi-file replacement restores preceding bytes and journals the rollback', t => {
  const dir = fixture(t), before = bookLayoutRevision(dir), rename = fs.renameSync;
  let failed = false;
  t.mock.method(fs, 'renameSync', (from, to) => {
    if (!failed && to === path.join(dir, 'book-layout/author.json')) {failed = true; throw Error('Simulated write failure');}
    return rename(from, to);
  });
  assert.throws(() => saveBookLayout({book: {...data.book, authorName: 'Changed'}, author: {...data.author, heading: 'Changed'}}, {root: dir, expectedRevision: before, actor: 'test'}), /Simulated/);
  assert.equal(bookLayoutRevision(dir), before);
  const backup = fs.readdirSync(path.join(dir, 'backups/admin'))[0];
  const journal = JSON.parse(fs.readFileSync(path.join(dir, 'backups/admin', backup, 'transaction.json'), 'utf8'));
  assert.equal(journal.state, 'rolled_back');
  assert.ok(!fs.existsSync(path.join(dir, '.records.lock')));
});
test('an unresolved rollback retains the lock and prepared journal for investigation', t => {
  const dir = fixture(t), rename = fs.renameSync;
  t.mock.method(fs, 'renameSync', (from, to) => {
    if (to === path.join(dir, 'book-layout/author.json')) throw Error('Persistent write failure');
    return rename(from, to);
  });
  assert.throws(() => saveBookLayout({author: {...data.author, heading: 'Changed'}}, {root: dir, expectedRevision: bookLayoutRevision(dir), actor: 'test'}), /save and rollback failed/);
  assert.ok(fs.existsSync(path.join(dir, '.records.lock')));
  const backup = fs.readdirSync(path.join(dir, 'backups/admin'))[0];
  const journal = JSON.parse(fs.readFileSync(path.join(dir, 'backups/admin', backup, 'transaction.json'), 'utf8'));
  assert.equal(journal.state, 'prepared');
});
