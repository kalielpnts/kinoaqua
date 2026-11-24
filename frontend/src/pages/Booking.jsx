import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowLeft, Armchair, Crown, Loader2, Popcorn, ShoppingBag } from 'lucide-react';
import AppShell from '../components/AppShell';
import SeatMap from '../components/SeatMap';
import { MAX_SEATS, useCart } from '../context/CartContext';
import { api } from '../lib/api';
import { friendlyError } from '../lib/errors';
import { brl, formatDuration } from '../lib/format';
import { useNavigate } from 'react-router-dom';

export default function Booking() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const cart = useCart();
  const [movie, setMovie] = useState(null);
  const [showtime, setShowtime] = useState('');
  const [map, setMap] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    setMovie(null);
    setMap(null);
    api
      .get(`/movies/${id}`)
      .then((m) => {
        if (!alive) return;
        const wanted = params.get('sessao');
        const fromCart = cart.session && cart.session.movie.id === m.id ? cart.session.showtime : '';
        const first = [wanted, fromCart].find((t) => t && m.showtimes.includes(t)) || m.showtimes[0] || '';
        setMovie(m);
        setShowtime(first);
      })
      .catch((err) => alive && setError(friendlyError(err)));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!movie || !showtime) return undefined;
    let alive = true;
    api
      .get(`/movies/${movie.id}/seats?showtime=${encodeURIComponent(showtime)}`)
      .then((data) => {
        if (!alive) return;
        setError('');
        setMap(data);
        cart.selectSession(
          {
            id: movie.id,
            title: movie.title,
            price: movie.price,
            posterUrl: movie.posterUrl,
            roomName: data.room.name,
            technology: data.room.technology,
            vipMultiplier: data.movie.vipMultiplier,
          },
          showtime
        );
        cart.pruneSeats(new Set(data.seats.filter((s) => s.status === 'available').map((s) => s.code)));
      })
      .catch((err) => alive && setError(friendlyError(err)));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie, showtime, cart.refreshKey]);

  const mine = cart.session && cart.session.movie.id === id && cart.session.showtime === showtime ? cart.session.seats : [];
  const limitReached = mine.length >= MAX_SEATS;

  return (
    <AppShell>
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-mist transition hover:text-aqua-400">
        <ArrowLeft className="h-4 w-4" />
        Voltar ao catálogo
      </Link>

      {error && !movie && (
        <div role="alert" className="mt-6 flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {!movie && !error && (
        <div className="flex justify-center py-24 text-aqua-400">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {movie && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
          <h1 className="mt-4 text-3xl font-semibold">{movie.title}</h1>
          <p className="mt-1 text-sm text-mist">
            {movie.room.name} - {movie.room.technology} - {movie.genre} - {formatDuration(movie.duration)}
          </p>

          <p className="label mt-6">Sessão</p>
          <div className="flex flex-wrap gap-2">
            {movie.showtimes.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setShowtime(t)}
                className={`rounded-lg border px-4 py-2 text-sm transition ${
                  t === showtime ? 'border-aqua-neon bg-aqua-neon/15 text-aqua-neon' : 'border-ink-700 text-mist hover:border-aqua-400/50 hover:text-ice'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {error && (
            <div role="alert" className="mt-4 flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              <AlertTriangle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="glass p-5 sm:p-8">
              {map ? (
                <SeatMap map={map} selectedCodes={mine.map((s) => s.code)} onToggle={cart.toggleSeat} limitReached={limitReached} />
              ) : (
                <div className="flex justify-center py-20 text-aqua-400">
                  <Loader2 className="h-7 w-7 animate-spin" />
                </div>
              )}
              {limitReached && <p className="mt-4 text-center text-sm text-amber-200">Limite de {MAX_SEATS} poltronas por compra.</p>}
            </div>

            <aside className="glass h-fit p-5 lg:sticky lg:top-24">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Armchair className="h-5 w-5 text-aqua-400" />
                Sua seleção
              </h2>
              {mine.length === 0 ? (
                <p className="mt-3 text-sm text-mist">Clique nas poltronas disponíveis do mapa para selecioná-las.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {mine.map((s) => (
                    <li key={s.code} className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {s.vip ? <Crown className="h-4 w-4 text-[#A5B0FF]" /> : <Armchair className="h-4 w-4 text-aqua-400" />}
                        {s.code}
                      </span>
                      <span>{brl(cart.seatPrice(s))}</span>
                    </li>
                  ))}
                </ul>
              )}
              {map && (
                <p className="mt-3 text-xs text-mist">
                  Poltronas VIP custam {Math.round((map.movie.vipMultiplier - 1) * 100)}% a mais. Disponíveis: {map.summary.available} de {map.summary.total}.
                </p>
              )}
              <div className="mt-4 border-t border-aqua-400/10 pt-4">
                <p className="flex justify-between font-display text-lg font-semibold">
                  <span>Ingressos</span>
                  <span>{brl(mine.reduce((acc, s) => acc + cart.seatPrice(s), 0))}</span>
                </p>
              </div>
              <button type="button" onClick={() => cart.setDrawerOpen(true)} disabled={mine.length === 0} className="btn-primary mt-4 w-full">
                <ShoppingBag className="h-4 w-4" />
                Abrir sacola ({cart.itemCount})
              </button>
              <button type="button" onClick={() => navigate('/?aba=bomboniere')} className="btn-ghost mt-2 w-full">
                <Popcorn className="h-4 w-4" />
                Adicionar combos
              </button>
            </aside>
          </div>
        </motion.div>
      )}
    </AppShell>
  );
}
