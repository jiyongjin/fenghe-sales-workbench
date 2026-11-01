import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const excluded=new Set(['node_modules','.git','data','dist-local','dist','outputs','validation']);
async function markdown(dir){const result=[];for(const entry of await readdir(dir,{withFileTypes:true})){if(entry.isSymbolicLink())continue;if(entry.isDirectory()){if(!excluded.has(entry.name))result.push(...await markdown(path.join(dir,entry.name)));}else if(entry.name.endsWith('.md'))result.push(path.join(dir,entry.name));}return result;}
const problems=[];let checked=0;const files=await markdown(root);
for(const file of files){const text=await readFile(file,'utf8');const targets=[...text.matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)].map(m=>m[1]);targets.push(...[...text.matchAll(/<(?:img|a)\b[^>]*?(?:src|href)="([^"]+)"/g)].map(m=>m[1]));for(let target of targets){if(/^(https?:|mailto:|data:|#)/.test(target))continue;target=decodeURIComponent(target.split('#')[0]);if(!target)continue;const resolved=path.resolve(path.dirname(file),target);if(!resolved.startsWith(root+path.sep)){problems.push(`${path.relative(root,file)}: out-of-repository link ${target}`);continue;}try{await access(resolved);checked++;}catch{problems.push(`${path.relative(root,file)}: missing ${target}`);}}}
if(problems.length){console.error(problems.join('\n'));process.exitCode=1;}else console.log(JSON.stringify({status:'passed',markdown_files:files.length,relative_links_checked:checked,external_urls_checked:false},null,2));
