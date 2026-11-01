/*!
 * Copyright (c) 2026 风禾永进 (https://yongjin.tech)
 * SPDX-License-Identifier: MIT
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createCsvStore } from '../server/csv-store.mjs';
import { parseCsv, stringifyCsv } from '../lib/csv.mjs';
import { defaultsFor, columnsFor } from '../lib/workbench-model.mjs';

test('CSV round-trip preserves Chinese, commas, quotes, multiline and empty fields', () => {
  const rows = [{ id: '1', title: '学习，生活', notes: '问："下一步"\n再确认', blank: '' }];
  assert.deepEqual(parseCsv(stringifyCsv(rows, Object.keys(rows[0]))), rows);
  assert.throws(() => parseCsv('a,a\n1,2'), /表头/);
  assert.throws(() => parseCsv('a,b\n"unterminated'), /引号/);
});
test('create, update, restart, conflict guard, profile isolation and safe delete', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'fenghe-csv-'));
  const store = createCsvStore(dir); await store.initialize();
  let snap = await store.snapshot(); const userId = snap.tables.profiles[0].id;
  const draft = { ...defaultsFor('tasks', userId), title: '重启后仍能看见', area: '个人生活', notes: '有逗号,\n和"引号"' };
  snap = await store.mutate({ table: 'tasks', row: draft, userId, expectedRevision: snap.revisions.tasks });
  const saved = snap.tables.tasks.find((r) => r.title === draft.title); assert.ok(saved?.id);
  const restarted = createCsvStore(dir); await restarted.initialize();
  assert.equal((await restarted.snapshot()).tables.tasks.find((r) => r.id === saved.id).notes, draft.notes);
  const stale = snap.revisions.tasks;
  snap = await store.mutate({ table: 'tasks', row: { ...saved, status: '已完成', completed_at: '2026-10-13' }, userId, expectedRevision: stale });
  await assert.rejects(store.mutate({ table: 'tasks', row: saved, userId, expectedRevision: stale }), /其他窗口/);
  await assert.rejects(store.mutate({ table: 'tasks', row: saved, userId: 'person-lin', expectedRevision: snap.revisions.tasks }), /其他人物/);
  const customer = snap.tables.customers[0];
  await assert.rejects(store.mutate({ table: 'customers', row: customer, op: 'delete', userId, expectedRevision: snap.revisions.customers }), /关联/);
  assert.ok((await readdir(path.join(dir, 'backups'))).length >= 2);
  const raw = await readFile(path.join(dir, 'tasks.csv'), 'utf8'); assert.equal(raw.charCodeAt(0), 0xfeff);
});
test('invalid import is atomic; custom goal units and external CSV edits survive', async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'fenghe-import-')); const store = createCsvStore(dir); await store.initialize();
  let snap = await store.snapshot(); const userId = 'person-yongjin'; const before = await readFile(path.join(dir,'finance.csv'),'utf8');
  await assert.rejects(store.importRows({table:'finance',rows:[{...defaultsFor('finance',userId),title:'有效',amount:'10'},{...defaultsFor('finance',userId),title:'无效',amount:'-1'}],userId,expectedRevision:snap.revisions.finance}), /范围/);
  assert.equal(await readFile(path.join(dir,'finance.csv'),'utf8'),before);
  snap = await store.mutate({ table:'goals',row:{...defaultsFor('goals',userId),name:'储蓄',unit:'元',target:'50000',actual:'16000'},userId,expectedRevision:snap.revisions.goals });
  assert.equal(snap.tables.goals.at(-1).unit,'元');
  const stale = snap.revisions.goals; const rows = snap.tables.goals; rows.at(-1).actual='22000'; await writeFile(path.join(dir,'goals.csv'), stringifyCsv(rows,columnsFor('goals')),'utf8');
  await assert.rejects(store.mutate({table:'goals',row:{...rows.at(-1),actual:'1'},userId,expectedRevision:stale}), /其他窗口/);
  assert.equal((await store.snapshot()).tables.goals.at(-1).actual,'22000');
});
