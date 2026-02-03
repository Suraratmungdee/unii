import db from 'knex';
import dotenv from 'dotenv';

dotenv.config();

export const knex = db({
  client: 'postgresql',
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  },
  migrations: {
    directory: './src/database/migrations',
    extension: 'ts',
  }
});
