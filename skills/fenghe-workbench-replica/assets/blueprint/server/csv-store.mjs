import { mkdir, readFile, writeFile, rename, copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { TABLE_NAMES, SCHEMAS, columnsFor, createDemoData, validateRow, todayISO } from '../lib/workbench-model.mjs';
import { parseCsv, stringifyCsv } from '../lib/csv.mjs';
export function createCsvStore(directory) {
  const root = path.resolve(directory); let queue = Promise.resolve();
  const file = (table) => { if (!TABLE_NAMES.includes(table)) throw new Error('未知数据表'); return path.join(root, `${table}.csv`); };
  const serial = (action) => { const result = queue.then(action); queue = result.catch(() => undefined); return result; };
  async function initialize() {
    await mkdir(root, { recursive: true });
    const exists = await stat(file('profiles')).then(() => true, () => false);
    const seed = exists ? Object.fromEntries(TABLE_NAMES.map((t) => [t, []])) : createDemoData();
    for (const table of TABLE_NAMES) { try { await writeFile(file(table), stringifyCsv(seed[table], columnsFor(table)), { encoding: 'utf8', flag: 'wx' }); } catch (e) { if (e.code !== 'EEXIST') throw e; } }
  }
  async function readTable(table) {
    const raw = await readFile(file(table), 'utf8');
    return { rows: parseCsv(raw), revision: createHash('sha256').update(raw).digest('hex') };
  }
  async function snapshot() {
    const tables = {}; const revisions = {};
    for (const table of TABLE_NAMES) { const data = await readTable(table); tables[table] = data.rows; revisions[table] = data.revision; }
    return { tables, revisions, directory: root };
  }
  async function atomicSave(table, rows) {
    await mkdir(path.join(root, 'backups'), { recursive: true });
    await copyFile(file(table), path.join(root, 'backups', `${table}-${Date.now()}-${randomUUID().slice(0, 6)}.csv`));
    const temporary = path.join(root, `.${table}-${randomUUID()}.tmp`);
    const columns = [...new Set([...columnsFor(table), ...rows.flatMap((row) => Object.keys(row))])];
    await writeFile(temporary, stringifyCsv(rows, columns), 'utf8'); await rename(temporary, file(table));
  }
  async function checkOwner(userId) { if (!(await readTable('profiles')).rows.some((p) => p.id === userId)) throw new Error('请先创建或选择个人资料'); }
  async function checkRelations(table, row, userId) {
    for (const field of SCHEMAS[table].fields.filter((f) => f.type === 'relation')) {
      if (row[field.key] && !(await readTable(field.table)).rows.some((r) => r.id === row[field.key] && r.user_id === userId)) throw new Error(`${field.label}不属于当前人物或不存在`);
    }
    if ((table === 'tasks' || table === 'activities') && row.customer_id && row.project_id) {
      const project = (await readTable('projects')).rows.find((r) => r.id === row.project_id);
      if (project?.customer_id && project.customer_id !== row.customer_id) throw new Error('所选项目与客户不匹配');
    }
  }
  function conflict() { const e = new Error('CSV 已被其他窗口或外部软件修改，请刷新后重试。未覆盖外部修改。'); e.status = 409; throw e; }
  async function mutate({ table, op = 'upsert', row, userId, expectedRevision }) {
    return serial(async () => {
      const current = await readTable(table); if (expectedRevision !== current.revision) conflict();
      if (table !== 'profiles') await checkOwner(userId);
      const index = current.rows.findIndex((r) => r.id === row?.id);
      if (index >= 0 && table !== 'profiles' && current.rows[index].user_id !== userId) throw new Error('不能修改其他人物的数据');
      if (op === 'delete') {
        if (table === 'profiles') throw new Error('个人资料不支持删除，请切换人物或修改资料');
        if (index < 0) throw new Error('记录已不存在');
        for (const related of TABLE_NAMES) {
          const fields = SCHEMAS[related].fields.filter(f=>f.type==='relation'&&f.table===table);
          if (fields.length && (await readTable(related)).rows.some(r=>fields.some(f=>r[f.key]===row.id))) throw new Error('该记录仍有关联事项，请先取消关联再删除');
        }
        current.rows.splice(index, 1);
      } else {
        const clean = { ...(index >= 0 ? current.rows[index] : {}), ...Object.fromEntries(columnsFor(table).map((key) => [key, String(row?.[key] ?? '')])) };
        clean.id ||= `${table}-${randomUUID()}`; if (table !== 'profiles') clean.user_id = userId; clean.updated_at = new Date().toISOString();
        if (table === 'tasks') clean.completed_at = clean.status === '已完成' ? clean.completed_at || todayISO() : '';
        validateRow(table, clean); await checkRelations(table, clean, userId);
        if (index < 0) current.rows.push(clean); else current.rows[index] = clean;
      }
      await atomicSave(table, current.rows); return snapshot();
    });
  }
  async function importRows({ table, rows, userId, expectedRevision }) {
    return serial(async () => {
      if (table === 'profiles') throw new Error('个人资料请在设置中创建，不能用导入覆盖');
      await checkOwner(userId); const current = await readTable(table); if (expectedRevision !== current.revision) conflict();
      if (!Array.isArray(rows) || rows.length > 10000) throw new Error('单次导入最多 10000 条');
      const normalized = [];
      for (const r of rows) {
        const clean = Object.fromEntries(columnsFor(table).map((key) => [key, String(r[key] ?? '')]));
        clean.id ||= `${table}-${randomUUID()}`; clean.user_id = userId; clean.updated_at = new Date().toISOString();
        const other = current.rows.find((item) => item.id === clean.id); if (other && other.user_id !== userId) throw new Error('导入 ID 与其他人物的数据冲突');
        validateRow(table, clean); await checkRelations(table, clean, userId); normalized.push(clean);
      }
      if (new Set(normalized.map((r) => r.id)).size !== normalized.length) throw new Error('导入文件中存在重复 ID');
      for (const row of normalized) { const index = current.rows.findIndex((r) => r.id === row.id); if (index < 0) current.rows.push(row); else current.rows[index] = row; }
      await atomicSave(table, current.rows); return snapshot();
    });
  }
  return { initialize, snapshot, readTable, mutate, importRows, root };
}
