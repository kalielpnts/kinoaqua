const { User, Movie, Combo } = require('./models');
const { toEmbedUrl } = require('./utils/youtube');

const SEED_USERS = [
  { name: 'Kaliel Admin', email: 'admKaliel@gmail.com', password: 'KalielADM', role: 'admin' },
  { name: 'Admin Comum', email: 'admComum@gmail.com', password: 'ComumADM', role: 'admin' },
  { name: 'Admin Principal', email: 'admPrincipal@gmail.com', password: 'PrincipalADM', role: 'admin' },
  { name: 'Kaliel Pontes', email: 'ponteskaliel@gmail.com', password: 'Kalielsenha', role: 'user' },
  { name: 'Usuario Um', email: 'usuario@gmail.com', password: 'Usuariosenha', role: 'user' },
  { name: 'Usuario Dois', email: 'usuario2@gmail.com', password: 'Usuario2senha', role: 'user' },
];

const SEED_MOVIES = [
  {
    title: 'Interestelar',
    synopsis:
      'Um grupo de exploradores atravessa um portal espacial em busca de um novo lar para a humanidade, enfrentando o tempo, a gravidade e escolhas impossiveis.',
    genre: 'Ficcao Cientifica',
    rating: '10',
    duration: 169,
    price: 32,
    showtimes: ['14:00', '17:30', '21:00'],
    posterUrl: '',
    trailer: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    room: {
      name: 'Sala 01 - Aqua IMAX',
      technology: 'IMAX',
      rows: 'A-F',
      cols: 8,
      brokenSeats: [{ code: 'C4', reason: 'C4 - Encosto em manutencao' }],
      vipSeats: ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8'],
    },
  },
  {
    title: 'Blade Runner 2049',
    synopsis:
      'Um cacador de androides descobre um segredo capaz de desestabilizar a ordem da sociedade e parte em busca de um antigo cacador desaparecido ha decadas.',
    genre: 'Ficcao Cientifica',
    rating: '16',
    duration: 164,
    price: 28,
    showtimes: ['15:30', '19:00', '22:15'],
    posterUrl: '',
    trailer: 'https://youtu.be/gCcx85zbxz4',
    room: {
      name: 'Sala 02 - Dolby Atmos',
      technology: 'Dolby Atmos',
      rows: 'A-E',
      cols: 10,
      brokenSeats: [{ code: 'B7', reason: 'B7 - Mecanismo de reclinacao com defeito' }],
      vipSeats: ['E4', 'E5', 'E6', 'E7'],
    },
  },
  {
    title: 'Duna',
    synopsis:
      'Um jovem herdeiro viaja ao planeta deserto mais perigoso do universo para garantir o futuro de sua familia e de seu povo, disputando o recurso mais valioso da galaxia.',
    genre: 'Aventura',
    rating: '14',
    duration: 155,
    price: 30,
    showtimes: ['13:30', '16:45', '20:00'],
    posterUrl: '',
    trailer: 'https://www.youtube.com/watch?v=n9xhJrPXop4',
    room: {
      name: 'Sala 03 - Aether 3D',
      technology: '3D',
      rows: 'A-D',
      cols: 8,
      brokenSeats: [{ code: 'D8', reason: 'D8 - Poltrona em reparo' }],
      vipSeats: ['D3', 'D4', 'D5', 'D6'],
    },
  },
];

const SEED_COMBOS = [
  {
    name: 'Combo Pipoca Geometrica',
    description: 'Balde grande de pipoca salgada com refil na metade da sessao.',
    price: 24.9,
    category: 'Pipoca',
    illustration: 'popcorn',
  },
  {
    name: 'Copo Duplo e Canudo',
    description: 'Dois refrigerantes de 500 ml com gelo e canudo biodegradavel.',
    price: 19.9,
    category: 'Bebidas',
    illustration: 'drinks',
  },
  {
    name: 'Combo Nachos Minimalista',
    description: 'Nachos crocantes com queijo cheddar e molho de tomate artesanal.',
    price: 22.9,
    category: 'Salgados',
    illustration: 'nachos',
  },
  {
    name: 'Combo Ingresso VIP Metalico',
    description: 'Pipoca grande, duas bebidas e acesso ao lounge VIP antes da sessao.',
    price: 49.9,
    category: 'VIP',
    illustration: 'vip-ticket',
  },
];

async function runSeed() {
  let usersCreated = 0;
  for (const u of SEED_USERS) {
    const email = u.email.toLowerCase();
    const exists = await User.findOne({ email });
    if (!exists) {
      await User.create({ ...u, email });
      usersCreated++;
    } else if (exists.role !== u.role) {
      exists.role = u.role;
      await exists.save();
    }
  }

  let moviesCreated = 0;
  if ((await Movie.countDocuments()) === 0) {
    for (const m of SEED_MOVIES) {
      const { trailer, ...rest } = m;
      const { normalizeRoom } = require('./utils/seats');
      const { room } = normalizeRoom(m.room);
      await Movie.create({ ...rest, room, trailerUrl: toEmbedUrl(trailer), trailerSourceUrl: trailer });
      moviesCreated++;
    }
  }

  let combosCreated = 0;
  if ((await Combo.countDocuments()) === 0) {
    for (const c of SEED_COMBOS) {
      await Combo.create(c);
      combosCreated++;
    }
  }

  return { usersCreated, moviesCreated, combosCreated };
}

module.exports = { runSeed, SEED_USERS };
