const mongoose = require('mongoose');
const { ROOM_TECHNOLOGIES } = require('../config');

const brokenSeatSchema = new mongoose.Schema(
  {
    code: { type: String, required: true },
    reason: { type: String, default: '' },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    technology: { type: String, enum: ROOM_TECHNOLOGIES, default: '2D' },
    rows: { type: [String], default: [] },
    cols: { type: Number, required: true, min: 1 },
    brokenSeats: { type: [brokenSeatSchema], default: [] },
    vipSeats: { type: [String], default: [] },
  },
  { _id: false }
);

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    synopsis: { type: String, required: true, trim: true },
    genre: { type: String, required: true, trim: true },
    rating: { type: String, required: true, trim: true },
    duration: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    showtimes: { type: [String], default: [] },
    posterUrl: { type: String, default: '' },
    trailerUrl: { type: String, default: '' },
    trailerSourceUrl: { type: String, default: '' },
    room: { type: roomSchema, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
