process.env.FORCE_MEMORY_DB = '1';
process.env.NODE_ENV = 'test';

const { connectDb, ensureIndexes, disconnectDb } = require('./src/db');
const { createApp } = require('./src/app');
const { runSeed } = require('./src/seed');
const { toEmbedUrl } = require('./src/utils/youtube');
const { User, Movie, Combo, Ticket, SeatReservation } = require('./src/models');

let total = 0;
let okCount = 0;
let sectionName = '';
const sections = [];
let base = '';

function section(name) {
  sectionName = name;
  sections.push({ name, total: 0, ok: 0 });
}

function check(name, condition, detail) {
  total++;
  const s = sections[sections.length - 1];
  s.total++;
  if (condition) {
    okCount++;
    s.ok++;
    console.log(`[OK] ${name}`);
  } else {
    console.log(`[FALHA] ${sectionName} :: ${name}${detail !== undefined ? ' -> ' + detail : ''}`);
  }
}

async function api(method, path, { token, body } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }
  return { status: res.status, data };
}

const ADMINS = [
  ['admKaliel@gmail.com', 'KalielADM'],
  ['admComum@gmail.com', 'ComumADM'],
  ['admPrincipal@gmail.com', 'PrincipalADM'],
];
const USERS = [
  ['ponteskaliel@gmail.com', 'Kalielsenha'],
  ['usuario@gmail.com', 'Usuariosenha'],
  ['usuario2@gmail.com', 'Usuario2senha'],
];

