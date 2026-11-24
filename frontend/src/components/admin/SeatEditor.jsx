import { useState } from 'react';
import { Armchair, Crown, Wrench, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { friendlyError } from '../../lib/errors';
import { ErrorBox } from './ui';

const MODES = [
  { id: 'broken', label: 'Manutenção', description: 'Bloquear para venda', icon: Wrench },
  { id: 'vip', label: 'VIP', description: 'Aplicar categoria VIP', icon: Crown },
  { id: 'available', label: 'Normal', description: 'Liberar poltrona', icon: Armchair },
];

const STYLES = {
  available: 'border-aqua-400/70 text-aqua-400 hover:bg-aqua-400/15',
  vip: 'border-[#7C8CFF]/80 bg-[#7C8CFF]/10 text-[#A5B0FF] hover:bg-[#7C8CFF]/20',
  broken: 'border-amber-400/60 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20',
};

export default function SeatEditor({ movie, onUpdate }) {
  const [mode, setMode] = useState('broken');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const room = movie.room;
  const broken = new Map(room.brokenSeats.map((b) => [b.code, b.reason]));
  const vip = new Set(room.vipSeats);
  const gapAfter = room.cols >= 8 ? Math.floor(room.cols / 2) : 0;

  const selectedMode = MODES.find((m) => m.id === mode);

  async function click(code) {
    if (busy) return;

    const current = broken.has(code)
      ? 'broken'
      : vip.has(code)
        ? 'vip'
        : 'available';

    const status = current === mode ? 'available' : mode;

    setBusy(true);
    setError('');

    try {
      const updated = await api.patch(`/movies/${movie.id}/seats`, {
        seat: code,
        status,
        reason: status === 'broken' ? reason : '',
      });

      onUpdate(updated);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-4 pt-12 sm:p-6 sm:pt-12">
      <h2 className="text-2xl font-semibold">Gerenciar poltronas</h2>

      <p className="mt-1 text-sm text-mist">
        <strong className="text-ice">{movie.title}</strong> — {room.name}
      </p>

      <p className="mt-1 text-sm text-mist">
        {room.technology} · {room.rows.length} fileiras · {room.cols} colunas
      </p>

      <div className="mt-6 rounded-xl border border-aqua-400/20 bg-aqua-400/5 p-4">
        <p className="text-sm font-semibold text-ice">
          1. Escolha o que deseja fazer
        </p>

        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {MODES.map((m) => {
            const Icon = m.icon;
            const active = mode === m.id;

            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMode(m.id)}
                aria-pressed={active}
                className={`flex min-h-20 items-center gap-3 rounded-xl border p-3 text-left transition ${
                  active
                    ? 'border-aqua-neon bg-aqua-neon/15 text-aqua-neon ring-1 ring-aqua-neon/40'
                    : 'border-ink-700 bg-ink-950/40 text-mist hover:border-aqua-400/40 hover:text-ice'
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold">{m.label}</span>
                  <span className="mt-1 block text-xs opacity-75">{m.description}</span>
                </span>
                {active && <CheckCircle2 className="ml-auto h-4 w-4 shrink-0" />}
              </button>
            );
          })}
        </div>

        <p className="mt-3 text-sm text-aqua-300">
          Modo selecionado: <strong>{selectedMode.label}</strong>
        </p>
      </div>

      {mode === 'broken' && (
        <label className="mt-4 block">
          <span className="label">Motivo da manutenção (opcional)</span>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Ex.: Encosto em manutenção"
            className="input-field !pl-4"
            maxLength={120}
          />
        </label>
      )}

      <div className="mt-5 rounded-xl border border-ink-700 bg-ink-950/40 p-4">
        <p className="text-sm font-semibold text-ice">
          2. Clique nas poltronas para aplicar a alteração
        </p>
        <p className="mt-1 text-xs text-mist">
          Clique novamente em uma poltrona que já esteja no modo escolhido para
          devolvê-la ao estado normal.
        </p>

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-mist">
          <span className="flex items-center gap-2">
            <Armchair className="h-4 w-4 text-aqua-400" /> Normal
          </span>
          <span className="flex items-center gap-2">
            <Crown className="h-4 w-4 text-[#A5B0FF]" /> VIP
          </span>
          <span className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-amber-300" /> Manutenção
          </span>
        </div>
      </div>

      <div className="mt-4">
        <ErrorBox message={error} />
      </div>

      <div className="modal-scroll mt-4 overflow-x-auto pb-3">
        <p className="mb-3 text-center text-[11px] uppercase tracking-[0.35em] text-mist/70">
          Tela do cinema
        </p>

        <div className="mx-auto flex w-max flex-col gap-2">
          {room.rows.map((row) => (
            <div key={row} className="flex items-center gap-2">
              <span className="w-5 text-center text-xs font-medium text-mist">
                {row}
              </span>

              <div className="flex gap-1.5">
                {Array.from({ length: room.cols }, (_, i) => {
                  const code = `${row}${i + 1}`;
                  const kind = broken.has(code)
                    ? 'broken'
                    : vip.has(code)
                      ? 'vip'
                      : 'available';

                  const Icon =
                    kind === 'broken'
                      ? Wrench
                      : kind === 'vip'
                        ? Crown
                        : Armchair;

                  const description =
                    kind === 'broken'
                      ? 'em manutenção'
                      : kind === 'vip'
                        ? 'VIP'
                        : 'normal';

                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => click(code)}
                      disabled={busy}
                      title={`${code}: ${description}${broken.has(code) && broken.get(code) ? ` — ${broken.get(code)}` : ''}`}
                      aria-label={`Poltrona ${code}, ${description}`}
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-transparent transition duration-150 disabled:cursor-wait disabled:opacity-60 ${STYLES[kind]} ${
                        gapAfter && i + 1 === gapAfter ? 'mr-4' : ''
                      }`}
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

      {busy && (
        <p className="mt-2 text-center text-sm text-aqua-300">
          Salvando alteração...
        </p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="glass-soft min-w-0 p-4">
          <p className="label">Em manutenção ({room.brokenSeats.length})</p>

          {room.brokenSeats.length === 0 ? (
            <p className="text-sm text-mist">Nenhuma poltrona.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {room.brokenSeats.map((b) => (
                <li key={b.code} className="break-words">
                  <strong className="text-amber-300">{b.code}</strong>
                  <span className="text-mist">
                    {' '}— {b.reason || 'Sem motivo informado'}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass-soft min-w-0 p-4">
          <p className="label">Poltronas VIP ({room.vipSeats.length})</p>
          <p className="break-words text-sm text-mist">
            {room.vipSeats.length ? room.vipSeats.join(', ') : 'Nenhuma poltrona.'}
          </p>
        </div>
      </div>
    </div>
  );
}
