import { env } from '#config/env';
import { connectDB, disconnectDB } from '#db/index';

import { app } from '#app';

async function main(): Promise<void> {
  await connectDB();

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 API listening on http://localhost:${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = (signal: string): void => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    server.close(() => {
      void disconnectDB().finally(() => process.exit(0));
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((err) => {
  console.error('💥 Failed to start:', err);
  process.exit(1);
});
