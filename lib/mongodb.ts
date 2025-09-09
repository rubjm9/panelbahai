import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

// During static export / build on platforms like Vercel, you may not want to
// attempt a DB connection (the build machine may not have network access to
// your Atlas cluster). To allow the build to proceed, set
// DISABLE_DB_DURING_BUILD=true in the build environment and dbConnect will
// short-circuit and return a noop object.
const DISABLE_DB_DURING_BUILD = process.env.DISABLE_DB_DURING_BUILD === 'true';

if (!MONGODB_URI && !DISABLE_DB_DURING_BUILD) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local or set DISABLE_DB_DURING_BUILD=true for builds'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (DISABLE_DB_DURING_BUILD) {
    // Return a lightweight noop connection object to avoid runtime DB usage
    // during build/export. Callers should handle empty results accordingly.
    // We keep the shape minimal.
    // eslint-disable-next-line no-console
    console.warn('DB connection disabled for build (DISABLE_DB_DURING_BUILD=true)')
    return { connected: false } as any;
  }
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
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

export default dbConnect;
