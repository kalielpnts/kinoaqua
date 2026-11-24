const express = require('express');
const cors = require('cors');
const config = require('./config');

function isOriginAllowed(origin) {
  if (!origin) return true;
  if (config.CORS_ORIGINS.includes('*')) return true;
  if (config.CORS_ORIGINS.includes(origin)) return true;
  if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  if (/\.app\.github\.dev$/.test(origin)) return true;
  return false;
}

function createApp() {
  const app = express();
  app.use(cors({ origin: (origin, cb) => cb(null, isOriginAllowed(origin)) }));
  app.use(express.json({ limit: '2mb' }));

  app.get('/', (req, res) => res.json({ name: 'KinoAqua API', status: 'ok' }));
  app.get('/api/health', (req, res) => res.json({ name: 'KinoAqua API', status: 'ok' }));

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/movies', require('./routes/movies'));
  app.use('/api/combos', require('./routes/combos'));
  app.use('/api/tickets', require('./routes/tickets'));
  app.use('/api/admin', require('./routes/admin'));

  app.use('/api', (req, res) => res.status(404).json({ error: 'Rota nao encontrada', code: 'NOT_FOUND' }));

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON invalido', code: 'BAD_JSON' });
    if (err.name === 'ValidationError' || err.name === 'CastError') {
      return res.status(400).json({ error: err.message, code: 'VALIDATION' });
    }
    console.error('[erro]', err.message);
    res.status(500).json({ error: 'Erro interno do servidor', code: 'INTERNAL' });
  });

  return app;
}

module.exports = { createApp };
