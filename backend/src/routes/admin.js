const express = require('express');
const { Movie, Combo, Ticket, SeatReservation, User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { authRequired, adminRequired } = require('../middleware/auth');
const { serialize } = require('../utils/serialize');

const router = express.Router();
router.use(authRequired, adminRequired);

router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const [ticketsSold, orders, revenueAgg, moviesActive, combosActive, usersCount, movies] = await Promise.all([
      SeatReservation.countDocuments(),
      Ticket.countDocuments({ status: 'confirmed' }),
      Ticket.aggregate([{ $match: { status: 'confirmed' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Movie.countDocuments({ active: true }),
      Combo.countDocuments({ active: true }),
      User.countDocuments({ role: 'user' }),
      Movie.find().select('title room'),
    ]);

    const maintenanceByRoom = movies.map((m) => ({
      movieId: String(m._id),
      movie: m.title,
      room: m.room.name,
      broken: m.room.brokenSeats.length,
      seats: m.room.brokenSeats.map((b) => ({ code: b.code, reason: b.reason })),
    }));

    res.json({
      ticketsSold,
      orders,
      revenue: revenueAgg.length ? Math.round(revenueAgg[0].total * 100) / 100 : 0,
      moviesActive,
      combosActive,
      usersCount,
      brokenSeatsTotal: maintenanceByRoom.reduce((acc, r) => acc + r.broken, 0),
      maintenanceByRoom,
    });
  })
);

router.get(
  '/tickets',
  asyncHandler(async (req, res) => {
    const tickets = await Ticket.find().sort({ createdAt: -1 }).limit(200);
    res.json(tickets.map(serialize));
  })
);

module.exports = router;
