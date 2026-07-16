import mongoose from 'mongoose';

import { env } from '#config/env';

export async function connectDB(): Promise<void> {
  mongoose.set('strictQuery', true);

  await mongoose.connect(env.MONGO_URI);
  console.log('✅ MongoDB connected');
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  console.log('🔌 MongoDB disconnected');
}
