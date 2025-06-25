import sqlite3 from 'sqlite3';

const { verbose } = sqlite3;
const db = new (verbose()).Database('./data/database.sqlite', (err) => {
  if (err) {
    console.error('Error while opening db:', err);
  } else {
    console.log('DB opened successfully!');
  }
});

// Create users table
const createUserTable = `
  CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    mail TEXT UNIQUE NOT NULL,
    psw TEXT NOT NULL,
    token TEXT,
    wallet TEXT DEFAULT '',
    is_admin INTEGER DEFAULT 0,
    google_id TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

db.run(createUserTable, (err) => {
  if (err) {
    console.error('Error creating user table:', err);
  } else {
    console.log('User table created successfully!');
  }
  
  // Close database connection
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err);
    } else {
      console.log('Database connection closed.');
    }
  });
});
