import { useState } from 'react';
import { Armchair, Crown, Wrench } from 'lucide-react';

const LEGEND = [
  { key: 'available', label: 'Disponível' },
  { key: 'selected', label: 'Selecionada' },
  { key: 'vip', label: 'VIP' },
  { key: 'occupied', label: 'Ocupada' },
  { key: 'broken', label: 'Manutenção' },
];

const STYLES = {
  available: 'border-aqua-400/70 bg-transparent text-aqua-400 hover:bg-aqua-400/15 hover:shadow-glow',
  vip: 'border-[#7C8CFF]/80 bg-[#7C8CFF]/10 text-[#A5B0FF] hover:bg-[#7C8CFF]/20',
  selected: 'border-aqua-neon bg-aqua-neon text-ink-950 shadow-glow-strong',
  occupied: 'cursor-not-allowed border-ink-800 bg-ink-800/80 text-ink-700',
  broken: 'cursor-not-allowed border-amber-400/50 bg-ink-900 text-amber-300',
};

function iconFor(kind) {
  if (kind === 'vip') return Crown;
  if (kind === 'broken') return Wrench;
  return Armchair;
}

function Swatch({ kind }) {
  const Icon = iconFor(kind);
  return (
    <span className={`flex h-7 w-7 items-center justify-center rounded-md border ${STYLES[kind]} pointer-events-none`}>
      <Icon className="h-3.5 w-3.5" />
    </span>
  );
}

export default function SeatMap({ map, selectedCodes, onToggle, limitReached }) {
  const [note, setNote] = useState('');
  const selected = new Set(selectedCodes);
  const gapAfter = map.room.cols >= 8 ? Math.floor(map.room.cols / 2) : 0;

  function describe(seat) {
    if (seat.status === 'broken') return `${seat.code}: ${seat.reason || 'Poltrona em manutenção'}`;
    if (seat.status === 'occupied') return `${seat.code}: poltrona já ocupada nesta sessão`;
    if (seat.vip) return `${seat.code}: poltrona VIP`;
    return '';
  }

  return (
    <div>
      <div className="mx-auto mb-8 max-w-xl" aria-hidden="true">
        <svg viewBox="0 0 400 46" className="w-full" fill="none">
          <defs>
            <linearGradient id="ka-sm-screen" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#4F5BD5" />
              <stop offset="0.5" stopColor="#00F5D4" />
              <stop offset="1" stopColor="#4F5BD5" />
            </linearGradient>
            <linearGradient id="ka-sm-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#00F5D4" stopOpacity="0.25" />
              <stop offset="1" stopColor="#00F5D4" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M10 30 Q200 4 390 30 L400 46 L0 46 Z" fill="url(#ka-sm-glow)" />
          <path d="M10 30 Q200 4 390 30" stroke="url(#ka-sm-screen)" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
        <p className="-mt-1 text-center text-[11px] uppercase tracking-[0.35em] text-mist/70">Tela</p>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="mx-auto flex w-max flex-col gap-2">
          {map.room.rows.map((row) => (
            <div key={row} className="flex items-center gap-2">
              <span className="w-5 text-center text-xs font-medium text-mist">{row}</span>
              <div className="flex gap-1.5">
                {map.seats
                  .filter((s) => s.row === row)
                  .map((seat) => {
                    const isSel = selected.has(seat.code);
                    const kind = isSel ? 'selected' : seat.status === 'available' && seat.vip ? 'vip' : seat.status;
                    const Icon = iconFor(seat.status === 'available' ? (seat.vip ? 'vip' : 'available') : seat.status);
                    const blocked = seat.status === 'broken' || seat.status === 'occupied';
                    const disabledByLimit = !isSel && !blocked && limitReached;
                    const label = describe(seat);
                    return (
                      <button
                        key={seat.code}
                        type="button"
                        aria-label={`Poltrona ${seat.code}${label ? ', ' + label.split(': ')[1] : ''}${isSel ? ', selecionada' : ''}`}
                        aria-pressed={isSel}
                        aria-disabled={blocked || disabledByLimit}
                        title={label || seat.code}
                        onMouseEnter={() => setNote(label)}
                        onFocus={() => setNote(label)}
                        onMouseLeave={() => setNote('')}
                        onBlur={() => setNote('')}
                        onClick={() => {
                          if (blocked) {
                            setNote(label);
                            return;
                          }
                          if (disabledByLimit) return;
                          onToggle(seat);
                        }}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border transition duration-150 ${STYLES[kind]} ${
                          disabledByLimit ? 'opacity-40' : ''
                        } ${gapAfter && seat.col === gapAfter ? 'mr-4' : ''}`}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 min-h-[1.25rem] text-center text-sm text-amber-200" aria-live="polite">
        {note}
      </p>

      <ul className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-mist">
        {LEGEND.map((l) => (
          <li key={l.key} className="flex items-center gap-2">
            <Swatch kind={l.key} />
            {l.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
