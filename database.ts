import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

pool.on('error', (err) => console.error('Erreur pool PostgreSQL:', err));

pool.query(`
  CREATE TABLE IF NOT EXISTS images (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    theme VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    validated BOOLEAN DEFAULT NULL
  )
`).then(() => console.log('Table images créée ou existe déjà'))
  .catch(err => console.error('Erreur création table:', err));

export default pool;