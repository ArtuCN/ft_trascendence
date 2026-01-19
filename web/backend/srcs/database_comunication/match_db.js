import sqlite3 from 'sqlite3';

const { verbose } = sqlite3;
import path, { resolve } from 'path';


const dbPath = path.resolve('/app/data/database.sqlite');
const db = new (verbose()).Database(dbPath, (err) => {

  if (err) {
    console.error('error while opening db:', err);
  }
});
db.run("PRAGMA foreign_keys = ON")


async function insertMatchInDB(id_tournament, number_of_players)
{
      return new Promise((resolve, reject) => {
      
        // Convert 0 to null for non-tournament matches
        const tournamentId = id_tournament === 0 ? null : id_tournament;
        
        const query = `
        INSERT INTO game_match (id_tournament, number_of_players)
        VALUES (?, ?)
        `;
        db.run(
            query,
            [tournamentId, number_of_players],
            function (err)
            {
                if (err) {
                console.error('Error while adding match:', err);
                reject(err);
                } else {
                resolve({ id: this.lastID });
                }
            }
        )
    
    })
}

export async function insertPlayerMatchStats(id_user, id_match, goal_scored, goal_taken)
{
    console.log("Inserting player match stats:", {id_user, id_match, goal_scored, goal_taken});
    return new Promise((resolve, reject) =>
    {
        const query = `
        INSERT INTO player_match_stats (id_user, id_match, goal_scored, goal_taken)
        VALUES (?, ?, ?, ?)
         `;

        db.run(
            query,
            [id_user, id_match, goal_scored, goal_taken],
            function (err)
            {
                if (err) {
                console.error('Error while adding user match stats:', err);
                reject(err);
                } else {
                resolve({ id: this.lastID });
                }
            }
        )
    })
}

async function insertTournament_db(tournament_name, id_winner)
{
    return new Promise((resolve, reject) =>
    {
        const query = `
        INSERT INTO tournament (tournament_name, id_winner)
        VALUES (?, ?) `;

        db.run(
            query,
            [tournament_name, id_winner],
            function (err)
            {
                if (err) {
                console.error('Error while adding tournament:', err);
                reject(err);
                } else {
                resolve({ id: this.lastID });
                }
            }
        )
    })
}

export async function upsertStatsAfterMatch(id_player, goal_scored, goal_taken, tournament_won) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO player_all_time_stats (id_player, goal_scored, goal_taken, tournament_won)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(id_player) DO UPDATE SET
        goal_scored = player_all_time_stats.goal_scored + excluded.goal_scored,
        goal_taken = player_all_time_stats.goal_taken + excluded.goal_taken,
        tournament_won = player_all_time_stats.tournament_won + excluded.tournament_won
    `;

    db.run(query, [id_player, goal_scored, goal_taken, tournament_won], function (err) {
      if (err) {
        console.error("Error while upserting stats:", err);
        reject(err);
      } else {
        resolve({ changes: this.changes });
      }
    });
  });
}

export async function insertTournament(tournament_name, id_winner)
{
  try
  {
    const tournament = await insertTournament_db(tournament_name, id_winner);
    await updateStatsAfterMatch(id_winner, 0, 0, 1);
    return tournament.id;
  }
  catch(error)
  {
    console.log(error);
    throw error;
  }
}

export async function insertMatch(id_tournament, users_ids, users_goal_scored, users_goal_taken)
{
    try
    {   
        const match = await insertMatchInDB(id_tournament, users_ids.length);
    
        if (users_ids.length === undefined)
        {
            try {
                await insertPlayerMatchStats(users_ids, match.id, users_goal_scored, users_goal_taken);
                await upsertStatsAfterMatch(users_ids, users_goal_scored, users_goal_taken, 0);
            } catch (err) {
                console.error(`Error inserting stats for user ${users_ids}:`, err);
                console.warn(`Warning: Could not save stats for user ${users_ids}. User may not exist in database.`);
                console.warn(`Match will still be recorded, but without stats for this player.`);
            }
        }
        else
        {
            for (let i = 0; i < users_ids.length; i++)
            {
                const userId = users_ids[i];          
                const goalsScored = users_goal_scored[i];
                const goalsTaken = users_goal_taken[i];
                try {
                    await insertPlayerMatchStats(userId, match.id, goalsScored, goalsTaken);
                    await upsertStatsAfterMatch(userId, goalsScored, goalsTaken, 0);
                } catch (err) {
                    // If user doesn't exist (FOREIGN KEY constraint), skip this player's stats
                    console.warn(`Warning: Could not save stats for user ${userId}. User may not exist in database.`);
                    console.warn(`Match will still be recorded, but without stats for this player.`);
                }
            }
        }
        return { matchId: match.id };
    }
    catch (error)
    {
        console.error("Error inserting match and stats:", error);
        throw error;
    }
}

export async function getAllMatches()
{
    return new Promise((resolve, reject) => {
        const query = `
        SELECT * FROM game_match
        `;
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error while fetching all matches:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

export async function getMatchById(id)
{
    return new Promise((resolve, reject) => {
        const query = `
        SELECT * FROM game_match WHERE id = ?
        `;
        db.get(query, [id], (err, row) => {
            if (err) {
                console.error('Error while fetching match by id:', err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

export async function getPlayerByMatchId(id_match)
{
    return new Promise((resolve, reject) => {
        const query = `
        SELECT * FROM player_match_stats WHERE id_match = ?
        `;
        db.all(query, [id_match], (err, rows) => {
            if (err) {
                console.error('Error while fetching players by match id:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

export async function getPlayerMatchStats(id_player, id_match)
{
    return new Promise((resolve, reject) => {
        const query = `
        SELECT * FROM player_match_stats WHERE id_user = ? AND id_match = ?
        `;
        db.get(query, [id_player, id_match], (err, row) => {
            if (err) {
                console.error('Error while fetching player match stats:', err);
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}
