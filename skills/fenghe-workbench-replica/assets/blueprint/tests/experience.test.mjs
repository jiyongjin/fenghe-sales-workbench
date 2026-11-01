import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, unlink } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createCsvStore } from '../server/csv-store.mjs';
import { defaultsFor } from '../lib/workbench-model.mjs';
import { periodStart, localCoachReply } from '../lib/companion.mjs';

test('review periods are daily, rolling seven days and month to date',()=>{
  assert.equal(periodStart('日报','2026-10-13'),'2026-10-13');
  assert.equal(periodStart('周报','2026-10-03'),'2026-09-27');
  assert.equal(periodStart('月报','2026-10-13'),'2026-10-01');
});
test('coach labels offline limits and chooses inspiration before incidental customer keywords',()=>{
  const facts={pending:[{title:'低优先级整理',priority:3,due:'2026-10-13'},{title:'优先推进',priority:0,due:'2026-10-14'}],completedToday:2,note:'客户复盘中的一个创作观察'};
  assert.match(localCoachReply('今日安排',facts),/优先推进/);
  assert.ok(!localCoachReply('今日安排',facts,'疲惫').includes('低优先级整理'));
  assert.match(localCoachReply('展开灵感：客户复盘中的创作观察',facts),/把想法变成一个小作品/);
  assert.match(localCoachReply('拜访准备',facts),/提问清单/);
  assert.match(localCoachReply('晚间复盘',facts),/完成 \*\*2 项/);
  assert.match(localCoachReply('一个尚不支持的问题',facts),/离线规则教练/);
});
test('legacy data gains notes and reviews without overwriting existing business files',async()=>{
  const directory=await mkdtemp(path.join(os.tmpdir(),'fenghe-experience-'));
  const store=createCsvStore(directory);await store.initialize();
  const before=await readFile(path.join(directory,'tasks.csv'),'utf8');
  await unlink(path.join(directory,'notes.csv'));await unlink(path.join(directory,'reviews.csv'));
  await store.initialize();const snapshot=await store.snapshot();
  assert.deepEqual(snapshot.tables.notes,[]);assert.deepEqual(snapshot.tables.reviews,[]);
  assert.equal(await readFile(path.join(directory,'tasks.csv'),'utf8'),before);
});
test('notes, linked actions and edited review snapshots survive restart and stay profile scoped',async()=>{
  const directory=await mkdtemp(path.join(os.tmpdir(),'fenghe-notes-'));const store=createCsvStore(directory);await store.initialize();
  let snapshot=await store.snapshot();const userId='person-yongjin';
  const save=async(table,row)=>{snapshot=await store.mutate({table,row,userId,expectedRevision:snapshot.revisions[table]});return snapshot.tables[table].at(-1);};
  const note=await save('notes',{...defaultsFor('notes',userId),title:'灵感测试',body:'有逗号,\n有"引号"'});
  const task=await save('tasks',{...defaultsFor('tasks',userId),title:'来自手记',note_id:note.id});
  assert.equal(task.note_id,note.id);
  await assert.rejects(store.mutate({table:'notes',op:'delete',row:note,userId,expectedRevision:snapshot.revisions.notes}),/关联/);
  await assert.rejects(store.mutate({table:'tasks',row:{...defaultsFor('tasks','person-lin'),title:'跨人物关联',note_id:note.id},userId:'person-lin',expectedRevision:snapshot.revisions.tasks}),/不属于/);
  const review=await save('reviews',{...defaultsFor('reviews',userId),title:'我的周复盘',period:'周报',body:'# 我的周复盘\n\n## 收获\n\n只做重要的事。'});
  snapshot=await store.mutate({table:'reviews',row:{...review,body:review.body+'\n\n补充：调整方法。'},userId,expectedRevision:snapshot.revisions.reviews});
  const restarted=createCsvStore(directory);await restarted.initialize();const result=await restarted.snapshot();
  assert.match(result.tables.reviews.find(r=>r.id===review.id).body,/补充：调整方法/);
  assert.equal(result.tables.notes.find(n=>n.id===note.id).body,'有逗号,\n有"引号"');
});
