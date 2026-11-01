import { mkdir, readdir, lstat, readFile, writeFile, copyFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const skill = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--target') throw new Error('用法：node replicate.mjs --target <新的空项目目录>');
const target = path.resolve(args[1]);
const inside = (child, parent) => child === parent || child.startsWith(parent + path.sep);
if (target === path.parse(target).root || target === os.homedir() || inside(target,skill) || inside(skill,target)) throw new Error('目标不能是根目录、用户主目录、技能目录或其父目录');
const existing = await lstat(target).catch(error=>{if(error.code==='ENOENT')return null;throw error;});
if (existing && (!existing.isDirectory() || existing.isSymbolicLink() || (await readdir(target)).length)) throw new Error('目标已存在且非空/非普通目录；未改动任何文件。请指定新目录。');
const manifest = JSON.parse(await readFile(path.join(skill,'references/source-manifest.json'),'utf8'));
const source = path.join(skill,'assets/blueprint');
// Validate all template content before creating any target files.
for (const item of manifest.blueprint_files) {
  const file = path.resolve(source,item.path);
  if (!inside(file,source) || file===source || (await lstat(file)).isSymbolicLink()) throw new Error('蓝本路径不合法');
  const hash = createHash('sha256').update(await readFile(file)).digest('hex');
  if (hash !== item.sha256) throw new Error(`蓝本完整性校验失败：${item.path}`);
}
await mkdir(target,{recursive:true});
for (const item of manifest.blueprint_files) {
  const destination = path.resolve(target,item.path);
  if (!inside(destination,target) || destination===target) throw new Error('输出路径越界');
  await mkdir(path.dirname(destination),{recursive:true});
  await copyFile(path.join(source,item.path),destination,constants.COPYFILE_EXCL);
}
await writeFile(path.join(target,'REPLICA-PROVENANCE.json'),JSON.stringify({template:'fenghe-workbench-v4-local',source_commit:manifest.source_commit,created_at:new Date().toISOString(),data:'not copied; generated on first local launch',blueprint_files:manifest.blueprint_files},null,2)+'\n',{encoding:'utf8',flag:'wx'});
console.log(JSON.stringify({status:'created',target,files:manifest.blueprint_files.length,start:'启动个人工作台.cmd',url:'http://127.0.0.1:4318/',data_copied:false,network_or_model_configured:false},null,2));
