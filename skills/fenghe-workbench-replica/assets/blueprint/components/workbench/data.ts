/*!
 * Copyright (c) 2026 风禾永进 (https://yongjin.tech)
 * SPDX-License-Identifier: MIT
 */
import { SCHEMAS, TABLE_NAMES, columnsFor, createDemoData, validateRow, todayISO } from '@/lib/workbench-model.mjs';
import { parseCsv, stringifyCsv } from '@/lib/csv.mjs';
export type Row = Record<string, string>;
export type Dataset = Record<string, Row[]>;
export type Snapshot = { tables: Dataset; revisions: Record<string, string>; directory?: string };
type Writable = { write: (data: string | Blob) => Promise<void>; close: () => Promise<void> };
type FileHandle = { getFile: () => Promise<File>; createWritable: () => Promise<Writable> };
export type Directory = { name: string; getFileHandle: (name: string, options?: { create: boolean }) => Promise<FileHandle>; getDirectoryHandle: (name: string, options?: { create: boolean }) => Promise<Directory>; queryPermission: (options: { mode: 'readwrite' }) => Promise<string>; requestPermission: (options: { mode: 'readwrite' }) => Promise<string> };
export type Store = { mode: 'local' | 'directory' | 'demo'; label: string; read: () => Promise<Snapshot>; save: (table: string, row: Row, userId: string, revision: string, remove?: boolean) => Promise<Snapshot>; import: (table: string, rows: Row[], userId: string, revision: string) => Promise<Snapshot>; upload: (file: File) => Promise<string>; image: (path: string) => Promise<string> };
export const emptySnapshot = (): Snapshot => ({ tables: createDemoData() as Dataset, revisions: {} });
async function api<T = Snapshot>(url: string, data?: object, token?: string): Promise<T> {
  const response = await fetch(url, data ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Workbench-Token': token || '' }, body: JSON.stringify(data) } : {});
  const result = await response.json() as T & { error?: string }; if (!response.ok) throw new Error(result.error || '保存失败'); return result;
}
async function asDataUrl(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 3_000_000) throw new Error('请选择 3MB 以内的 PNG / JPG / WebP 图片');
  return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
}
export async function connectLocal(): Promise<{ store: Store; snapshot: Snapshot } | null> {
  if (!['localhost', '127.0.0.1'].includes(window.location.hostname)) return null;
  let response; try { response = await fetch('/api/bootstrap', { signal: AbortSignal.timeout(2500) }); } catch { return null; }
  if (!response.ok) return null;
  let data: Snapshot & { mode: string; token: string }; try { data = await response.json() as Snapshot & { mode: string; token: string }; } catch { return null; }
  if (data.mode !== 'local') return null;
  const store: Store = {
    mode: 'local', label: data.directory || '本地 CSV',
    read: async () => { const fresh = await api<Snapshot & { token: string }>('/api/bootstrap'); data.token = fresh.token; return fresh; },
    save: (table, row, userId, expectedRevision, remove = false) => api('/api/records', { table, row, userId, expectedRevision, op: remove ? 'delete' : 'upsert' }, data.token),
    import: (table, rows, userId, expectedRevision) => api('/api/import', { table, rows, userId, expectedRevision }, data.token),
    upload: async (file) => (await api<{ path: string }>('/api/background', { data: await asDataUrl(file) }, data.token)).path,
    image: async (path) => path.startsWith('assets/') ? `/data-assets/${encodeURIComponent(path.split('/').pop()!)}` : path,
  };
  return { store, snapshot: data };
}
async function preferenceDb() {
  return new Promise<IDBDatabase>((resolve, reject) => { const request = indexedDB.open('fenghe-file-permissions', 1); request.onupgradeneeded = () => request.result.createObjectStore('handles'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
}
export async function rememberedDirectory(): Promise<Directory | undefined> {
  try { const db = await preferenceDb(); return await new Promise((resolve) => { const request = db.transaction('handles').objectStore('handles').get('csv'); request.onsuccess = () => { db.close(); resolve(request.result); }; request.onerror = () => { db.close(); resolve(undefined); }; }); } catch { return undefined; }
}
async function rememberDirectory(dir: Directory) {
  try { const db = await preferenceDb(); await new Promise<void>((resolve) => { const tx = db.transaction('handles', 'readwrite'); tx.objectStore('handles').put(dir, 'csv'); tx.oncomplete = () => { db.close(); resolve(); }; tx.onerror = () => { db.close(); resolve(); }; }); } catch { /* Browser preference is optional. CSV remains primary storage. */ }
}
export async function chooseDirectory(): Promise<Directory> {
  const picker = (window as Window & { showDirectoryPicker?: (options: object) => Promise<Directory> }).showDirectoryPicker;
  if (!picker) throw new Error('此浏览器不支持文件夹授权。请在桌面 Chrome / Edge 打开，或使用本机运行版。');
  return picker({ mode: 'readwrite', id: 'fenghe-csv', startIn: 'documents' });
}
export async function connectDirectory(dir: Directory, initialize = false): Promise<{ store: Store; snapshot: Snapshot }> {
  const rawExistingFile = async (table: string) => (await (await dir.getFileHandle(`${table}.csv`)).getFile()).text();
  const rawFile = async (table: string) => {
    try { return await rawExistingFile(table); }
    catch (error) { if ((error as DOMException).name === 'NotFoundError' && ['notes','reviews'].includes(table)) return stringifyCsv([],columnsFor(table)); throw error; }
  };
  if (initialize) {
    let hasProfiles = true; try { await rawExistingFile('profiles'); } catch (e) { if ((e as DOMException).name === 'NotFoundError') hasProfiles = false; else throw e; }
    if (!hasProfiles) {
      for (const table of TABLE_NAMES.filter((t) => t !== 'profiles')) { try { await rawExistingFile(table); throw new Error('目录已有业务 CSV，但缺少 profiles.csv；请选择完整数据目录，避免覆盖现有文件。'); } catch (e) { if ((e as DOMException).name !== 'NotFoundError') throw e; } }
    }
    const seed = hasProfiles ? {} as Dataset : createDemoData() as Dataset;
    for (const table of TABLE_NAMES) {
      try { await rawExistingFile(table); } catch (e) {
        if ((e as DOMException).name !== 'NotFoundError') throw e;
        const writer = await (await dir.getFileHandle(`${table}.csv`, { create: true })).createWritable(); await writer.write(stringifyCsv(seed[table] || [], columnsFor(table))); await writer.close();
      }
    }
  }
  async function read(): Promise<Snapshot> {
    const tables: Dataset = {}; const revisions: Record<string, string> = {};
    for (const table of TABLE_NAMES) { const raw = await rawFile(table); tables[table] = parseCsv(raw); revisions[table] = raw; }
    if (!tables.profiles.length) throw new Error('profiles.csv 中没有个人资料');
    return { tables, revisions, directory: dir.name };
  }
  async function write(table: string, rows: Row[], expectedRevision: string) {
    const current = await rawFile(table); if (current !== expectedRevision) throw new Error('CSV 已在其他窗口或 Excel 中修改，请刷新后重试。');
    const backup = await dir.getDirectoryHandle('backups', { create: true }); const backupWriter = await (await backup.getFileHandle(`${table}-${Date.now()}.csv`, { create: true })).createWritable(); await backupWriter.write(current); await backupWriter.close();
    const columns = [...new Set([...columnsFor(table), ...rows.flatMap((row) => Object.keys(row))])];
    const writer = await (await dir.getFileHandle(`${table}.csv`, { create: true })).createWritable(); await writer.write(stringifyCsv(rows, columns)); await writer.close(); return read();
  }
  function validateRelations(table: string, row: Row, userId: string, tables: Dataset) {
    const fields = SCHEMAS[table as keyof typeof SCHEMAS].fields;
    for (const f of fields as { key: string; type?: string; table?: string }[]) if (f.type === 'relation' && row[f.key] && !tables[f.table!].some((r) => r.id === row[f.key] && r.user_id === userId)) throw new Error('关联记录不存在或属于其他人物');
    if (row.customer_id && row.project_id) { const p = tables.projects.find((r) => r.id === row.project_id); if (p?.customer_id && p.customer_id !== row.customer_id) throw new Error('项目与客户不匹配'); }
  }
  const store: Store = {
    mode: 'directory', label: dir.name, read,
    async save(table, row, userId, revision, remove = false) {
      const snap = await read(); const rows = snap.tables[table]; const index = rows.findIndex((r) => r.id === row.id);
      if (table !== 'profiles' && index >= 0 && rows[index].user_id !== userId) throw new Error('不能修改其他人物的数据');
      if (remove) {
        if (table === 'profiles') throw new Error('个人资料不能删除');
        for (const related of TABLE_NAMES) {
          const fields = (SCHEMAS[related as keyof typeof SCHEMAS].fields as {key:string;type?:string;table?:string}[]).filter(f=>f.type==='relation'&&f.table===table);
          if (fields.length&&snap.tables[related].some(r=>fields.some(f=>r[f.key]===row.id))) throw new Error('该记录仍有关联事项，请先取消关联');
        }
        if (index < 0) throw new Error('记录不存在'); rows.splice(index, 1);
      } else {
        const clean: Row = { ...row, id: row.id || `${table}-${crypto.randomUUID()}`, updated_at: new Date().toISOString() };
        if (table !== 'profiles') clean.user_id = userId; validateRow(table, clean); validateRelations(table, clean, userId, snap.tables);
        if (table === 'tasks') clean.completed_at = clean.status === '已完成' ? clean.completed_at || todayISO() : '';
        if (index < 0) rows.push(clean); else rows[index] = clean;
      }
      return write(table, rows, revision);
    },
    async import(table, input, userId, revision) {
      if (table === 'profiles') throw new Error('个人资料请在设置中创建');
      const snap = await read(); const rows = snap.tables[table]; const ids = new Set<string>();
      for (const r of input) { const clean = { ...r, id: r.id || `${table}-${crypto.randomUUID()}`, user_id: userId, updated_at: new Date().toISOString() }; if (ids.has(clean.id)) throw new Error('CSV 中存在重复 ID'); ids.add(clean.id); validateRow(table, clean); validateRelations(table, clean, userId, snap.tables); const index = rows.findIndex((item) => item.id === clean.id); if (index >= 0 && rows[index].user_id !== userId) throw new Error('ID 与其他人物数据冲突'); if (index < 0) rows.push(clean); else rows[index] = clean; }
      return write(table, rows, revision);
    },
    async upload(file) {
      await asDataUrl(file); const assets = await dir.getDirectoryHandle('assets', { create: true }); const name = `${crypto.randomUUID()}.${file.type.split('/')[1]}`; const writer = await (await assets.getFileHandle(name, { create: true })).createWritable(); await writer.write(file); await writer.close(); return `assets/${name}`;
    },
    async image(imagePath) { if (!imagePath) return ''; const name = imagePath.split('/').pop()!; const file = await (await (await dir.getDirectoryHandle('assets')).getFileHandle(name)).getFile(); return URL.createObjectURL(file); },
  };
  await rememberDirectory(dir); return { store, snapshot: await read() };
}

export const quadrant = (row: Row, today: string) => { const important = row.importance === '重要'; const urgent = row.urgency === '紧急' || (!!row.due && row.due <= today); return important ? urgent ? 0 : 1 : urgent ? 2 : 3; };
export const periodRange = (goal: Row) => { const y = Number(goal.year); const index = Number(goal.period_index); const startMonth = goal.period === '年度' ? 1 : goal.period === '季度' ? (index - 1) * 3 + 1 : index; const months = goal.period === '年度' ? 12 : goal.period === '季度' ? 3 : 1; return { start: `${y}-${String(startMonth).padStart(2, '0')}-01`, end: new Date(Date.UTC(y, startMonth - 1 + months, 0)).toISOString().slice(0, 10) }; };
export function goalActual(goal: Row, data: Dataset) {
  const { start, end } = periodRange(goal); const within = (date: string) => date && date.slice(0, 10) >= start && date.slice(0, 10) <= end;
  const rows = (table: string) => (data[table] || []).filter((r) => r.user_id === goal.user_id);
  switch (goal.source) {
    case '完成待办数': return rows('tasks').filter((r) => r.status === '已完成' && r.area === goal.area && within(r.completed_at)).length;
    case '发布内容数': return rows('content').filter((r) => ['已发布', '已复盘'].includes(r.stage) && within(r.publish_date)).length;
    case '收入合计': { const yuan = rows('finance').filter((r) => r.kind === '收入' && within(r.date)).reduce((sum, r) => sum + Number(r.amount), 0); return goal.unit === '万元' ? yuan / 10000 : yuan; }
    case '运动分钟数': { const minutes = rows('health').filter((r) => within(r.date)).reduce((sum, r) => sum + Number(r.exercise), 0); return goal.unit === '小时' ? minutes / 60 : minutes; }
    case '学习分钟数': { const minutes = rows('learning').filter((r) => within(r.date)).reduce((sum, r) => sum + Number(r.completed), 0); return goal.unit === '小时' ? minutes / 60 : minutes; }
    default: return Number(goal.actual || 0);
  }
}
export function nextFamilyDate(row: Row, today: string) {
  if (!row.date || row.repeat === '不重复' || !row.repeat) return row.date;
  const day = Number(row.date.slice(8)); const current = new Date(`${today}T12:00:00Z`); let year = current.getUTCFullYear(); let month = row.repeat === '每年' ? Number(row.date.slice(5, 7)) - 1 : current.getUTCMonth();
  const occurrence = () => new Date(Date.UTC(year, month, Math.min(day, new Date(Date.UTC(year, month + 1, 0)).getUTCDate()))).toISOString().slice(0, 10);
  if (occurrence() < today) { if (row.repeat === '每年') year++; else month++; }
  return occurrence();
}
export const numberText = (n: number) => new Intl.NumberFormat('zh-CN', { maximumFractionDigits: 2 }).format(Number.isFinite(n) ? n : 0);
export function downloadText(text: string, filename: string, mime = 'text/csv;charset=utf-8') { const url = URL.createObjectURL(new Blob([text], { type: mime })); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 2000); }
