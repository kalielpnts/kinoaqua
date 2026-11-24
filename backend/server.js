const config = require('./src/config');
const { connectDb, ensureIndexes } = require('./src/db');
const { createApp } = require('./src/app');
const { runSeed } = require('./src/seed');

async function main() {
  const mode = await connectDb();
  await ensureIndexes();
  const seed = await runSeed();
  const app = createApp();
  app.listen(config.PORT, '0.0.0.0', () => {
    console.log(`[KinoAqua] API em http://localhost:${config.PORT} | banco: ${mode}`);
    console.log(`[KinoAqua] seed: ${seed.usersCreated} usuarios, ${seed.moviesCreated} filmes, ${seed.combosCreated} combos criados`);
  });
}

main().catch((err) => {
  console.error('[KinoAqua] falha ao iniciar:', err.message);
  process.exit(1);
});
