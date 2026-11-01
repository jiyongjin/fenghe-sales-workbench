// RFC 4180: quoted commas, escaped quotes and embedded newlines are preserved.
export function parseCsv(text) {
  const input = text.replace(/^\uFEFF/, '');
  const rows = []; let row = []; let value = ''; let quoted = false;
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (c === '"') { if (quoted && input[i + 1] === '"') { value += '"'; i++; } else if (quoted || value === '') quoted = !quoted; else throw new Error('CSV 引号格式无效'); }
    else if (c === ',' && !quoted) { row.push(value); value = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) { if (c === '\r' && input[i + 1] === '\n') i++; row.push(value); if (row.some((v) => v !== '')) rows.push(row); row = []; value = ''; }
    else value += c;
  }
  if (quoted) throw new Error('CSV 引号未闭合');
  row.push(value); if (row.some((v) => v !== '')) rows.push(row);
  if (!rows.length) return [];
  const headers = rows.shift();
  if (new Set(headers).size !== headers.length || headers.some((h) => !h)) throw new Error('CSV 表头不能重复或为空');
  return rows.map((values) => {
    if (values.length !== headers.length) throw new Error('CSV 列数与表头不一致');
    return Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  });
}

export function stringifyCsv(rows, columns) {
  const escape = (v) => { const s = String(v ?? ''); return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s; };
  return '\uFEFF' + [columns, ...rows.map((row) => columns.map((key) => row[key] ?? ''))].map((values) => values.map(escape).join(',')).join('\r\n') + '\r\n';
}
