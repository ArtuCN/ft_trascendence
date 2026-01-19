import sqlite3 from 'sqlite3';

const { verbose } = sqlite3;
const db = new (verbose()).Database('./data/database.sqlite', (err) => {
  if (err) {
    console.error('Error while opening db:', err);
  }
});

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON");

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
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_active DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;

// Create tournament table
const createTournamentTable = `
  CREATE TABLE IF NOT EXISTS tournament (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tournament_name TEXT NOT NULL,
    has_started INTEGER DEFAULT 0,
    finished INTEGER DEFAULT 0,
    id_winner INTEGER,
    FOREIGN KEY (id_winner) REFERENCES user(id)
  )
`;

// Create game_match table
const createGameMatchTable = `
  CREATE TABLE IF NOT EXISTS game_match (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_tournament INTEGER,
    time_stamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    number_of_players INTEGER NOT NULL,
    FOREIGN KEY (id_tournament) REFERENCES tournament(id)
  )
`;

// Create player_match_stats table
const createPlayerMatchStatsTable = `
  CREATE TABLE IF NOT EXISTS player_match_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user INTEGER NOT NULL,
    id_match INTEGER NOT NULL,
    goal_scored INTEGER DEFAULT 0,
    goal_taken INTEGER DEFAULT 0,
    FOREIGN KEY (id_user) REFERENCES user(id),
    FOREIGN KEY (id_match) REFERENCES game_match(id)
  )
`;

// Create player_all_time_stats table
const createPlayerAllTimeStatsTable = `
  CREATE TABLE IF NOT EXISTS player_all_time_stats (
    id_player INTEGER PRIMARY KEY,
    goal_scored INTEGER DEFAULT 0,
    goal_taken INTEGER DEFAULT 0,
    tournament_won INTEGER DEFAULT 0,
    FOREIGN KEY (id_player) REFERENCES user(id)
  )
`;

// Create friendship table
const createFriendshipTable = `
  CREATE TABLE IF NOT EXISTS friendship (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_user_1 INTEGER NOT NULL,
    id_user_2 INTEGER NOT NULL,
    FOREIGN KEY (id_user_1) REFERENCES user(id),
    FOREIGN KEY (id_user_2) REFERENCES user(id)
  )
`;

// Execute all table creations
const tables = [
  { name: 'user', query: createUserTable },
  { name: 'tournament', query: createTournamentTable },
  { name: 'game_match', query: createGameMatchTable },
  { name: 'player_match_stats', query: createPlayerMatchStatsTable },
  { name: 'player_all_time_stats', query: createPlayerAllTimeStatsTable },
  { name: 'friendship', query: createFriendshipTable }
];

// Use promises to ensure proper completion
const createTablePromises = tables.map(table => {
  return new Promise((resolve, reject) => {
    db.run(table.query, (err) => {
      if (err) {
        console.error(`Error creating ${table.name} table:`, err);
        reject(err);
      } else {
        console.log(`${table.name} table created successfully!`);
        resolve();
      }
    });
  });
});

// Wait for all tables to be created before closing
Promise.all(createTablePromises)
  .then(() => {
    console.log('All tables created successfully!');
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
        process.exit(1);
      } else {
        console.log('Database initialization completed. Connection closed.');
        process.exit(0);
      }
    });
  })
  .catch(err => {
    console.error('Error during table creation:', err);
    db.close();
    process.exit(1);
  });
