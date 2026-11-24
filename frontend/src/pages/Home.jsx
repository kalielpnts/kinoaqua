import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Film, Loader2, Minus, Plus, Popcorn, Search, ShoppingBag, WifiOff, X } from 'lucide-react';
import AppShell from '../components/AppShell';
import MovieCard from '../components/MovieCard';
import MovieModal from '../components/MovieModal';
import ComboIllustrations from '../components/ComboIllustrations';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';
import { brl } from '../lib/format';

function Chips({ items, value, onChange, allLabel }) {
  const all = ['', ...items];
  return (
    <div className="flex flex-wrap gap-2">
      {all.map((item) => (
        <button
          key={item || 'all'}
          type="button"
          onClick={() => onChange(item)}
          className={`rounded-full border px-3.5 py-1.5 text-xs transition ${
            value === item
              ? 'border-aqua-neon bg-aqua-neon/15 text-aqua-neon'
              : 'border-ink-700 text-mist hover:border-aqua-400/50 hover:text-ice'
          }`}
        >
          {item || allLabel}
        </button>
      ))}
    </div>
  );
}

function ComboCard({ combo, index }) {
  const cart = useCart();
  const qty = cart.combos[combo.id] ? cart.combos[combo.id].qty : 0;
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.05, duration: 0.45 }}
      whileHover={{ y: -6 }}
      className="glass flex flex-col overflow-hidden transition-shadow hover:shadow-glow"
    >
      <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-ink-800 to-ink-950 p-4">
        <ComboIllustrations kind={combo.illustration} imageUrl={combo.imageUrl} className="h-full w-full" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <span className="badge self-start border-aqua-400/30 bg-aqua-400/10 text-aqua-400">{combo.category}</span>
        <h3 className="mt-2 text-lg font-semibold leading-snug">{combo.name}</h3>
        <p className="mt-1 flex-1 text-sm text-mist">{combo.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="font-display text-xl font-semibold text-aqua-400">{brl(combo.price)}</p>
          {qty === 0 ? (
            <button type="button" onClick={() => cart.addCombo(combo)} className="btn-primary !px-4 !py-2">
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          ) : (
            <span className="flex items-center gap-2">
              <button type="button" onClick={() => cart.setComboQty(combo.id, qty - 1)} aria-label="Diminuir" className="rounded-lg border border-aqua-400/40 p-2 text-aqua-400 hover:bg-aqua-400/10">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-5 text-center font-semibold">{qty}</span>
              <button type="button" onClick={() => cart.addCombo(combo)} aria-label="Aumentar" className="rounded-lg border border-aqua-400/40 p-2 text-aqua-400 hover:bg-aqua-400/10">
                <Plus className="h-4 w-4" />
              </button>
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default function Home() {
  const { user } = useAuth();
  const cart = useCart();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get('aba') === 'bomboniere' ? 'bomboniere' : 'filmes';

  const [movies, setMovies] = useState(null);
  const [combos, setCombos] = useState(null);
  const [offline, setOffline] = useState(false);
  const [q, setQ] = useState('');
  const [genre, setGenre] = useState('');
  const [category, setCategory] = useState('');
  const [active, setActive] = useState(null);

  const load = useCallback(async () => {
    const [m, c] = await Promise.allSettled([api.get('/movies'), api.get('/combos')]);
    setOffline(m.status === 'rejected' && c.status === 'rejected');
    setMovies((prev) => (m.status === 'fulfilled' ? m.value : prev || []));
    setCombos((prev) => (c.status === 'fulfilled' ? c.value : prev || []));
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [load]);

  function changeTab(next) {
    setParams(next === 'bomboniere' ? { aba: 'bomboniere' } : {});
    setQ('');
    setGenre('');
    setCategory('');
  }

  const nq = q.trim().toLowerCase();
  const genres = useMemo(() => [...new Set((movies || []).map((m) => m.genre))], [movies]);
  const categories = useMemo(() => [...new Set((combos || []).map((c) => c.category))], [combos]);
  const shownMovies = (movies || []).filter(
    (m) => (!genre || m.genre === genre) && (!nq || [m.title, m.genre, m.synopsis].some((s) => s.toLowerCase().includes(nq)))
  );
  const shownCombos = (combos || []).filter(
    (c) => (!category || c.category === category) && (!nq || [c.name, c.description].some((s) => s.toLowerCase().includes(nq)))
  );

  function choose(movie, showtime) {
    setActive(null);
    navigate(`/filme/${movie.id}${showtime ? `?sessao=${encodeURIComponent(showtime)}` : ''}`);
  }

  const loading = movies === null || combos === null;

  return (
    <AppShell>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Olá, <span className="text-gradient-aqua">{user.name}</span>
        </h1>
        <p className="mt-2 max-w-2xl text-mist">Escolha um filme, reserve suas poltronas e adicione combos da bomboniere na mesma compra.</p>
      </motion.div>

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div role="tablist" className="relative inline-grid grid-cols-2 rounded-xl border border-aqua-400/15 bg-ink-950/60 p-1">
          {[
            { id: 'filmes', label: 'Em cartaz', icon: Film },
            { id: 'bomboniere', label: 'Bomboniere', icon: Popcorn },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => changeTab(t.id)}
              className={`relative z-10 flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
                tab === t.id ? 'text-ink-950' : 'text-mist hover:text-ice'
              }`}
            >
              {tab === t.id && (
                <motion.span layoutId="ka-home-tab" className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-r from-aqua-neon to-aqua-500" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />
              )}
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:max-w-sm">
          <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-aqua-400/80" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tab === 'filmes' ? 'Buscar por título, gênero ou sinopse' : 'Buscar combos'}
            aria-label="Buscar"
            className="input-field pr-10"
          />
          {q && (
            <button type="button" onClick={() => setQ('')} aria-label="Limpar busca" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-mist hover:text-aqua-400">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        {tab === 'filmes' ? (
          <Chips items={genres} value={genre} onChange={setGenre} allLabel="Todos os gêneros" />
        ) : (
          <Chips items={categories} value={category} onChange={setCategory} allLabel="Todas as categorias" />
        )}
      </div>

      {offline && (
        <div role="alert" className="mt-6 flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <WifiOff className="h-4 w-4" />
          Não foi possível conectar à API. Inicie o servidor com ./dev.sh.
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-24 text-aqua-400">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : tab === 'filmes' ? (
        shownMovies.length === 0 ? (
          <p className="py-20 text-center text-mist">Nenhum filme encontrado para este filtro.</p>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shownMovies.map((m, i) => (
              <MovieCard key={m.id} movie={m} index={i} onDetails={setActive} onChoose={(mv) => choose(mv)} />
            ))}
          </div>
        )
      ) : shownCombos.length === 0 ? (
        <p className="py-20 text-center text-mist">Nenhum combo encontrado para este filtro.</p>
      ) : (
        <>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {shownCombos.map((c, i) => (
              <ComboCard key={c.id} combo={c} index={i} />
            ))}
          </div>
          {cart.itemCount > 0 && (
            <div className="mt-8 flex justify-center">
              <button type="button" onClick={() => cart.setDrawerOpen(true)} className="btn-primary">
                <ShoppingBag className="h-4 w-4" />
                Ver sacola ({cart.itemCount})
              </button>
            </div>
          )}
        </>
      )}

      <MovieModal movie={active} onClose={() => setActive(null)} onChoose={choose} />
    </AppShell>
  );
}
