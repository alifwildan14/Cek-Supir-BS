// lib/dbConnect.ts
import mongoose from 'mongoose';

// Define the shape of the mongoose cache on the global object for TypeScript.
// This tells TypeScript that our global object might have a 'mongoose' property
// with a specific structure.
declare global {
  // Using 'let' instead of 'var' to satisfy the 'no-var' ESLint rule.
  // eslint-disable-next-line no-unused-vars
  let mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

// Create a specifically typed version of the global object.
// This helps in safely accessing our custom 'mongoose' property on the global scope.
// 'globalThis' is a more modern and standard way to refer to the global object.
const globalWithMongoose = globalThis as typeof globalThis & {
  mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = globalWithMongoose.mongoose;

if (!cached) {
  // If the cache doesn't exist, initialize it.
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  // If a connection already exists, return it.
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection promise doesn't exist, create one.
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose's buffering mechanism
      // useNewUrlParser: true, // Deprecated, no longer needed in recent Mongoose versions
      // useUnifiedTopology: true, // Deprecated, no longer needed
    };

    console.log('Attempting to connect to MongoDB...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log('MongoDB connected successfully!');
      return mongooseInstance;
    }).catch(err => {
        console.error('MongoDB connection error during initial connect:', err);
        cached.promise = null; // Reset promise on error so a new attempt can be made
        throw err; // Re-throw error to be caught by the caller
    });
  }

  try {
    // Wait for the connection promise to resolve and store the connection.
    cached.conn = await cached.promise;
  } catch (e) {
    // If the connection fails, nullify the promise to allow a new attempt.
    cached.promise = null;
    console.error('Failed to establish MongoDB connection:', e);
    throw e; // Re-throw the error to be handled by the caller
  }

  // Return the established connection.
  if (!cached.conn) {
    // This should ideally not be reached if the promise resolved successfully.
    throw new Error('MongoDB connection was not established after promise resolution.');
  }
  return cached.conn;
}

export default dbConnect;
