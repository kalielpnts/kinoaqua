const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function brl(value) {
  return money.format(Number(value) || 0);
}

export function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function formatDuration(minutes) {
  const m = Number(minutes) || 0;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h ? `${h}h${String(r).padStart(2, '0')}` : `${r}min`;
}
