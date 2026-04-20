import { Pool } from 'pg';
import configPromise from './config';

async function createPool() {
  const config = await configPromise;
  const pool = new Pool({ connectionString: config.DATABASE_URL });

  pool.on('error', (err) => console.error('Erreur pool PostgreSQL:', err));

  await pool.query(`
    CREATE TABLE IF NOT EXISTS images (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      theme VARCHAR(255) NOT NULL,
      filename VARCHAR(255) NOT NULL,
      validated BOOLEAN DEFAULT NULL
    )
  `);
  console.log('Table images créée ou existe déjà');
  return pool;
}

export default createPool();
