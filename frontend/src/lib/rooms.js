export function parseRows(value) {
  const s = String(value || '').trim().toUpperCase();
  const m = s.match(/^([A-Z])\s*-\s*([A-Z])$/);
  if (m) {
    const out = [];
    for (let c = m[1].charCodeAt(0); c <= m[2].charCodeAt(0); c++) out.push(String.fromCharCode(c));
    return out;
  }
  return s.split(/[\s,;]+/).filter(Boolean);
}

export function rowsToText(rows) {
  if (!rows || !rows.length) return '';
  const contiguous = rows.every((r, i) => i === 0 || r.charCodeAt(0) === rows[i - 1].charCodeAt(0) + 1);
  return contiguous && rows.length > 1 ? `${rows[0]}-${rows[rows.length - 1]}` : rows.join(',');
}

export function seatCodesOf(rows, cols) {
  const out = [];
  if (!Number.isInteger(cols) || cols < 1) return out;
  for (const r of rows) for (let c = 1; c <= cols; c++) out.push(`${r}${c}`);
  return out;
}
