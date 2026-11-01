// Generate local attribution artifacts and refresh only this repository's portable blueprint.
// Does not publish, inspect operational data, or modify the original application.
import { readFile, writeFile, mkdir, readdir, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const skill=path.join(root,'skills/fenghe-workbench-replica');
const blueprint=path.join(skill,'assets/blueprint');
const lock=JSON.parse(await readFile(path.join(root,'package-lock.json'),'utf8'));
const project=JSON.parse(await readFile(path.join(root,'package.json'),'utf8'));
for(const [name,version] of Object.entries(project.dependencies)){
  const installed=JSON.parse(await readFile(path.join(root,'node_modules',name,'package.json'),'utf8').catch(()=>{throw new Error('Run npm ci successfully before preparing distribution notices.');}));
  if(installed.version!==version)throw new Error(`Installed dependency differs from package.json: ${name}`);
}
const licensesDir=path.join(root,'third-party-licenses');await mkdir(licensesDir,{recursive:true});
const inventory=[];const licenseCounts={};
for(const [location,entry] of Object.entries(lock.packages).filter(([name])=>name).sort(([a],[b])=>a.localeCompare(b))){
  const name=location.slice(location.lastIndexOf('node_modules/')+13);const license=entry.license||'UNSPECIFIED';licenseCounts[license]=(licenseCounts[license]||0)+1;
  const item={name,version:entry.version,license,source_archive:entry.resolved||null,local_notices:[]};
  const installed=path.resolve(root,location);if(!installed.startsWith(path.join(root,'node_modules')+path.sep))throw new Error('Unexpected package path');
  let installedMetadata;try{installedMetadata=JSON.parse(await readFile(path.join(installed,'package.json'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
  if(installedMetadata){
    if(installedMetadata.version!==entry.version)throw new Error(`Dependency version differs from lock: ${name}`);
    item.upstream_repository=typeof installedMetadata.repository==='string'?installedMetadata.repository:installedMetadata.repository?.url||null;
    for(const file of await readdir(installed,{withFileTypes:true})){
      if(!file.isFile()||!(/^(licen[cs]e(?:[-_.].*)?|copying(?:[-_.].*)?|notice(?:[-_.].*)?)$/i.test(file.name)))continue;
      const relative=`third-party-licenses/${name.replaceAll('/','__')}/${file.name}`;const destination=path.join(root,relative);
      await mkdir(path.dirname(destination),{recursive:true});await copyFile(path.join(installed,file.name),destination);item.local_notices.push(relative);
    }
  }
  inventory.push(item);
}
await writeFile(path.join(licensesDir,'inventory.json'),JSON.stringify({source:'package-lock.json and installed package notice files',license_counts:licenseCounts,packages:inventory},null,2)+'\n');
const rows=inventory.map(p=>`| ${p.name} | ${p.version} | ${p.license} | ${p.local_notices.length?p.local_notices.map(f=>`[${path.basename(f)}](${f})`).join(' / '):'Optional/not installed on this platform; see locked package source'} |`).join('\n');
const notice=`# Third-party notices / 第三方声明\n\nOriginal project code/documentation is licensed under [MIT](LICENSE). Dependencies keep their own terms; this project does not relicense them.\n\n项目MIT不改变第三方版权和许可证。下表由锁文件与本机安装包导出，包含可选平台依赖，并不表示全部软件都被打包分发。许可证标识是元数据，不代替上游完整条款。\n\nRuntime dependencies include React, React DOM, Scheduler, and Lucide. Full installed-package notices are copied verbatim under third-party-licenses/. Lucide's notice also includes the Feather-derived icon MIT terms; retain the complete file.\n\nBuild/development dependencies include MIT, Apache-2.0, MPL-2.0, ISC, BSD-3-Clause, and 0BSD metadata. Native build tools are not vendored as node_modules. If distributing their executables or modified sources, review their actual source/notice obligations separately; [Mozilla's MPL FAQ](https://www.mozilla.org/en-US/MPL/2.0/FAQ/) explains its file-level scope. This generated inventory is not a legal audit.\n\n## Locked dependency inventory\n\n| Package | Version | Declared license | Bundled notice text |\n| --- | --- | --- | --- |\n${rows}\n\n## Source references\n\nExact resolved source archive references and available upstream repository links are in [inventory.json](third-party-licenses/inventory.json). Existing source/license headers in the application build must be preserved. Repository and release preparation must exclude real data and credentials.\n`;
await writeFile(path.join(root,'THIRD_PARTY_NOTICES.md'),notice);
async function files(dir,relative=''){const result=[];for(const entry of await readdir(path.join(dir,relative),{withFileTypes:true})){if(entry.isSymbolicLink())throw new Error('Refusing symlink');const item=path.join(relative,entry.name);if(entry.isDirectory())result.push(...await files(dir,item));else result.push(item.replaceAll(path.sep,'/'));}return result.sort();}
for(const file of ['LICENSE','THIRD_PARTY_NOTICES.md','package.json','package-lock.json'])await copyFile(path.join(root,file),path.join(blueprint,file));
for(const file of await files(licensesDir)){const destination=path.join(blueprint,'third-party-licenses',file);await mkdir(path.dirname(destination),{recursive:true});await copyFile(path.join(licensesDir,file),destination);}
await copyFile(path.join(root,'LICENSE'),path.join(skill,'LICENSE'));
const manifestPath=path.join(skill,'references/source-manifest.json');const manifest=JSON.parse(await readFile(manifestPath,'utf8'));
manifest.generated_at=new Date().toISOString();
const adaptation='GitHub-ready MIT metadata, portable agent instructions, and bundled third-party attribution; original UI/model/server source retained';
if(!manifest.adaptations.includes(adaptation))manifest.adaptations.push(adaptation);
manifest.blueprint_files=await Promise.all((await files(blueprint)).map(async file=>({path:file,sha256:createHash('sha256').update(await readFile(path.join(blueprint,file))).digest('hex'),bytes:(await stat(path.join(blueprint,file))).size})));
await writeFile(manifestPath,JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({status:'prepared',dependencies:inventory.length,license_counts:licenseCounts,blueprint_files:manifest.blueprint_files.length,published:false},null,2));
