const express = require('express');
const crypto = require('crypto');
const mongoose = require('mongoose');
const config = require('../config');
const { Movie, Combo, Ticket, SeatReservation } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { authRequired } = require('../middleware/auth');
const { seatCodes } = require('../utils/seats');
const { serialize, round2, fail } = require('../utils/serialize');

const router = express.Router();

function genCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(8);
  let out = 'KA-';
  for (let i = 0; i < 8; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

// Compra unificada: poltronas + combos
router.post(
  '/',
  authRequired,
  asyncHandler(async (req, res) => {
    const body = req.body || {};

    if (!mongoose.isValidObjectId(body.movieId)) return fail(res, 400, 'INVALID_MOVIE', 'Filme invalido');
    const movie = await Movie.findById(body.movieId);
    if (!movie || !movie.active) return fail(res, 404, 'MOVIE_NOT_FOUND', 'Filme nao encontrado');

    const showtime = String(body.showtime || '').trim();
    if (!movie.showtimes.includes(showtime)) return fail(res, 400, 'INVALID_SHOWTIME', 'Sessao invalida');

    if (!Array.isArray(body.seats) || !body.seats.length) {
      return fail(res, 400, 'NO_SEATS', 'Selecione ao menos uma poltrona');
    }
    const seats = [...new Set(body.seats.map((s) => String(s).trim().toUpperCase()))];
    if (seats.length > config.MAX_SEATS_PER_ORDER) {
      return fail(res, 400, 'TOO_MANY_SEATS', `Limite de ${config.MAX_SEATS_PER_ORDER} poltronas por compra`);
    }

    const valid = new Set(seatCodes(movie.room));
    const invalid = seats.filter((s) => !valid.has(s));
    if (invalid.length) return fail(res, 400, 'INVALID_SEAT', `Poltrona inexistente: ${invalid.join(', ')}`);

    const broken = new Map(movie.room.brokenSeats.map((b) => [b.code, b.reason]));
    const blocked = seats.filter((s) => broken.has(s));
    if (blocked.length) {
      const detail = blocked.map((s) => (broken.get(s) ? `${s} (${broken.get(s)})` : s)).join(', ');
      return fail(res, 409, 'SEAT_BROKEN', `Poltrona em manutencao: ${detail}`);
    }

    const taken = await SeatReservation.find({ movie: movie._id, showtime, seat: { $in: seats } });
    if (taken.length) {
      return fail(res, 409, 'SEAT_OCCUPIED', `Poltrona ja ocupada: ${taken.map((t) => t.seat).join(', ')}`);
    }

    // Combos
    const comboLines = [];
    const combosIn = Array.isArray(body.combos) ? body.combos : [];
    for (const item of combosIn) {
      const qty = Math.floor(Number(item && item.quantity !== undefined ? item.quantity : 1));
      if (!item || !mongoose.isValidObjectId(item.comboId) || !(qty >= 1) || qty > 20) {
        return fail(res, 400, 'INVALID_COMBO', 'Combo invalido');
      }
      const combo = await Combo.findById(item.comboId);
      if (!combo || !combo.active) return fail(res, 404, 'COMBO_NOT_FOUND', 'Combo nao encontrado');
      comboLines.push({
        combo: combo._id,
        name: combo.name,
        unitPrice: combo.price,
        quantity: qty,
        subtotal: round2(combo.price * qty),
      });
    }

    const vip = new Set(movie.room.vipSeats);
    const seatLines = seats.map((code) => ({
      code,
      vip: vip.has(code),
      price: round2(movie.price * (vip.has(code) ? config.VIP_MULTIPLIER : 1)),
    }));
    const seatsTotal = round2(seatLines.reduce((acc, s) => acc + s.price, 0));
    const combosTotal = round2(comboLines.reduce((acc, c) => acc + c.subtotal, 0));

    // Reserva atomica via indice unico (protege contra compras simultaneas)
    const code = genCode();
    try {
      await SeatReservation.insertMany(
        seats.map((seat) => ({ movie: movie._id, showtime, seat, ticketCode: code })),
        { ordered: true }
      );
    } catch (err) {
      await SeatReservation.deleteMany({ ticketCode: code });
      if (err && err.code === 11000) {
        return fail(res, 409, 'SEAT_OCCUPIED', 'Uma das poltronas acabou de ser ocupada por outra compra');
      }
      throw err;
    }

    let ticket;
    try {
      ticket = await Ticket.create({
        code,
        user: req.user._id,
        movie: movie._id,
        movieTitle: movie.title,
        posterUrl: movie.posterUrl,
        roomName: movie.room.name,
        roomTechnology: movie.room.technology,
        showtime,
        seats: seatLines,
        combos: comboLines,
        seatsTotal,
        combosTotal,
        total: round2(seatsTotal + combosTotal),
      });
    } catch (err) {
      await SeatReservation.deleteMany({ ticketCode: code });
      throw err;
    }

    res.status(201).json({ ticket: serialize(ticket) });
  })
);

router.get(
  '/mine',
  authRequired,
  asyncHandler(async (req, res) => {
    const tickets = await Ticket.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tickets.map(serialize));
  })
);

router.get(
  '/:id',
  authRequired,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 404, 'TICKET_NOT_FOUND', 'Ingresso nao encontrado');
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return fail(res, 404, 'TICKET_NOT_FOUND', 'Ingresso nao encontrado');
    if (String(ticket.user) !== String(req.user._id) && req.user.role !== 'admin') {
      return fail(res, 403, 'FORBIDDEN', 'Acesso negado');
    }
    res.json(serialize(ticket));
  })
);

module.exports = router;
