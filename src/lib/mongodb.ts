import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI não encontrada nas variáveis de ambiente');
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI.includes('PROD')) {
  throw new Error('String de conexão não contém o banco PROD');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'PROD'
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;