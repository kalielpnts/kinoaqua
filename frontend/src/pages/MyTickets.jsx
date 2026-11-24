import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Loader2, Ticket } from 'lucide-react';
import AppShell from '../components/AppShell';
import Modal from '../components/Modal';
import TicketDigital from '../components/TicketDigital';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';
import { friendlyError } from '../lib/errors';
import { brl, formatDateTime } from '../lib/format';

export default function MyTickets() {
  const cart = useCart();
  const [tickets, setTickets] = useState(null);
  const [error, setError] = useState('');
  const [open, setOpen] = useState(null);

  useEffect(() => {
    let alive = true;
    api
      .get('/tickets/mine')
      .then((d) => alive && setTickets(d))
      .catch((err) => {
        if (alive) {
          setError(friendlyError(err));
          setTickets([]);
        }
      });
    return () => {
      alive = false;
    };
  }, [cart.refreshKey]);

  return (
    <AppShell>
      <h1 className="text-3xl font-semibold">
        Meus <span className="text-gradient-aqua">ingressos</span>
      </h1>
      <p className="mt-2 text-mist">Todos os tickets digitais emitidos para a sua conta.</p>

      {error && (
        <div role="alert" className="mt-6 flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      {tickets === null ? (
        <div className="flex justify-center py-24 text-aqua-400">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="glass mt-8 flex flex-col items-center gap-3 p-10 text-center text-mist">
          <Ticket className="h-8 w-8 text-aqua-400/70" />
          <p>Você ainda não comprou nenhum ingresso.</p>
          <Link to="/" className="btn-primary mt-2">
            Ver filmes em cartaz
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tickets.map((t, i) => (
            <motion.button
              key={t.id}
              type="button"
              onClick={() => setOpen(t)}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i, 8) * 0.05 }}
              whileHover={{ y: -4 }}
              className="glass p-5 text-left transition-shadow hover:shadow-glow"
            >
              <p className="text-lg font-semibold leading-snug">{t.movieTitle}</p>
              <p className="mt-1 text-xs text-mist">
                Sessão {t.showtime} - {t.roomName}
              </p>
              <p className="mt-3 text-sm text-ice/90">Poltronas: {t.seats.map((s) => s.code).join(', ')}</p>
              <p className="mt-3 flex items-end justify-between">
                <span className="text-xs text-mist">{formatDateTime(t.createdAt)}</span>
                <span className="font-display text-lg font-semibold text-aqua-400">{brl(t.total)}</span>
              </p>
              <p className="mt-2 text-xs tracking-wider text-mist/80">{t.code}</p>
            </motion.button>
          ))}
        </div>
      )}

      <Modal open={!!open} onClose={() => setOpen(null)} maxWidth="max-w-md" label="Ticket digital">
        {open && (
          <div className="p-4 pt-12 sm:p-5 sm:pt-12">
            <TicketDigital ticket={open} />
          </div>
        )}
      </Modal>
    </AppShell>
  );
}
