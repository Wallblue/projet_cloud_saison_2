import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('./images.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      theme TEXT NOT NULL,
      filename TEXT NOT NULL
    )
  `);
});

export default db;