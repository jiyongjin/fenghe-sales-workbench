/*!
 * Copyright (c) 2026 风禾永进 (https://yongjin.tech)
 * SPDX-License-Identifier: MIT
 */
import { mkdir, readdir, lstat, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TABLE_NAMES, columnsFor, createDemoData, todayISO } from '../assets/blueprint/lib/workbench-model.mjs';
import { stringifyCsv } from '../assets/blueprint/lib/csv.mjs';

const args=process.argv.slice(2);const snapshot=args.includes('--snapshot');
const rest=args.filter(a=>a!=='--snapshot');
if(rest.length!==2||rest[0]!=='--target')throw new Error('用法：node seed-demo.mjs --target <新的空数据目录> [--snapshot]');
const skill=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const target=path.resolve(rest[1]);
const stat=await lstat(target).catch(e=>{if(e.code==='ENOENT')return null;throw e;});
if(stat&&(!stat.isDirectory()||stat.isSymbolicLink()||(await readdir(target)).length))throw new Error('DEMO目录必须不存在或为空；未覆盖任何数据。');
if(target===path.parse(target).root||target===skill||skill.startsWith(target+path.sep))throw new Error('不安全的DEMO目标');
await mkdir(target,{recursive:true});const tables=snapshot?null:createDemoData();
for(const table of TABLE_NAMES){const csv=snapshot?await readFile(path.join(skill,'assets/demo-fixture',`${table}.csv`),'utf8'):stringifyCsv(tables[table],columnsFor(table));await writeFile(path.join(target,`${table}.csv`),csv,{encoding:'utf8',flag:'wx'});}
console.log(JSON.stringify({status:'created',directory:target,tables:TABLE_NAMES.length,fictional:true,mode:snapshot?'frozen-snapshot':'fresh-relative-dates',reference_date:snapshot?'see assets/demo-fixture/DEMO-MANIFEST.json':todayISO()},null,2));
