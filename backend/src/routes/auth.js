const express = require('express');
const config = require('../config');
const { User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { signToken, authRequired } = require('../middleware/auth');

const router = express.Router();

const publicUser = (u) => ({ id: String(u._id), name: u.name, email: u.email, role: u.role });

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const email = String((req.body && req.body.email) || '').trim().toLowerCase();
    const password = String((req.body && req.body.password) ?? '');
    if (!email || !password) {
      return res.status(400).json({ error: 'Informe e-mail e senha', code: 'MISSING_FIELDS' });
    }
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'E-mail ou senha invalidos', code: 'INVALID_CREDENTIALS' });
    }
    // O perfil e identificado automaticamente pelo e-mail no momento do login
    const role = config.ADMIN_EMAILS.has(email) ? 'admin' : 'user';
    if (user.role !== role) {
      user.role = role;
      await user.save();
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  })
);

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password ?? '');
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Informe nome, e-mail e senha', code: 'MISSING_FIELDS' });
    }
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ error: 'E-mail ja cadastrado', code: 'EMAIL_TAKEN' });
    const user = await User.create({ name, email, password, role: 'user' });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  })
);

router.get('/me', authRequired, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
