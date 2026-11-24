const mongoose = require('mongoose');

const seatLine = new mongoose.Schema(
  {
    code: { type: String, required: true },
    vip: { type: Boolean, default: false },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const comboLine = new mongoose.Schema(
  {
    combo: { type: mongoose.Schema.Types.ObjectId, ref: 'Combo' },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const schema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    movie: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie', required: true },
    movieTitle: { type: String, required: true },
    posterUrl: { type: String, default: '' },
    roomName: { type: String, required: true },
    roomTechnology: { type: String, default: '2D' },
    showtime: { type: String, required: true },
    seats: { type: [seatLine], default: [] },
    combos: { type: [comboLine], default: [] },
    seatsTotal: { type: Number, required: true },
    combosTotal: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: { type: String, enum: ['confirmed', 'cancelled'], default: 'confirmed' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Ticket', schema);
