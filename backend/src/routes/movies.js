const express = require('express');
const mongoose = require('mongoose');
const config = require('../config');
const { Movie, SeatReservation } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { optionalAuth, authRequired, adminRequired } = require('../middleware/auth');
const { toEmbedUrl } = require('../utils/youtube');
const { normalizeRoom, seatCodes } = require('../utils/seats');
const { serialize, fail } = require('../utils/serialize');

const router = express.Router();

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function parseMovie(input) {
  const errors = [];
  const title = String(input.title || '').trim();
  if (!title) errors.push('Titulo obrigatorio');
  const synopsis = String(input.synopsis || '').trim();
  if (!synopsis) errors.push('Sinopse obrigatoria');
  const genre = String(input.genre || '').trim();
  if (!genre) errors.push('Genero obrigatorio');
  const rating = String(input.rating || '').trim();
  if (!rating) errors.push('Classificacao indicativa obrigatoria');

  const duration = Number(input.duration);
  if (!Number.isFinite(duration) || duration <= 0) errors.push('Duracao invalida');
  const price = Number(input.price);
  if (!Number.isFinite(price) || price < 0) errors.push('Preco invalido');

  let showtimes = input.showtimes;
  if (typeof showtimes === 'string') showtimes = showtimes.split(/[\s,;]+/);
  showtimes = Array.isArray(showtimes) ? [...new Set(showtimes.map((s) => String(s).trim()).filter(Boolean))] : [];
  if (!showtimes.length) errors.push('Informe ao menos um horario de sessao (HH:MM)');
  else if (showtimes.some((s) => !TIME_RE.test(s))) errors.push('Horario de sessao invalido (use HH:MM)');
  showtimes.sort();

  const posterUrl = String(input.posterUrl || '').trim();
  if (posterUrl && !/^(https?:\/\/|data:image\/)/i.test(posterUrl)) errors.push('URL do poster invalida');

  const rawTrailer = String(input.trailerSourceUrl || input.trailerUrl || '').trim();
  let trailerUrl = '';
  let trailerSourceUrl = '';
  if (rawTrailer) {
    const embed = toEmbedUrl(rawTrailer);
    if (!embed) errors.push('Link do YouTube invalido');
    else {
      trailerUrl = embed;
      trailerSourceUrl = rawTrailer;
    }
  }

  const roomResult = normalizeRoom(input.room);
  errors.push(...roomResult.errors);

  return {
    errors,
    data: {
      title,
      synopsis,
      genre,
      rating,
      duration,
      price,
      showtimes,
      posterUrl,
      trailerUrl,
      trailerSourceUrl,
      room: roomResult.room,
      active: input.active === undefined ? true : Boolean(input.active),
    },
  };
}

async function findMovie(id) {
  if (!mongoose.isValidObjectId(id)) return null;
  return Movie.findById(id);
}

// Listagem (publica). Usuarios comuns veem apenas filmes ativos.
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const filter = {};
    if (!(req.user && req.user.role === 'admin')) filter.active = true;
    if (req.query.genre) filter.genre = new RegExp('^' + escapeRegex(String(req.query.genre)) + '$', 'i');
    if (req.query.q) {
      const rx = new RegExp(escapeRegex(String(req.query.q)), 'i');
      filter.$or = [{ title: rx }, { genre: rx }, { synopsis: rx }];
    }
    const movies = await Movie.find(filter).sort({ createdAt: -1 });
    res.json(movies.map(serialize));
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const movie = await findMovie(req.params.id);
    if (!movie) return fail(res, 404, 'MOVIE_NOT_FOUND', 'Filme nao encontrado');
    res.json(serialize(movie));
  })
);

