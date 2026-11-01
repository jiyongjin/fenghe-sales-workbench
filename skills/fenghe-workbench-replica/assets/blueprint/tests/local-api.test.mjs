/*!
 * Copyright (c) 2026 风禾永进 (https://yongjin.tech)
 * SPDX-License-Identifier: MIT
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtemp, readFile } from 'node:fs/promises';
import { createServer } from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defaultsFor } from '../lib/workbench-model.mjs';
test('HTTP CRUD works across all domains and protects write access', async () => {
  const probe = createServer(); probe.listen(0, '127.0.0.1'); await once(probe,'listening'); const port=probe.address().port; await new Promise((resolve)=>probe.close(resolve));
  const directory = await mkdtemp(path.join(os.tmpdir(),'fenghe-http-'));
  const app = spawn(process.execPath,[fileURLToPath(new URL('../server/local.mjs',import.meta.url))],{env:{...process.env,WORKBENCH_PORT:String(port),WORKBENCH_DATA_DIR:directory},stdio:['ignore','pipe','pipe']});
  try {
    let output=''; await new Promise((resolve,reject)=>{app.stdout.on('data',(chunk)=>{output+=chunk;if(output.includes('Local:'))resolve();});app.once('error',reject);app.once('exit',(code)=>reject(new Error(`server exited ${code}`)));});
    const base=`http://127.0.0.1:${port}`; let snap=await (await fetch(base+'/api/bootstrap')).json(); const token=snap.token;
    const unauthorized=await fetch(base+'/api/records',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({table:'tasks'})});assert.equal(unauthorized.status,403);
    const create=async(table,fields,userId='person-yongjin')=>{const row={...defaultsFor(table,userId),...fields};const res=await fetch(base+'/api/records',{method:'POST',headers:{'Content-Type':'application/json','X-Workbench-Token':token},body:JSON.stringify({table,row,userId,expectedRevision:snap.revisions[table]})});const result=await res.json();assert.equal(res.status,200,result.error);snap={...snap,...result};return snap.tables[table].at(-1);};
    const profile=await create('profiles',{name:'实际新人物',birthday:'1990-01-01',side_enabled:'关闭',theme:'热情'});assert.ok(profile.id);
    const customer=await create('customers',{name:'接口验收客户',tier:'A'});
    const project=await create('projects',{name:'接口验收项目',customer_id:customer.id,kind:'商机',amount:'120',probability:'60'});
    const task=await create('tasks',{title:'接口验收任务',customer_id:customer.id,project_id:project.id,importance:'重要',urgency:'紧急'});
    await create('goals',{name:'月度自定义目标',period:'月度',period_index:'10',unit:'元',target:'20000',actual:'5000'});
    await create('finance',{title:'记账验收',kind:'支出',amount:'68',date:'2026-10-13'});
    await create('health',{date:'2026-10-13',sleep:'7.5',steps:'9000'});
    await create('learning',{title:'学习验收',planned:'120',completed:'30'});
    await create('family',{title:'家庭验收',date:'2026-10-18'});
    await create('content',{title:'内容验收',platform:'公众号',stage:'已发布',publish_date:'2026-10-13'});
    await create('activities',{title:'拜访验收',date:'2026-10-13',customer_id:customer.id,project_id:project.id});
    const completed={...task,status:'已完成',completed_at:'2026-10-13'};
    const update=await fetch(base+'/api/records',{method:'POST',headers:{'Content-Type':'application/json','X-Workbench-Token':token},body:JSON.stringify({table:'tasks',row:completed,userId:'person-yongjin',expectedRevision:snap.revisions.tasks})});assert.equal(update.status,200);
    assert.match(await readFile(path.join(directory,'tasks.csv'),'utf8'),/已完成/);
    const csv=await(await fetch(base+'/api/export?table=tasks&user=person-yongjin')).text();assert.ok(csv.includes('接口验收任务'));assert.ok(!csv.includes('完成本周方案交付'));
  } finally { app.kill(); await once(app,'exit').catch(()=>undefined); }
});
