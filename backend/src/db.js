const mongoose = require('mongoose');

let memServer = null;

async function connectDb() {
  let uri = process.env.MONGO_URI;
  let mode = 'atlas/externo';
  if (!uri || process.env.FORCE_MEMORY_DB === '1') {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memServer = await MongoMemoryServer.create({ instance: { launchTimeout: 30000 } });
    uri = memServer.getUri('kinoaqua');
    mode = 'memory';
  }
  await mongoose.connect(uri);
  return mode;
}

async function ensureIndexes() {
  const models = require('./models');
  await Promise.all(Object.values(models).map((m) => m.init()));
}

async function disconnectDb() {
  await mongoose.disconnect();
  if (memServer) {
    await memServer.stop();
    memServer = null;
  }
}

module.exports = { connectDb, ensureIndexes, disconnectDb };