// Mapa de poltronas de uma sessao
router.get(
  '/:id/seats',
  asyncHandler(async (req, res) => {
    const movie = await findMovie(req.params.id);
    if (!movie) return fail(res, 404, 'MOVIE_NOT_FOUND', 'Filme nao encontrado');
    const showtime = String(req.query.showtime || movie.showtimes[0] || '');
    if (!movie.showtimes.includes(showtime)) return fail(res, 400, 'INVALID_SHOWTIME', 'Sessao invalida');

    const reservations = await SeatReservation.find({ movie: movie._id, showtime }).select('seat');
    const reserved = new Set(reservations.map((r) => r.seat));
    const broken = new Map(movie.room.brokenSeats.map((b) => [b.code, b.reason]));
    const vip = new Set(movie.room.vipSeats);

    const seats = [];
    const summary = { total: 0, available: 0, occupied: 0, broken: 0, vip: 0 };
    for (const row of movie.room.rows) {
      for (let col = 1; col <= movie.room.cols; col++) {
        const code = `${row}${col}`;
        let status = 'available';
        if (broken.has(code)) status = 'broken';
        else if (reserved.has(code)) status = 'occupied';
        seats.push({ code, row, col, status, vip: vip.has(code), reason: broken.get(code) || '' });
        summary.total++;
        summary[status]++;
        if (vip.has(code)) summary.vip++;
      }
    }

    res.json({
      movie: { id: String(movie._id), title: movie.title, price: movie.price, vipMultiplier: config.VIP_MULTIPLIER },
      showtime,
      room: { name: movie.room.name, technology: movie.room.technology, rows: movie.room.rows, cols: movie.room.cols },
      seats,
      summary,
    });
  })
);

router.post(
  '/',
  authRequired,
  adminRequired,
  asyncHandler(async (req, res) => {
    const { data, errors } = parseMovie(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors.join('; '), code: 'VALIDATION', errors });
    const movie = await Movie.create(data);
    res.status(201).json(serialize(movie));
  })
);

router.put(
  '/:id',
  authRequired,
  adminRequired,
  asyncHandler(async (req, res) => {
    const movie = await findMovie(req.params.id);
    if (!movie) return fail(res, 404, 'MOVIE_NOT_FOUND', 'Filme nao encontrado');
    const b = req.body || {};
    const merged = { ...movie.toObject(), ...b };
    if ('trailerUrl' in b || 'trailerSourceUrl' in b) {
      const raw = b.trailerSourceUrl ?? b.trailerUrl ?? '';
      merged.trailerSourceUrl = raw;
      merged.trailerUrl = raw;
    }
    const { data, errors } = parseMovie(merged);
    if (errors.length) return res.status(400).json({ error: errors.join('; '), code: 'VALIDATION', errors });
    movie.set(data);
    await movie.save();
    res.json(serialize(movie));
  })
);

// Editor visual de cadeiras: marca uma poltrona como quebrada, VIP ou normal
router.patch(
  '/:id/seats',
  authRequired,
  adminRequired,
  asyncHandler(async (req, res) => {
    const movie = await findMovie(req.params.id);
    if (!movie) return fail(res, 404, 'MOVIE_NOT_FOUND', 'Filme nao encontrado');
    const code = String((req.body && req.body.seat) || '').trim().toUpperCase();
    const status = String((req.body && req.body.status) || '');
    const reason = String((req.body && req.body.reason) || '').trim();

    if (!new Set(seatCodes(movie.room)).has(code)) return fail(res, 400, 'INVALID_SEAT', 'Poltrona inexistente na sala');
    if (!['broken', 'vip', 'available'].includes(status)) {
      return fail(res, 400, 'INVALID_STATUS', 'Status invalido (broken, vip ou available)');
    }

    let broken = movie.room.brokenSeats.map((b) => ({ code: b.code, reason: b.reason })).filter((b) => b.code !== code);
    let vip = movie.room.vipSeats.filter((c) => c !== code);

    if (status === 'broken') {
      const sold = await SeatReservation.countDocuments({ movie: movie._id, seat: code });
      if (sold > 0) {
        return fail(res, 409, 'SEAT_OCCUPIED', 'Poltrona ja vendida em uma sessao; nao pode entrar em manutencao');
      }
      broken.push({ code, reason });
    } else if (status === 'vip') {
      vip.push(code);
    }

    movie.set('room.brokenSeats', broken);
    movie.set('room.vipSeats', vip);
    await movie.save();
    res.json(serialize(movie));
  })
);

router.delete(
  '/:id',
  authRequired,
  adminRequired,
  asyncHandler(async (req, res) => {
    const movie = await findMovie(req.params.id);
    if (!movie) return fail(res, 404, 'MOVIE_NOT_FOUND', 'Filme nao encontrado');
    await SeatReservation.deleteMany({ movie: movie._id });
    await movie.deleteOne();
    res.json({ ok: true });
  })
);

module.exports = router;
