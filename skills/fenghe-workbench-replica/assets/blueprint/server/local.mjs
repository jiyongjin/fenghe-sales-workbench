/*!
 * Copyright (c) 2026 风禾永进 (https://yongjin.tech)
 * SPDX-License-Identifier: MIT
 */
import http from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes, randomUUID } from 'node:crypto';
import { createCsvStore } from './csv-store.mjs';
import { stringifyCsv } from '../lib/csv.mjs';
import { columnsFor, TABLE_NAMES } from '../lib/workbench-model.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.WORKBENCH_PORT || 4318); const token = randomBytes(32).toString('hex');
const store = createCsvStore(process.env.WORKBENCH_DATA_DIR || path.join(root, 'data')); await store.initialize();
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' };
const json = (res, status, data) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(data)); };
async function body(req) { let data = ''; for await (const chunk of req) { data += chunk; if (Buffer.byteLength(data) > 8_000_000) throw new Error('请求过大'); } return JSON.parse(data || '{}'); }
const server = http.createServer(async (req, res) => {
  try {
    if (![ `localhost:${port}`, `127.0.0.1:${port}` ].includes(req.headers.host)) return json(res, 403, { error: '仅允许本机访问' });
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    if (url.pathname.startsWith('/api/')) {
      if (req.method !== 'GET' && (req.headers['x-workbench-token'] !== token || (req.headers.origin && ![`http://localhost:${port}`, `http://127.0.0.1:${port}`].includes(req.headers.origin)))) return json(res, 403, { error: '本机写入授权无效，请刷新页面' });
      if (url.pathname === '/api/bootstrap' && req.method === 'GET') return json(res, 200, { ...await store.snapshot(), token, mode: 'local' });
      if (url.pathname === '/api/records' && req.method === 'POST') return json(res, 200, await store.mutate(await body(req)));
      if (url.pathname === '/api/import' && req.method === 'POST') return json(res, 200, await store.importRows(await body(req)));
      if (url.pathname === '/api/export' && req.method === 'GET') {
        const table = url.searchParams.get('table'); if (!TABLE_NAMES.includes(table)) throw new Error('未知数据表');
        const data = await store.readTable(table); const user = url.searchParams.get('user');
        res.writeHead(200, { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${table}.csv"` });
        return res.end(stringifyCsv(data.rows.filter((r) => table === 'profiles' || r.user_id === user), columnsFor(table)));
      }
      if (url.pathname === '/api/background' && req.method === 'POST') {
        const input = await body(req); const match = /^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/.exec(input.data ?? ''); if (!match) throw new Error('背景只支持 PNG / JPG / WebP');
        const image = Buffer.from(match[2], 'base64'); if (image.length > 3_000_000) throw new Error('背景图片不能超过 3MB');
        const name = `${randomUUID()}.${match[1] === 'jpeg' ? 'jpg' : match[1]}`;
        await mkdir(path.join(store.root, 'assets'), { recursive: true }); await writeFile(path.join(store.root, 'assets', name), image); return json(res, 200, { path: `/data-assets/${name}` });
      }
      return json(res, 404, { error: '接口不存在' });
    }
    const base = url.pathname.startsWith('/data-assets/') ? path.join(store.root, 'assets') : path.join(root, 'dist-local');
    const relative = url.pathname.startsWith('/data-assets/') ? url.pathname.slice(13) : url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).slice(1);
    const target = path.resolve(base, relative); if (!target.startsWith(base + path.sep)) return json(res, 403, { error: '无效路径' });
    const content = await readFile(target); res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' }); res.end(content);
  } catch (error) { json(res, error.status || (error.code === 'ENOENT' ? 404 : 400), { error: error.code === 'ENOENT' ? '文件未找到，请先构建本机版' : error.message }); }
});
server.on('error', (e) => { console.error(e.code === 'EADDRINUSE' ? `端口 ${port} 已在使用，请打开 http://localhost:${port}` : e.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Fenghe · 个人工作台\nLocal: http://localhost:${port}\nCSV: ${store.root}\n数据自动保存，关闭程序后 CSV 文件仍然保留。`));
