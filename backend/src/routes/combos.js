const express = require('express');
const mongoose = require('mongoose');
const config = require('../config');
const { Combo } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { optionalAuth, authRequired, adminRequired } = require('../middleware/auth');
const { serialize, fail } = require('../utils/serialize');

const router = express.Router();
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function parseCombo(input) {
  const errors = [];
  const name = String(input.name || '').trim();
  if (!name) errors.push('Nome obrigatorio');
  const price = Number(input.price);
  if (!Number.isFinite(price) || price < 0) errors.push('Preco invalido');
  const illustration = String(input.illustration || '').trim();
  if (illustration && !config.COMBO_ILLUSTRATIONS.includes(illustration)) {
    errors.push(`Ilustracao invalida (use: ${config.COMBO_ILLUSTRATIONS.join(', ')})`);
  }
  const imageUrl = String(input.imageUrl || '').trim();
  if (imageUrl && !/^(https?:\/\/|data:image\/)/i.test(imageUrl)) errors.push('URL da imagem invalida');
  return {
    errors,
    data: {
      name,
      description: String(input.description || '').trim(),
      price,
      category: String(input.category || 'Geral').trim() || 'Geral',
      illustration,
      imageUrl,
      active: input.active === undefined ? true : Boolean(input.active),
    },
  };
}

router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const filter = {};
    if (!(req.user && req.user.role === 'admin')) filter.active = true;
    if (req.query.category) filter.category = new RegExp('^' + escapeRegex(String(req.query.category)) + '$', 'i');
    if (req.query.q) {
      const rx = new RegExp(escapeRegex(String(req.query.q)), 'i');
      filter.$or = [{ name: rx }, { description: rx }];
    }
    const combos = await Combo.find(filter).sort({ createdAt: 1 });
    res.json(combos.map(serialize));
  })
);

router.post(
  '/',
  authRequired,
  adminRequired,
  asyncHandler(async (req, res) => {
    const { data, errors } = parseCombo(req.body || {});
    if (errors.length) return res.status(400).json({ error: errors.join('; '), code: 'VALIDATION', errors });
    const combo = await Combo.create(data);
    res.status(201).json(serialize(combo));
  })
);

router.put(
  '/:id',
  authRequired,
  adminRequired,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 404, 'COMBO_NOT_FOUND', 'Combo nao encontrado');
    const combo = await Combo.findById(req.params.id);
    if (!combo) return fail(res, 404, 'COMBO_NOT_FOUND', 'Combo nao encontrado');
    const { data, errors } = parseCombo({ ...combo.toObject(), ...(req.body || {}) });
    if (errors.length) return res.status(400).json({ error: errors.join('; '), code: 'VALIDATION', errors });
    combo.set(data);
    await combo.save();
    res.json(serialize(combo));
  })
);

router.delete(
  '/:id',
  authRequired,
  adminRequired,
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return fail(res, 404, 'COMBO_NOT_FOUND', 'Combo nao encontrado');
    const combo = await Combo.findById(req.params.id);
    if (!combo) return fail(res, 404, 'COMBO_NOT_FOUND', 'Combo nao encontrado');
    await combo.deleteOne();
    res.json({ ok: true });
  })
);

module.exports = router;
