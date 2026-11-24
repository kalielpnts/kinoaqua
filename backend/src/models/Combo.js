const mongoose = require('mongoose');
const { COMBO_ILLUSTRATIONS } = require('../config');

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, default: 'Geral', trim: true },
    illustration: { type: String, enum: [...COMBO_ILLUSTRATIONS, ''], default: '' },
    imageUrl: { type: String, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Combo', schema);
