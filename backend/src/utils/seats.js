const { ROOM_TECHNOLOGIES } = require('../config');

function parseRows(value) {
  let rows = [];
  if (Array.isArray(value)) {
    rows = value.map((x) => String(x).trim().toUpperCase()).filter(Boolean);
  } else if (typeof value === 'string') {
    const s = value.trim().toUpperCase();
    const m = s.match(/^([A-Z])\s*-\s*([A-Z])$/);
    if (m) {
      const a = m[1].charCodeAt(0);
      const b = m[2].charCodeAt(0);
      if (b >= a) for (let c = a; c <= b; c++) rows.push(String.fromCharCode(c));
    } else {
      rows = s.split(/[\s,;]+/).filter(Boolean);
    }
  }
  return rows;
}

function seatCodes(room) {
  const out = [];
  for (const r of room.rows) for (let c = 1; c <= room.cols; c++) out.push(`${r}${c}`);
  return out;
}

function codeOf(item) {
  if (typeof item === 'string') return item.trim().toUpperCase();
  if (item && typeof item === 'object') return String(item.code || '').trim().toUpperCase();
  return '';
}

function normalizeRoom(input) {
  const errors = [];
  if (!input || typeof input !== 'object') return { room: null, errors: ['Sala obrigatoria'] };

  const name = String(input.name || '').trim();
  if (!name) errors.push('Nome da sala obrigatorio');

  const technology = input.technology || '2D';
  if (!ROOM_TECHNOLOGIES.includes(technology)) {
    errors.push(`Tecnologia invalida (use: ${ROOM_TECHNOLOGIES.join(', ')})`);
  }

  const rows = parseRows(input.rows);
  if (!rows.length || rows.length > 26 || rows.some((r) => !/^[A-Z]$/.test(r)) || new Set(rows).size !== rows.length) {
    errors.push('Fileiras invalidas (use letras A-Z, ex: A-F)');
  }

  const cols = Number(input.cols);
  if (!Number.isInteger(cols) || cols < 1 || cols > 30) errors.push('Numero de colunas invalido (1 a 30)');

  if (errors.length) return { room: null, errors };

  const valid = new Set(seatCodes({ rows, cols }));
  const brokenMap = new Map();
  for (const item of Array.isArray(input.brokenSeats) ? input.brokenSeats : []) {
    const code = codeOf(item);
    const reason = item && typeof item === 'object' && item.reason ? String(item.reason).trim() : '';
    if (!valid.has(code)) {
      errors.push(`Poltrona quebrada invalida: ${code}`);
      continue;
    }
    brokenMap.set(code, reason);
  }

  const vip = new Set();
  for (const item of Array.isArray(input.vipSeats) ? input.vipSeats : []) {
    const code = codeOf(item);
    if (!valid.has(code)) {
      errors.push(`Poltrona VIP invalida: ${code}`);
      continue;
    }
    if (!brokenMap.has(code)) vip.add(code);
  }

  if (errors.length) return { room: null, errors };

  return {
    room: {
      name,
      technology,
      rows,
      cols,
      brokenSeats: [...brokenMap.entries()].map(([code, reason]) => ({ code, reason })),
      vipSeats: [...vip],
    },
    errors: [],
  };
}

module.exports = { parseRows, seatCodes, normalizeRoom };
