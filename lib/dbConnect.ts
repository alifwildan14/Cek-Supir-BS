// lib/dbConnect.ts
import mongoose from 'mongoose';

declare global {
  // Menggunakan 'let' untuk memenuhi aturan ESLint 'no-var'.
  // Baris eslint-disable-next-line telah dihapus karena tidak lagi diperlukan.
  let mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Harap definisikan variabel lingkungan MONGODB_URI di dalam file .env.local'
  );
}

let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  if (!cached.conn) {
    throw new Error('Koneksi MongoDB tidak berhasil dibuat.');
  }
  return cached.conn;
}

export default dbConnect;
