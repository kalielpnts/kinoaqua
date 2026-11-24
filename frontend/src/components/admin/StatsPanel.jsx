import { useCallback, useEffect, useState } from 'react';
import { DollarSign, Film, Popcorn, RefreshCw, ShoppingBag, Ticket, Users, Wrench } from 'lucide-react';
import { api } from '../../lib/api';
import { friendlyError } from '../../lib/errors';
import { brl, formatDateTime } from '../../lib/format';
import { ErrorBox, Spinner } from './ui';

function Card({ icon: Icon, label, value }) {
  return (
    <div className="glass p-5">
      <p className="flex items-center gap-2 text-xs uppercase tracking-wider text-mist">
        <Icon className="h-4 w-4 text-aqua-400" />
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}

export default function StatsPanel() {
  const [stats, setStats] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([api.get('/admin/stats'), api.get('/admin/tickets')]);
      setStats(s);
      setTickets(t.slice(0, 8));
      setError('');
    } catch (err) {
      setError(friendlyError(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!stats && !error) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Resumo da operação</h2>
        <button type="button" onClick={load} className="btn-ghost !px-3 !py-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </button>
      </div>
      <ErrorBox message={error} />
      {stats && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card icon={Ticket} label="Ingressos vendidos" value={stats.ticketsSold} />
            <Card icon={ShoppingBag} label="Pedidos" value={stats.orders} />
            <Card icon={DollarSign} label="Receita" value={brl(stats.revenue)} />
            <Card icon={Users} label="Usuários" value={stats.usersCount} />
            <Card icon={Film} label="Filmes em cartaz" value={stats.moviesActive} />
            <Card icon={Popcorn} label="Combos ativos" value={stats.combosActive} />
            <Card icon={Wrench} label="Poltronas em manutenção" value={stats.brokenSeatsTotal} />
          </div>

          <section className="glass p-5">
            <h3 className="text-lg font-semibold">Manutenção por sala</h3>
            {stats.maintenanceByRoom.length === 0 ? (
              <p className="mt-3 text-sm text-mist">Nenhuma sala cadastrada.</p>
            ) : (
              <ul className="mt-3 divide-y divide-aqua-400/10">
                {stats.maintenanceByRoom.map((r) => (
                  <li key={r.movieId} className="py-3 text-sm">
                    <p className="flex flex-wrap items-center justify-between gap-2">
                      <span>
                        <span className="font-medium">{r.room}</span> <span className="text-mist">({r.movie})</span>
                      </span>
                      <span className={r.broken ? 'text-amber-300' : 'text-mist'}>{r.broken} em manutenção</span>
                    </p>
                    {r.seats.length > 0 && (
                      <p className="mt-1 text-xs text-mist">{r.seats.map((s) => (s.reason ? `${s.code} (${s.reason})` : s.code)).join(' - ')}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="glass p-5">
            <h3 className="text-lg font-semibold">Últimas vendas</h3>
            {tickets.length === 0 ? (
              <p className="mt-3 text-sm text-mist">Nenhuma venda registrada ainda.</p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wider text-mist">
                    <tr>
                      <th className="py-2 pr-4">Código</th>
                      <th className="py-2 pr-4">Filme</th>
                      <th className="py-2 pr-4">Poltronas</th>
                      <th className="py-2 pr-4">Data</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-aqua-400/10">
                    {tickets.map((t) => (
                      <tr key={t.id}>
                        <td className="py-2 pr-4 tracking-wider text-aqua-400">{t.code}</td>
                        <td className="py-2 pr-4">{t.movieTitle}</td>
                        <td className="py-2 pr-4 text-mist">{t.seats.map((s) => s.code).join(', ')}</td>
                        <td className="py-2 pr-4 text-mist">{formatDateTime(t.createdAt)}</td>
                        <td className="py-2 text-right font-medium">{brl(t.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
