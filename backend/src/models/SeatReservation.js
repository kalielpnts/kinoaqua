const mongoose = require('mongoose');

// Uma reserva por (filme, sessao, poltrona). O indice unico garante que duas
// compras simultaneas nunca ocupem a mesma poltrona.
const schema = new mongoose.Schema(
  {
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    showtime: { type: String, required: true },
    seat: { type: String, required: true },
    ticketCode: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

schema.index({ movie: 1, showtime: 1, seat: 1 }, { unique: true });

module.exports = mongoose.model('SeatReservation', schema);
