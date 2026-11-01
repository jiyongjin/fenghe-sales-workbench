/*!
 * Copyright (c) 2026 风禾永进 (https://yongjin.tech)
 * SPDX-License-Identifier: MIT
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createCsvStore } from '../server/csv-store.mjs';
import { defaultsFor, normalizeProfilePreferences, validateRow } from '../lib/workbench-model.mjs';
import { parseCsv, stringifyCsv } from '../lib/csv.mjs';

test('legacy themes and missing appearance columns remain compatible', () => {
  for (const [before, after] of [['简约','云境'], ['热情','曜金'], ['冷静','潮汐']]) {
    const row = { ...defaultsFor('profiles'), name:'演示人物', theme:before };
    delete row.text_size; delete row.density;
    assert.doesNotThrow(() => validateRow('profiles', row));
    const preferences = normalizeProfilePreferences(row);
    assert.equal(preferences.theme, after);
    assert.equal(preferences.text_size, '舒适');
    assert.equal(preferences.density, '专注');
    assert.equal(row.theme, before, 'reading preferences must not mutate CSV rows');
  }
  assert.throws(() => validateRow('profiles', { ...defaultsFor('profiles'), name:'演示', text_size:'无效' }), /选项/);
});

test('new preferences persist after restart without losing other profiles or custom columns', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'fenghe-appearance-'));
  const store = createCsvStore(dir); await store.initialize();
  const file = path.join(dir, 'profiles.csv');
  const legacy = parseCsv(await readFile(file, 'utf8'));
  for (const row of legacy) { delete row.text_size; delete row.density; row.custom_field='保持原样'; }
  legacy[0].theme='热情';
  await writeFile(file, stringifyCsv(legacy,Object.keys(legacy[0])), 'utf8');
  let snapshot = await store.snapshot();
  const profile = normalizeProfilePreferences(snapshot.tables.profiles[0]);
  const other = { ...snapshot.tables.profiles[1] };
  snapshot = await store.mutate({table:'profiles',row:{...profile,theme:'云境',text_size:'大字',density:'舒展'},userId:profile.id,expectedRevision:snapshot.revisions.profiles});
  const restarted = createCsvStore(dir); await restarted.initialize();
  const saved = (await restarted.snapshot()).tables.profiles;
  assert.equal(saved[0].text_size, '大字');
  assert.equal(saved[0].density, '舒展');
  assert.equal(saved[0].custom_field, '保持原样');
  assert.equal(saved[1].name, other.name);
  assert.equal(saved[1].theme, other.theme);
  assert.equal(saved[1].custom_field, '保持原样');
});
