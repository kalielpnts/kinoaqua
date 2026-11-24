const jwt = require('jsonwebtoken');
const config = require('../config');
const { User } = require('../models');
const asyncHandler = require('../utils/asyncHandler');

function signToken(user) {
  return jwt.sign({ id: String(user._id), role: user.role }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES });
}

async function loadUser(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(header.slice(7), config.JWT_SECRET);
    return await User.findById(payload.id);
  } catch (e) {
    return null;
  }
}

const authRequired = asyncHandler(async (req, res, next) => {
  const user = await loadUser(req);
  if (!user) return res.status(401).json({ error: 'Autenticacao necessaria', code: 'UNAUTHENTICATED' });
  req.user = user;
  next();
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  req.user = await loadUser(req);
  next();
});

function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores', code: 'FORBIDDEN' });
  }
  next();
}

module.exports = { signToken, authRequired, optionalAuth, adminRequired };
