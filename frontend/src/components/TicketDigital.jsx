import { motion } from 'framer-motion';
import { Crown, Film, Monitor, Popcorn } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { brl, formatDateTime } from '../lib/format';

const N = 25;

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeRng(seed) {
  let s = seed || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    s >>>= 0;
    return s / 4294967296;
  };
}

function inFinderZone(r, c) {
  const near = (a, b) => a <= 8 && b <= 8;
  return near(r, c) || near(r, N - 1 - c) || near(N - 1 - r, c);
}

// Codigo geometrico decorativo, gerado de forma deterministica a partir do codigo do ingresso.
function GeoCode({ value }) {
  const rng = makeRng(hash(value));
  const cells = [];
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      if (!inFinderZone(r, c) && rng() < 0.5) cells.push([r, c]);
    }
  }
  const finders = [[0, 0], [0, N - 7], [N - 7, 0]];
  return (
    <svg viewBox={`-2 -2 ${N + 4} ${N + 4}`} className="h-full w-full" role="img" aria-label={`Código visual do ingresso ${value}`}>
      <defs>
        <linearGradient id="ka-geo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#0F1633" />
          <stop offset="1" stopColor="#2B3A8F" />
        </linearGradient>
      </defs>
      <rect x="-2" y="-2" width={N + 4} height={N + 4} rx="3" fill="#F8FAFC" />
      {cells.map(([r, c]) => (
        <rect key={`${r}-${c}`} x={c + 0.07} y={r + 0.07} width="0.86" height="0.86" rx="0.22" fill="url(#ka-geo)" />
      ))}
      {finders.map(([r, c]) => (
        <g key={`${r}-${c}`}>
          <rect x={c + 0.5} y={r + 0.5} width="6" height="6" rx="1.4" fill="none" stroke="url(#ka-geo)" strokeWidth="1" />
          <rect x={c + 2} y={r + 2} width="3" height="3" rx="0.7" fill="#0D9488" />
        </g>
      ))}
    </svg>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-widest text-mist/80">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-ice">{value}</p>
    </div>
  );
}

export default function TicketDigital({ ticket, animate = true }) {
  const seatText = ticket.seats.map((s) => s.code).join(', ');

  return (
    <motion.div
      initial={animate ? { opacity: 0, y: -30, clipPath: 'inset(0 0 100% 0)' } : false}
      animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-2xl border border-aqua-400/40 bg-gradient-to-b from-ink-800 to-ink-900 shadow-glow"
    >
      {animate && (
        <motion.div
          aria-hidden="true"
          initial={{ top: '0%', opacity: 0.9 }}
          animate={{ top: '100%', opacity: 0 }}
          transition={{ duration: 1.5, delay: 0.55, ease: 'easeInOut' }}
          className="pointer-events-none absolute left-0 right-0 z-10 h-10 bg-gradient-to-b from-transparent via-aqua-neon/25 to-transparent"
        />
      )}

      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <BrandLogo size={30} animated={false} />
          <span className="badge border-aqua-neon/40 bg-aqua-neon/10 text-aqua-neon">Ingresso digital</span>
        </div>

        <h3 className="mt-5 flex items-start gap-2 text-2xl font-semibold leading-tight">
          <Film className="mt-1 h-5 w-5 shrink-0 text-aqua-400" />
          {ticket.movieTitle}
        </h3>

        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4">
          <Info label="Sessão" value={ticket.showtime} />
          <Info label="Tecnologia" value={ticket.roomTechnology} />
          <div className="col-span-2">
            <p className="text-[10px] uppercase tracking-widest text-mist/80">Sala</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-sm font-medium">
              <Monitor className="h-3.5 w-3.5 text-aqua-400" />
              {ticket.roomName}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-[10px] uppercase tracking-widest text-mist/80">Poltronas</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {ticket.seats.map((s) => (
                <span
                  key={s.code}
                  className="inline-flex items-center gap-1 rounded-md border border-aqua-400/40 bg-aqua-400/10 px-2 py-0.5 text-sm font-semibold text-aqua-400"
                >
                  {s.vip && <Crown className="h-3 w-3" />}
                  {s.code}
                </span>
              ))}
            </div>
            <span className="sr-only">{seatText}</span>
          </div>
          {ticket.combos.length > 0 && (
            <div className="col-span-2">
              <p className="text-[10px] uppercase tracking-widest text-mist/80">Combos</p>
              <ul className="mt-1.5 space-y-1">
                {ticket.combos.map((c, i) => (
                  <li key={`${c.name}-${i}`} className="flex items-center gap-2 text-sm">
                    <Popcorn className="h-3.5 w-3.5 text-aqua-400" />
                    {c.quantity}x {c.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="relative" aria-hidden="true">
        <div className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-ink-950" />
        <div className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-ink-950" />
        <div className="mx-6 border-t-2 border-dashed border-aqua-400/30" />
      </div>

      <div className="flex items-center gap-5 p-5 sm:p-6">
        <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl">
          <GeoCode value={ticket.code} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-widest text-mist/80">Código</p>
          <p className="font-display text-xl font-semibold tracking-wider text-aqua-neon">{ticket.code}</p>
          <p className="mt-2 text-[10px] uppercase tracking-widest text-mist/80">Total pago</p>
          <p className="font-display text-xl font-semibold">{brl(ticket.total)}</p>
          <p className="mt-1 text-xs text-mist">{formatDateTime(ticket.createdAt)}</p>
        </div>
      </div>
    </motion.div>
  );
}
