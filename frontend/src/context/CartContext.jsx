import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const CartContext = createContext(null);
export const MAX_SEATS = 10;
const MAX_COMBO_QTY = 20;

export function CartProvider({ children }) {
  // session = { movie: {...}, showtime, seats: [{ code, vip }] }
  const [session, setSession] = useState(null);
  const [combos, setCombos] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [issuedTicket, setIssuedTicket] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const selectSession = useCallback((movie, showtime) => {
    setSession((prev) =>
      prev && prev.movie.id === movie.id && prev.showtime === showtime
        ? prev
        : { movie, showtime, seats: [] }
    );
  }, []);

  const toggleSeat = useCallback((seat) => {
    setSession((prev) => {
      if (!prev) return prev;
      if (prev.seats.some((s) => s.code === seat.code)) {
        return { ...prev, seats: prev.seats.filter((s) => s.code !== seat.code) };
      }
      if (prev.seats.length >= MAX_SEATS) return prev;
      return { ...prev, seats: [...prev.seats, { code: seat.code, vip: !!seat.vip }] };
    });
  }, []);

  const pruneSeats = useCallback((validCodes) => {
    setSession((prev) => {
      if (!prev || prev.seats.every((s) => validCodes.has(s.code))) return prev;
      return { ...prev, seats: prev.seats.filter((s) => validCodes.has(s.code)) };
    });
  }, []);

  const dropSeats = useCallback(() => {
    setSession((prev) => (prev ? { ...prev, seats: [] } : prev));
    setRefreshKey((k) => k + 1);
  }, []);

  const addCombo = useCallback((combo) => {
    setCombos((prev) => {
      const current = prev[combo.id] ? prev[combo.id].qty : 0;
      return { ...prev, [combo.id]: { combo, qty: Math.min(MAX_COMBO_QTY, current + 1) } };
    });
  }, []);

  const setComboQty = useCallback((id, qty) => {
    setCombos((prev) => {
      if (!prev[id]) return prev;
      if (qty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { ...prev[id], qty: Math.min(MAX_COMBO_QTY, qty) } };
    });
  }, []);

  const completePurchase = useCallback((ticket) => {
    setIssuedTicket(ticket);
    setSession((prev) => (prev ? { ...prev, seats: [] } : prev));
    setCombos({});
    setDrawerOpen(false);
    setRefreshKey((k) => k + 1);
  }, []);

  const value = useMemo(() => {
    const seats = session ? session.seats : [];
    const mult = session && session.movie.vipMultiplier ? session.movie.vipMultiplier : 1.5;
    const base = session ? session.movie.price : 0;
    const seatPrice = (s) => Math.round(base * (s.vip ? mult : 1) * 100) / 100;
    const seatsTotal = Math.round(seats.reduce((acc, s) => acc + seatPrice(s), 0) * 100) / 100;
    const comboList = Object.values(combos);
    const combosTotal = Math.round(comboList.reduce((acc, i) => acc + i.combo.price * i.qty, 0) * 100) / 100;
    const comboCount = comboList.reduce((acc, i) => acc + i.qty, 0);
    return {
      session,
      seats,
      seatPrice,
      comboList,
      combos,
      seatsTotal,
      combosTotal,
      total: Math.round((seatsTotal + combosTotal) * 100) / 100,
      itemCount: seats.length + comboCount,
      drawerOpen,
      setDrawerOpen,
      issuedTicket,
      setIssuedTicket,
      refreshKey,
      selectSession,
      toggleSeat,
      pruneSeats,
      dropSeats,
      addCombo,
      setComboQty,
      completePurchase,
    };
  }, [session, combos, drawerOpen, issuedTicket, refreshKey, selectSession, toggleSeat, pruneSeats, dropSeats, addCombo, setComboQty, completePurchase]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider');
  return ctx;
}
