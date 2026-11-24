import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Armchair, Crown, Loader2, Minus, Plus, Popcorn, ShoppingBag, Ticket, Trash2, X } from 'lucide-react';
import Modal from './Modal';
import TicketDigital from './TicketDigital';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';
import { friendlyError } from '../lib/errors';
import { brl } from '../lib/format';

export default function BagLayer() {
  const cart = useCart();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const s = cart.session;
  const hasSeats = cart.seats.length > 0;
  const empty = !hasSeats && cart.comboList.length === 0;

  function close() {
    cart.setDrawerOpen(false);
    setError('');
  }

  async function checkout() {
    if (!s || !hasSeats) return;
    setError('');
    setBusy(true);
    try {
      const data = await api.post('/tickets', {
        movieId: s.movie.id,
        showtime: s.showtime,
        seats: cart.seats.map((x) => x.code),
        combos: cart.comboList.map((i) => ({ comboId: i.combo.id, quantity: i.qty })),
      });
      cart.completePurchase(data.ticket);
    } catch (err) {
      setError(friendlyError(err));
      if (err && (err.code === 'SEAT_OCCUPIED' || err.code === 'SEAT_BROKEN')) cart.dropSeats();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <AnimatePresence>
        {cart.drawerOpen && (
          <motion.div
            key="bag-backdrop"
            className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />
        )}
        {cart.drawerOpen && (
          <motion.aside
            key="bag-panel"
            role="dialog"
            aria-label="Sacola"
            className="fixed bottom-0 right-0 top-0 z-40 flex w-full max-w-md flex-col border-l border-aqua-400/20 bg-ink-900/95 backdrop-blur-xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-aqua-400/10 p-5">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <ShoppingBag className="h-5 w-5 text-aqua-400" />
                Sua sacola
              </h2>
              <button type="button" onClick={close} aria-label="Fechar sacola" className="rounded-lg p-2 text-mist hover:text-aqua-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-5">
              {empty && (
                <div className="py-10 text-center text-sm text-mist">
                  <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-aqua-400/60" />
                  <p>Sua sacola está vazia.</p>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      navigate('/');
                    }}
                    className="btn-ghost mt-4"
                  >
                    Ver filmes em cartaz
                  </button>
                </div>
              )}

              {s && hasSeats && (
                <section>
                  <p className="label">Ingressos</p>
                  <div className="glass-soft p-4">
                    <p className="font-medium">{s.movie.title}</p>
                    <p className="text-xs text-mist">
                      Sessão {s.showtime} - {s.movie.roomName}
                    </p>
                    <ul className="mt-3 space-y-2">
                      {cart.seats.map((seat) => (
                        <li key={seat.code} className="flex items-center justify-between gap-3 text-sm">
                          <span className="flex items-center gap-2">
                            {seat.vip ? <Crown className="h-4 w-4 text-[#A5B0FF]" /> : <Armchair className="h-4 w-4 text-aqua-400" />}
                            Poltrona {seat.code}
                            {seat.vip && <span className="text-xs text-[#A5B0FF]">VIP</span>}
                          </span>
                          <span className="flex items-center gap-2">
                            {brl(cart.seatPrice(seat))}
                            <button
                              type="button"
                              onClick={() => cart.toggleSeat(seat)}
                              aria-label={`Remover poltrona ${seat.code}`}
                              className="rounded-md p-1 text-mist hover:text-rose-300"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => {
                        close();
                        navigate(`/filme/${s.movie.id}`);
                      }}
                      className="mt-3 text-xs text-aqua-400 hover:underline"
                    >
                      Alterar poltronas
                    </button>
                  </div>
                </section>
              )}

              {cart.comboList.length > 0 && (
                <section>
                  <p className="label">Combos</p>
                  <ul className="space-y-2">
                    {cart.comboList.map(({ combo, qty }) => (
                      <li key={combo.id} className="glass-soft flex items-center justify-between gap-3 p-3 text-sm">
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{combo.name}</span>
                          <span className="text-xs text-mist">{brl(combo.price * qty)}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <button type="button" onClick={() => cart.setComboQty(combo.id, qty - 1)} aria-label="Diminuir" className="rounded-md border border-ink-700 p-1.5 text-mist hover:text-aqua-400">
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-6 text-center">{qty}</span>
                          <button type="button" onClick={() => cart.setComboQty(combo.id, qty + 1)} aria-label="Aumentar" className="rounded-md border border-ink-700 p-1.5 text-mist hover:text-aqua-400">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {!empty && (
                <button
                  type="button"
                  onClick={() => {
                    close();
                    navigate('/?aba=bomboniere');
                  }}
                  className="btn-ghost w-full"
                >
                  <Popcorn className="h-4 w-4" />
                  Adicionar combos
                </button>
              )}
            </div>

            {!empty && (
              <div className="space-y-3 border-t border-aqua-400/10 p-5">
                <div className="space-y-1 text-sm text-mist">
                  <p className="flex justify-between">
                    <span>Ingressos</span>
                    <span>{brl(cart.seatsTotal)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>Combos</span>
                    <span>{brl(cart.combosTotal)}</span>
                  </p>
                  <p className="flex justify-between pt-1 font-display text-lg font-semibold text-ice">
                    <span>Total</span>
                    <span>{brl(cart.total)}</span>
                  </p>
                </div>
                {error && (
                  <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-200">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {!hasSeats && <p className="text-xs text-mist">Selecione ao menos uma poltrona para finalizar. Os combos são emitidos junto com o ingresso.</p>}
                <button type="button" onClick={checkout} disabled={busy || !hasSeats} className="btn-primary w-full">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ticket className="h-4 w-4" />}
                  {busy ? 'Emitindo ticket...' : 'Finalizar compra (simulada)'}
                </button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      <Modal open={!!cart.issuedTicket} onClose={() => cart.setIssuedTicket(null)} maxWidth="max-w-md" label="Ticket digital">
        {cart.issuedTicket && (
          <div className="p-4 pt-12 sm:p-5 sm:pt-12">
            <p className="mb-3 text-center text-sm text-aqua-400">Compra confirmada. Seu ticket foi emitido.</p>
            <TicketDigital ticket={cart.issuedTicket} />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { cart.setIssuedTicket(null); navigate('/ingressos'); }} className="btn-ghost">
                Meus ingressos
              </button>
              <button type="button" onClick={() => { cart.setIssuedTicket(null); navigate('/'); }} className="btn-primary">
                Continuar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
