import sqlite3 from 'sqlite3';
import path from 'path';

const { verbose } = sqlite3;

const dbPath = path.resolve('/app/data/database.sqlite');
const db = new (verbose()).Database(dbPath, (err) => {
  if (err) {
    console.error('Error while opening db:', err);
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
              resolve({ 
                id: newUserId,
                username: user.username,
                mail: user.mail
              });
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
        resolve(rows.length > 0 ? rows[0] : null);
      }
    });
  });
}

// -----------------------------
// STATS
// -----------------------------
export function getStatsById(id) {
  return new Promise((resolve, reject) => {
    // Get base stats from player_all_time_stats
    const statsQuery = 'SELECT * FROM player_all_time_stats WHERE id_player = ?';
    
    db.get(statsQuery, [id], (err, statsRow) => {
      if (err) {
        console.error('Error during SELECT by id of stats:', err);
        reject(err);
        return;
      }
      
      // Get matches count
      const matchesQuery = 'SELECT COUNT(*) as count FROM player_match_stats WHERE id_user = ?';
      
      db.get(matchesQuery, [id], (err2, matchesRow) => {
        if (err2) {
          console.error('Error counting matches:', err2);
          // Return basic stats even if count fails
          resolve(statsRow ? [statsRow] : []);
          return;
        }
        
        // Get wins count (goal_scored > goal_taken)
        const winsQuery = 'SELECT COUNT(*) as count FROM player_match_stats WHERE id_user = ? AND goal_scored > goal_taken';
        
        db.get(winsQuery, [id], (err3, winsRow) => {
          if (err3) {
            console.error('Error counting wins:', err3);
            resolve(statsRow ? [statsRow] : []);
            return;
          }
          
          // Get losses count (goal_scored < goal_taken)
          const lossesQuery = 'SELECT COUNT(*) as count FROM player_match_stats WHERE id_user = ? AND goal_scored < goal_taken';
          
          db.get(lossesQuery, [id], (err4, lossesRow) => {
            if (err4) {
              console.error('Error counting losses:', err4);
              resolve(statsRow ? [statsRow] : []);
              return;
            }
            
            // Combine all stats
            const combinedStats = {
              id_player: id,
              goal_scored: statsRow?.goal_scored || 0,
              goal_taken: statsRow?.goal_taken || 0,
              tournament_won: statsRow?.tournament_won || 0,
              matches_played: matchesRow?.count || 0,
              matches_won: winsRow?.count || 0,
              matches_lost: lossesRow?.count || 0
            };
            
            resolve([combinedStats]);
          });
        });
      });
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


export async function winTournament(id_player)
{
    return new Promise((resolve, reject) => {
        const query = `
        UPDATE player_all_time_stats
        SET tournament_won = tournament_won + 1
        WHERE id_player = ?
        `;
        db.run(query, [id_player], function (err) {
            if (err) {
                console.error('Error while updating tournament wins:', err);
                reject(err);
            } else {
                resolve({ id_player, status: 'tournament win updated' });
            }
        });
    });
}

export async function getAllPlayerStats() {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT 
            s.id_player,
            u.username,
            s.goal_scored,
            s.goal_taken,
            s.tournament_won,
            (SELECT COUNT(*) FROM player_match_stats WHERE id_user = s.id_player) as matches_played,
            (SELECT COUNT(*) FROM player_match_stats WHERE id_user = s.id_player AND goal_scored > goal_taken) as matches_won,
            (SELECT COUNT(*) FROM player_match_stats WHERE id_user = s.id_player AND goal_scored < goal_taken) as matches_lost
        FROM player_all_time_stats s
        JOIN user u ON s.id_player = u.id
        ORDER BY s.tournament_won DESC, matches_won DESC, s.goal_scored DESC
        `;
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error while fetching all player stats:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

export async function updateUserLastActive(userId, timestamp) {
  return new Promise((resolve, reject) => {
    const query = `UPDATE user SET last_active = ? WHERE id = ?`;
    db.run(query, [timestamp, userId], function (err) {
      if (err) 
		return reject(err);
      resolve(this.changes);
    });
  });
}

export async function getUserLastActive(userId) {
	return new Promise((resolve, reject) => {
		const query = `select last_active FROM user WHERE id = ?`;
		db.get(query, [userId], function (err) {
			if (err)
				return reject(err);
			resolve(row.last_active);
		});
	});
}

export async function uploadAvatar_db(userId, avatarData) {
  return new Promise((resolve, reject) => {
    const query = `UPDATE user SET avatar = ? WHERE id = ?`;
    db.run(query, [avatarData, userId], function (err) {
      if (err) {
        console.error('Error while uploading avatar:', err);
        reject(err);
      } else {
        resolve({ id: userId, status: 'avatar updated' });
      }
    });
  });
}

export async function getAvatar_db(userId) {
  return new Promise((resolve, reject) => {
    const query = `SELECT avatar FROM user WHERE id = ?`;
    db.get(query, [userId], (err, row) => {
      if (err) {
        console.error('Error while fetching avatar:', err);
        reject(err);
      } else {
        resolve(row ? row.avatar : null);
      }
    });
  });
}

// Update user profile (username and/or password)
export async function updateUserProfile(userId, updates) {
  return new Promise((resolve, reject) => {
    const fields = [];
    const values = [];

    if (updates.username !== undefined) {
      fields.push('username = ?');
      values.push(updates.username);
    }

    if (updates.psw !== undefined) {
      fields.push('psw = ?');
      values.push(updates.psw);
    }

    if (fields.length === 0) {
      return reject(new Error('No fields to update'));
    }

    values.push(userId);
    const query = `UPDATE user SET ${fields.join(', ')} WHERE id = ?`;

    db.run(query, values, function (err) {
      if (err) {
        console.error('Error while updating user profile:', err);
        reject(err);
      } else {
        resolve({ id: userId, changes: this.changes });
      }
    });
  });
}