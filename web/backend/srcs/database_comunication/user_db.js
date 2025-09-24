import sqlite3 from 'sqlite3';
import path from 'path';

const { verbose } = sqlite3;

const dbPath = path.resolve('/app/data/database.sqlite');
const db = new (verbose()).Database(dbPath, (err) => {
  if (err) {
    console.error('Error while opening db:', err);
  } else {
    console.log('DB opened successfully!');
  }
});

// Abilita foreign keys
db.run("PRAGMA foreign_keys = ON");

// Crea tabella delle stats se non esiste
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS player_all_time_stats (
      id_player INTEGER PRIMARY KEY,
      goal_scored INTEGER DEFAULT 0,
      goal_taken INTEGER DEFAULT 0,
      tournament_won INTEGER DEFAULT 0,
      FOREIGN KEY (id_player) REFERENCES user(id)
    )
  `);
});

// -----------------------------
// USERS
// -----------------------------
export function insertUser(user) {
  return new Promise((resolve, reject) => {
    const insertUserQuery = `
      INSERT INTO user (username, mail, psw, token, wallet, is_admin, google_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(
      insertUserQuery,
      [
        user.username,
        user.mail,
        user.psw,
        user.token,
        user.wallet,
        user.is_admin ? 1 : 0,
        user.google_id
      ],
      function (err) {
        if (err) {
          console.error('Error while adding user:', err);
          reject(err);
        } else {
          const newUserId = this.lastID;

          const insertStatsQuery = `
            INSERT INTO player_all_time_stats (id_player)
            VALUES (?)
          `;
          db.run(insertStatsQuery, [newUserId], (err2) => {
            if (err2) {
              console.error('Error while creating player stats:', err2);
              reject(err2);
            } else {
              resolve({ id: newUserId });
            }
          });
        }
      }
    );
  });
}

export function getAllUsers() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM user', (err, rows) => {
      if (err) {
        console.error('Error during SELECT:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export function getUserByMail(mail) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM user WHERE mail = ?', [mail], (err, rows) => {
      if (err) {
        console.error('Error during SELECT by mail:', err);
        reject(err);
      } else {
        resolve(rows.length > 0 ? rows[0] : null);
      }
    });
  });
}

export function getUserByUsername(username) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM user WHERE username = ?', [username], (err, rows) => {
      if (err) {
        console.error('Error during SELECT by username:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export function getUserById(id) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM user WHERE id = ?', [id], (err, rows) => {
      if (err) {
        console.error('Error during SELECT by id:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// -----------------------------
// STATS
// -----------------------------
export function getStatsById(id) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM player_all_time_stats WHERE id_player = ?', [id], (err, rows) => {
      if (err) {
        console.error('Error during SELECT by id of stats:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// -----------------------------
// TOKENS
// -----------------------------
export function saveToken(username, token) {
  return new Promise((resolve, reject) => {
    console.log('Attempting to save token for username:', username);
    db.run('UPDATE user SET token = ? WHERE username = ?', [token, username], function (err) {
      if (err) {
        console.error('Error while adding token:', err);
        reject(err);
      } else {
        console.log('Token saved successfully. Rows affected:', this.changes);
        resolve(this.changes);
      }
    });
  });
}

export function removeToken(username) {
  return new Promise((resolve, reject) => {
    db.run('UPDATE user SET token = NULL WHERE username = ?', [username], function (err) {
      if (err) {
        console.error('Error while removing token:', err);
        reject(err);
      } else {
        resolve(this.changes);
      }
    });
  });
}

export function getTokenByUsername(username) {
  return new Promise((resolve, reject) => {
    db.get('SELECT token FROM user WHERE username = ?', [username], (err, row) => {
      if (err) {
        console.error('Error during SELECT by username:', err);
        reject(err);
      } else {
        resolve(row ? row.token : null);
      }
    });
  });
}

export async function tokenExists(username) {
  const token = await getTokenByUsername(username);
  return token !== null && token !== undefined && token !== '';
}

export async function searchByToken(token) {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM user WHERE token = ?', [token], (err, rows) => {
      if (err) {
        console.error('Error during SELECT by token:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// -----------------------------
// GOOGLE USERS
// -----------------------------
export function getUserByGoogleId(googleId) {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM user WHERE google_id = ?', [googleId], (err, row) => {
      if (err) {
        console.error('Error during SELECT by google_id:', err);
        reject(err);
      } else {
        resolve(row || null);
      }
    });
  });
}

export function insertGoogleUser(user) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO user (username, mail, psw, token, wallet, is_admin, google_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      query,
      [
        user.username,
        user.mail,
        '',
        user.token || null,
        user.wallet || '',
        user.is_admin ? 1 : 0,
        user.google_id
      ],
      function (err) {
        if (err) {
          console.error('Error while adding Google user:', err);
          reject(err);
        } else {
          const newUserId = this.lastID;

          const insertStatsQuery = `
            INSERT INTO player_all_time_stats (id_player)
            VALUES (?)
          `;
          db.run(insertStatsQuery, [newUserId], (err2) => {
            if (err2) {
              console.error('Error while creating player stats for Google user:', err2);
              reject(err2);
            } else {
              resolve({ id: newUserId });
            }
          });
        }
      }
    );
  });
}

export async function getAllMatchesOfPlayer(id_player)
{
    return new Promise((resolve, reject) => {
        const query = `
        SELECT * FROM game_match
        WHERE id IN (
            SELECT id_match FROM player_match_stats WHERE id_user = ?
        )
        `;
        db.all(query, [id_player], (err, rows) => {
            if (err) {
                console.error('Error while fetching all matches of player:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}