async function main() {
  const mode = await connectDb();
  await ensureIndexes();
  const server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;

  // ------------------------------------------------------------ 1. Banco e seed
  section('1. Banco e Seed');
  check('conexao com banco (modo memoria)', mode === 'memory', mode);
  await runSeed();
  await runSeed();
  check('seed idempotente: exatamente 6 usuarios', (await User.countDocuments()) === 6);
  check('seed: 3 administradores', (await User.countDocuments({ role: 'admin' })) === 3);
  check('seed: 3 usuarios comuns', (await User.countDocuments({ role: 'user' })) === 3);
  const seededMovies = await Movie.find();
  check('seed: ao menos 3 filmes', seededMovies.length >= 3, seededMovies.length);
  check('seed: filmes com sala, trailer embed e poltrona quebrada', seededMovies.every((m) => m.room.rows.length > 0 && m.trailerUrl.startsWith('https://www.youtube.com/embed/') && m.room.brokenSeats.length > 0));
  check('seed: ao menos 4 combos', (await Combo.countDocuments()) >= 4);
  const health = await api('GET', '/api/health');
  check('rota de saude responde 200', health.status === 200);

  // ------------------------------------------------------------ 2. Login valido
  section('2. Login valido');
  const tokens = {};
  for (const [email, password] of ADMINS) {
    const r = await api('POST', '/api/auth/login', { body: { email, password } });
    check(`login admin ${email}`, r.status === 200 && r.data.user.role === 'admin' && !!r.data.token, r.status);
    tokens[email] = r.data && r.data.token;
  }
  for (const [email, password] of USERS) {
    const r = await api('POST', '/api/auth/login', { body: { email, password } });
    check(`login usuario ${email}`, r.status === 200 && r.data.user.role === 'user' && !!r.data.token, r.status);
    tokens[email] = r.data && r.data.token;
  }
  const admin = tokens['admKaliel@gmail.com'];
  const user1 = tokens['usuario@gmail.com'];
  const user2 = tokens['usuario2@gmail.com'];

  // ------------------------------------------------------------ 3. Login invalido e cadastro
  section('3. Login invalido e cadastro');
  let r = await api('POST', '/api/auth/login', { body: { email: 'usuario@gmail.com', password: 'errada' } });
  check('senha incorreta bloqueada (401)', r.status === 401, r.status);
  r = await api('POST', '/api/auth/login', { body: { email: 'inexistente@gmail.com', password: 'x' } });
  check('e-mail inexistente bloqueado (401)', r.status === 401, r.status);
  r = await api('POST', '/api/auth/login', { body: {} });
  check('login sem campos retorna 400', r.status === 400, r.status);
  r = await api('POST', '/api/auth/register', { body: { name: 'Teste Novo', email: 'novo.teste@gmail.com', password: 'abc123' } });
  check('cadastro de novo usuario (201, role user)', r.status === 201 && r.data.user.role === 'user', r.status);
  r = await api('POST', '/api/auth/register', { body: { name: 'Teste Novo', email: 'novo.teste@gmail.com', password: 'abc123' } });
  check('cadastro duplicado bloqueado (409)', r.status === 409, r.status);
  r = await api('POST', '/api/auth/register', { body: { name: 'Admin Falso', email: 'admKaliel@gmail.com', password: 'x' } });
  check('cadastro com e-mail de administrador existente bloqueado (409)', r.status === 409, r.status);
  r = await api('POST', '/api/auth/login', { body: { email: 'novo.teste@gmail.com', password: 'abc123' } });
  check('login do usuario recem cadastrado', r.status === 200 && r.data.user.role === 'user', r.status);
  r = await api('GET', '/api/auth/me', { token: user1 });
  check('rota /me retorna o usuario autenticado', r.status === 200 && r.data.user.email === 'usuario@gmail.com', r.status);

  // ------------------------------------------------------------ 4. Filmes pelo ADM
  section('4. Filmes, trailer e salas (ADM)');
  const YT = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  check('conversao watch?v= com parametros', toEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s') === YT);
  check('conversao youtu.be com parametros', toEmbedUrl('https://youtu.be/dQw4w9WgXcQ?si=abc') === YT);
  check('conversao shorts', toEmbedUrl('https://www.youtube.com/shorts/dQw4w9WgXcQ') === YT);
  check('conversao mobile m.youtube.com', toEmbedUrl('https://m.youtube.com/watch?v=dQw4w9WgXcQ') === YT);
  check('link invalido retorna null', toEmbedUrl('https://example.com/video') === null);

  const moviePayload = {
    title: 'Filme de Teste Aqua',
    synopsis: 'Sinopse de teste para validar o cadastro completo.',
    genre: 'Drama',
    rating: '12',
    duration: 110,
    price: 40,
    showtimes: ['18:00', '21:30'],
    posterUrl: 'https://example.com/poster.jpg',
    trailerUrl: 'https://youtu.be/dQw4w9WgXcQ',
    room: {
      name: 'Sala 09 - Teste IMAX',
      technology: 'IMAX',
      rows: 'A-F',
      cols: 8,
      brokenSeats: [{ code: 'C4', reason: 'C4 - Encosto em manutencao' }],
      vipSeats: ['F1', 'F2'],
    },
  };
  r = await api('POST', '/api/movies', { body: moviePayload });
  check('criar filme sem token bloqueado (401)', r.status === 401, r.status);
  r = await api('POST', '/api/movies', { token: user1, body: moviePayload });
  check('criar filme como usuario comum bloqueado (403)', r.status === 403, r.status);
  r = await api('POST', '/api/movies', { token: admin, body: moviePayload });
  check('ADM cria filme (201)', r.status === 201, r.status + ' ' + JSON.stringify(r.data));
  const movie = r.data;
  check('trailer convertido automaticamente para embed', movie && movie.trailerUrl === YT, movie && movie.trailerUrl);
  check('poster salvo', movie && movie.posterUrl === 'https://example.com/poster.jpg');
  check('sala configurada (6 fileiras x 8 colunas, IMAX)', movie && movie.room.rows.length === 6 && movie.room.cols === 8 && movie.room.technology === 'IMAX');
  check('poltrona quebrada C4 com motivo persistida', movie && movie.room.brokenSeats.some((b) => b.code === 'C4' && b.reason.includes('manutencao')));

  r = await api('POST', '/api/movies', { token: admin, body: { ...moviePayload, trailerUrl: 'https://example.com/nao-e-youtube' } });
  check('link de trailer invalido rejeitado (400)', r.status === 400, r.status);
  r = await api('POST', '/api/movies', { token: admin, body: { ...moviePayload, room: { ...moviePayload.room, cols: 0 } } });
  check('sala invalida rejeitada (400)', r.status === 400, r.status);

  r = await api('GET', `/api/movies/${movie.id}/seats?showtime=18:00`);
  const map = r.data;
  check('mapa de poltronas: 48 assentos', map && map.summary.total === 48, map && map.summary.total);
  check('mapa: C4 aparece como broken com motivo', map && map.seats.find((s) => s.code === 'C4').status === 'broken' && map.seats.find((s) => s.code === 'C4').reason.length > 0);
  check('mapa: F1 marcada como VIP', map && map.seats.find((s) => s.code === 'F1').vip === true);

  r = await api('PATCH', `/api/movies/${movie.id}/seats`, { token: admin, body: { seat: 'D2', status: 'broken', reason: 'D2 - Poltrona solta' } });
  check('editor visual: ADM marca D2 como quebrada', r.status === 200 && r.data.room.brokenSeats.some((b) => b.code === 'D2'), r.status);
  r = await api('PATCH', `/api/movies/${movie.id}/seats`, { token: admin, body: { seat: 'F3', status: 'vip' } });
  check('editor visual: ADM marca F3 como VIP', r.status === 200 && r.data.room.vipSeats.includes('F3'), r.status);
  r = await api('PATCH', `/api/movies/${movie.id}/seats`, { token: user1, body: { seat: 'A1', status: 'broken' } });
  check('editor de poltronas bloqueado para usuario comum (403)', r.status === 403, r.status);
  r = await api('PUT', `/api/movies/${movie.id}`, { token: admin, body: { title: 'Filme de Teste Aqua II', price: 42 } });
  check('ADM edita filme (PUT) mantendo demais campos', r.status === 200 && r.data.title === 'Filme de Teste Aqua II' && r.data.price === 42 && r.data.trailerUrl === YT, r.status);
  const PRICE = 42;

  // ------------------------------------------------------------ 5. Compra de ingressos
  section('5. Compra e poltronas');
  const buy = (token, seats, showtime = '18:00', combos = []) =>
    api('POST', '/api/tickets', { token, body: { movieId: movie.id, showtime, seats, combos } });

  r = await buy(undefined, ['A1']);
  check('compra sem login bloqueada (401)', r.status === 401, r.status);
  r = await buy(user1, ['C4']);
  check('compra em poltrona quebrada bloqueada (409 SEAT_BROKEN)', r.status === 409 && r.data.code === 'SEAT_BROKEN', r.status);
  r = await buy(user1, ['D2']);
  check('compra em poltrona marcada via editor bloqueada (409)', r.status === 409 && r.data.code === 'SEAT_BROKEN', r.status);
  r = await buy(user1, ['Z9']);
  check('poltrona inexistente rejeitada (400)', r.status === 400, r.status);
  r = await buy(user1, []);
  check('compra sem poltronas rejeitada (400)', r.status === 400, r.status);
  r = await buy(user1, ['A1'], '03:33');
  check('sessao inexistente rejeitada (400)', r.status === 400, r.status);

  r = await buy(user1, ['A1', 'A2']);
  check('compra valida de A1 e A2 (201)', r.status === 201 && r.data.ticket.seats.length === 2, r.status + ' ' + JSON.stringify(r.data));
  const t1 = r.data && r.data.ticket;
  check('total calculado corretamente', t1 && t1.total === PRICE * 2, t1 && t1.total);
  check('ticket possui codigo unico', t1 && /^KA-[A-Z0-9]{8}$/.test(t1.code), t1 && t1.code);
  check('banco: ticket persistido', !!(await Ticket.findOne({ code: t1.code })));
  check('banco: 2 reservas de poltrona criadas', (await SeatReservation.countDocuments({ ticketCode: t1.code })) === 2);
  r = await api('GET', `/api/movies/${movie.id}/seats?showtime=18:00`);
  check('mapa atualizado: A1 e A2 ocupadas', r.data.seats.find((s) => s.code === 'A1').status === 'occupied' && r.data.seats.find((s) => s.code === 'A2').status === 'occupied');
  r = await buy(user2, ['A1']);
  check('compra em poltrona ja ocupada bloqueada (409 SEAT_OCCUPIED)', r.status === 409 && r.data.code === 'SEAT_OCCUPIED', r.status);
  r = await buy(user2, ['A1'], '21:30');
  check('mesma poltrona em outra sessao permanece disponivel (201)', r.status === 201, r.status);
  r = await buy(user2, ['F1']);
  check('poltrona VIP com preco majorado (x1.5)', r.status === 201 && r.data.ticket.seats[0].price === PRICE * 1.5, r.status + ' ' + JSON.stringify(r.data && r.data.ticket && r.data.ticket.seats));

  const race = await Promise.all([buy(user1, ['B1']), buy(user2, ['B1'])]);
  const statuses = race.map((x) => x.status).sort();
  check('compras simultaneas da mesma poltrona: apenas uma vence', statuses[0] === 201 && statuses[1] === 409, statuses.join(','));
  check('banco: apenas 1 reserva para B1 na sessao', (await SeatReservation.countDocuments({ movie: movie.id, showtime: '18:00', seat: 'B1' })) === 1);

  r = await api('PATCH', `/api/movies/${movie.id}/seats`, { token: admin, body: { seat: 'A1', status: 'broken' } });
  check('ADM nao pode quebrar poltrona ja vendida (409)', r.status === 409, r.status);
  r = await api('GET', '/api/tickets/mine', { token: user1 });
  check('listagem de ingressos do usuario', r.status === 200 && r.data.length >= 1 && r.data.every((t) => t.code), r.status);
  r = await api('GET', `/api/tickets/${t1.id}`, { token: user2 });
  check('usuario nao acessa ingresso de outro (403)', r.status === 403, r.status);

  // ------------------------------------------------------------ 6. Combos e rotas administrativas
  section('6. Combos e rotas administrativas');
  r = await api('GET', '/api/combos');
  check('listagem publica de combos (>= 4)', r.status === 200 && r.data.length >= 4, r.data && r.data.length);
  const comboPayload = { name: 'Combo Teste Aqua', description: 'Combo criado pelos testes', price: 30, category: 'Teste', illustration: 'popcorn' };
  r = await api('POST', '/api/combos', { token: user1, body: comboPayload });
  check('criar combo como usuario comum bloqueado (403)', r.status === 403, r.status);
  r = await api('POST', '/api/combos', { body: comboPayload });
  check('criar combo sem token bloqueado (401)', r.status === 401, r.status);
  r = await api('POST', '/api/combos', { token: admin, body: { ...comboPayload, illustration: 'inexistente' } });
  check('combo com ilustracao invalida rejeitado (400)', r.status === 400, r.status);
  r = await api('POST', '/api/combos', { token: admin, body: comboPayload });
  check('ADM cria combo (201)', r.status === 201 && r.data.name === comboPayload.name, r.status);
  const combo = r.data;
  r = await api('GET', '/api/combos?q=Teste Aqua');
  check('busca de combos em tempo real encontra o novo combo', r.data.some((c) => c.id === combo.id));
  r = await api('PUT', `/api/combos/${combo.id}`, { token: admin, body: { price: 35 } });
  check('ADM edita preco do combo', r.status === 200 && r.data.price === 35, r.status);

  r = await buy(user1, ['E1'], '18:00', [{ comboId: combo.id, quantity: 2 }]);
  check('compra unificada (poltrona + combos) (201)', r.status === 201, r.status + ' ' + JSON.stringify(r.data));
  check('total unificado = ingresso + combos', r.data && r.data.ticket.total === PRICE + 70 && r.data.ticket.combosTotal === 70, r.data && r.data.ticket.total);
  r = await buy(user1, ['E2'], '18:00', [{ comboId: '000000000000000000000000', quantity: 1 }]);
  check('combo inexistente rejeitado e poltrona nao e reservada', r.status === 404 && (await SeatReservation.countDocuments({ movie: movie.id, seat: 'E2' })) === 0, r.status);

  r = await api('GET', '/api/admin/stats', { token: user1 });
  check('estatisticas do ADM bloqueadas para usuario comum (403)', r.status === 403, r.status);
  r = await api('GET', '/api/admin/stats');
  check('estatisticas do ADM sem token (401)', r.status === 401, r.status);
  r = await api('GET', '/api/admin/stats', { token: admin });
  check('ADM acessa indicadores', r.status === 200 && r.data.ticketsSold >= 6 && r.data.moviesActive >= 4 && r.data.combosActive >= 5 && r.data.brokenSeatsTotal >= 5, JSON.stringify(r.data && { s: r.data.ticketsSold, m: r.data.moviesActive, c: r.data.combosActive, b: r.data.brokenSeatsTotal }));
  r = await api('GET', '/api/admin/tickets', { token: user1 });
  check('lista de ingressos do ADM bloqueada para usuario (403)', r.status === 403, r.status);

  r = await api('DELETE', `/api/combos/${combo.id}`, { token: user1 });
  check('excluir combo como usuario bloqueado (403)', r.status === 403, r.status);
  r = await api('DELETE', `/api/combos/${combo.id}`, { token: admin });
  check('ADM exclui combo', r.status === 200, r.status);
  r = await api('GET', '/api/combos');
  check('combo excluido some da listagem', !r.data.some((c) => c.id === combo.id));
  r = await api('DELETE', `/api/movies/${movie.id}`, { token: user1 });
  check('excluir filme como usuario bloqueado (403)', r.status === 403, r.status);
  r = await api('DELETE', `/api/movies/${movie.id}`, { token: admin });
  check('ADM exclui filme', r.status === 200, r.status);
  check('banco: reservas do filme excluido removidas', (await SeatReservation.countDocuments({ movie: movie.id })) === 0);

  await new Promise((resolve) => server.close(resolve));
  await disconnectDb();
}

main()
  .then(() => finish())
  .catch(async (err) => {
    console.log('[FALHA] erro inesperado nos testes -> ' + (err && err.stack ? err.stack.split('\n').slice(0, 4).join(' | ') : err));
    total++;
    sections.push({ name: 'Erro inesperado', total: 1, ok: 0 });
    try {
      await disconnectDb();
    } catch (e) {
      /* ignora */
    }
    finish();
  });

function finish() {
  console.log('');
  for (const s of sections) console.log(`[SECAO] ${s.name}: ${s.ok}/${s.total}`);
  console.log(`TESTES_TOTAL=${total} TESTES_OK=${okCount}`);
  process.exit(okCount === total ? 0 : 1);
}
