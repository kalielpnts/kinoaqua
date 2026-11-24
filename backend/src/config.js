require('dotenv').config({ quiet: true });

const DEFAULT_ADMINS = ['admkaliel@gmail.com', 'admcomum@gmail.com', 'admprincipal@gmail.com'];
const extraAdmins = (process.env.ADMIN_EMAILS || '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

module.exports = {
  PORT: Number(process.env.PORT) || 3001,
  JWT_SECRET: process.env.JWT_SECRET || 'kinoaqua-demo-secret',
  JWT_EXPIRES: '7d',
  CORS_ORIGINS: (process.env.CORS_ORIGINS || '*')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  ADMIN_EMAILS: new Set([...DEFAULT_ADMINS, ...extraAdmins]),
  VIP_MULTIPLIER: 1.5,
  MAX_SEATS_PER_ORDER: 10,
  ROOM_TECHNOLOGIES: ['2D', '3D', 'IMAX', 'Dolby Atmos'],
  COMBO_ILLUSTRATIONS: ['popcorn', 'drinks', 'nachos', 'vip-ticket'],
};
