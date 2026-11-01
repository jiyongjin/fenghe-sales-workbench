import assert from 'node:assert/strict';
import { readFile, mkdtemp } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createServer } from 'node:net';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const args=process.argv.slice(2);const allowModified=args.includes('--allow-modified');const rest=args.filter(a=>a!=='--allow-modified');
if(rest.length!==2||rest[0]!=='--target')throw new Error('用法：node verify-replica.mjs --target <副本目录> [--allow-modified]');
const target=path.resolve(rest[1]);const skill=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const manifest=JSON.parse(await readFile(path.join(skill,'references/source-manifest.json'),'utf8'));const differences=[];
for(const item of manifest.blueprint_files){const file=path.resolve(target,item.path);assert.ok(file.startsWith(target+path.sep),'manifest path escapes target');const data=await readFile(file).catch(()=>null);if(!data||createHash('sha256').update(data).digest('hex')!==item.sha256)differences.push(item.path);}
if(differences.length&&!allowModified)throw new Error(`蓝本有差异，未启动程序：${differences.join(', ')}。授权定制后才可使用 --allow-modified。`);
const { defaultsFor }=await import(pathToFileURL(path.join(target,'lib/workbench-model.mjs')).href);
const { parseCsv }=await import(pathToFileURL(path.join(target,'lib/csv.mjs')).href);
const directory=await mkdtemp(path.join(os.tmpdir(),'fenghe-replica-verify-'));const passed=[];let app;let base;let snap;
async function freePort(){const probe=createServer();probe.listen(0,'127.0.0.1');await once(probe,'listening');const port=probe.address().port;await new Promise(r=>probe.close(r));return port;}
async function start(){const port=await freePort();base=`http://127.0.0.1:${port}`;app=spawn(process.execPath,[path.join(target,'server/local.mjs')],{cwd:target,env:{...process.env,WORKBENCH_PORT:String(port),WORKBENCH_DATA_DIR:directory},stdio:['ignore','pipe','pipe']});let output='';let errors='';app.stderr.on('data',d=>{errors+=d;});await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('测试服务启动超时：'+errors.slice(0,500))),12000);app.stdout.on('data',d=>{output+=d;if(output.includes('Local:')){clearTimeout(timer);resolve();}});app.once('error',e=>{clearTimeout(timer);reject(e);});app.once('exit',code=>{clearTimeout(timer);reject(new Error(`测试服务已退出：${code} ${errors.slice(0,500)}`));});});const response=await fetch(base+'/api/bootstrap',{signal:AbortSignal.timeout(5000)});assert.equal(response.status,200);snap=await response.json();}
async function stop(){if(!app||app.exitCode!==null)return;const current=app;await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('自己的测试子进程未及时退出')),7000);current.once('exit',()=>{clearTimeout(timer);resolve();});current.kill();});}
async function post(table,row,userId='person-yongjin',revision=snap.revisions[table],op='upsert'){const response=await fetch(base+'/api/records',{method:'POST',headers:{'Content-Type':'application/json','X-Workbench-Token':snap.token},body:JSON.stringify({table,row,userId,expectedRevision:revision,op}),signal:AbortSignal.timeout(5000)});return {response,result:await response.json()};}
async function save(table,row){const {response,result}=await post(table,row);assert.equal(response.status,200,result.error);snap={...snap,...result};return snap.tables[table].at(-1);}
try{
  await start();assert.equal(snap.mode,'local');assert.equal(Object.keys(snap.tables).length,13);assert.equal(snap.tables.profiles.length,2);assert.equal(snap.tables.tasks.length,10);passed.push('13 CSV tables, 2 fictional profiles, related demo records');
  const homepage=await fetch(base+'/');assert.equal(homepage.status,200);const html=await homepage.text();assert.match(html,/id="root"/);const assets=[...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map(m=>m[1]);assert.ok(assets.length>=2);for(const asset of assets)assert.equal((await fetch(base+asset)).status,200);passed.push('built HTML, JS and CSS served');
  const unauthorized=await fetch(base+'/api/records',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(unauthorized.status,403);passed.push('write without token rejected');
  const user='person-yongjin';const body='一条灵感, 含"引号"\n换行仍保留。';const oldRevision=snap.revisions.notes;const note=await save('notes',{...defaultsFor('notes',user),title:'复刻自动验收手记',body});assert.equal(note.body,body);const stale=await post('notes',{...note,body:'不应覆盖'},user,oldRevision);assert.equal(stale.response.status,409);passed.push('note save and stale revision conflict');
  const task=await save('tasks',{...defaultsFor('tasks',user),title:'从灵感采纳的行动',note_id:note.id});assert.equal(task.note_id,note.id);const linked=await post('notes',note,user,snap.revisions.notes,'delete');assert.equal(linked.response.status,400);const cross=await post('tasks',{...defaultsFor('tasks','person-lin'),title:'跨人物不应成功',note_id:note.id},'person-lin');assert.equal(cross.response.status,400);passed.push('note-to-task relation, delete guard and profile scope');
  const review=await save('reviews',{...defaultsFor('reviews',user),title:'验收复盘',period:'周报',body:'# 本周收获\n\n**事实**：保存后可以继续阅读。'});const csv=await(await fetch(base+'/api/export?table=notes&user='+user)).text();assert.equal(parseCsv(csv).find(r=>r.id===note.id).body,body);passed.push('review write and CSV special-character export');
  await stop();await start();assert.equal(snap.tables.notes.find(r=>r.id===note.id).body,body);assert.equal(snap.tables.tasks.find(r=>r.id===task.id).note_id,note.id);assert.equal(snap.tables.reviews.find(r=>r.id===review.id).body,review.body);passed.push('restart preserves notes, linked actions and reviews');
  console.log(JSON.stringify({status:'passed',blueprint_files:manifest.blueprint_files.length,modified_files:differences,checks:passed,browser_visual_test:'not performed by this script',external_model_connected:false,test_data_directory:directory,original_project_data_used:false},null,2));
}finally{await stop();}
