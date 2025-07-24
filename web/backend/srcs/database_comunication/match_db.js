import sqlite3 from 'sqlite3';
import models from '../models/models.js'

const { verbose } = sqlite3;
import path, { resolve } from 'path';
import { rejects } from 'assert';


const dbPath = path.resolve('/app/data/database.sqlite');
const db = new (verbose()).Database(dbPath, (err) => {

  if (err) {
    console.error('error while opening db:', err);
  } else {
    console.log('DB opened successfully!');
  }
});
db.run("PRAGMA foreign_keys = ON")


async function insertMatchInDB(id_tournament, number_of_players)
{
      return new Promise((resolve, reject) => {
      
        const query = `
        INSERT INTO game_match (id_tournament, number_of_players)
        VALUES (?, ?)
        `;
        db.run(
            query,
            [id_tournament, number_of_players],
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
// result = insertMatch()
// result.id per ottenere id
async function insertPlayerMatchStats(id_user, id_match, goal_scored, goal_taken)
{
    return new Promise((resolve, reject) =>
    {
        const query = `
        INSERT INTO player_match_stats (id_user, id_match, goal_scored, goal_taken
        VALUES (?, ?, ?, ?) `;

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

export async function insertTournament(tournament_name, active, finished)
{
    return new Promise((resolve, reject) =>
    {
        const query = `
        INSERT INTO tournament (tournament_name, active, finished)
        VALUES (?, ?, ?) `;

        db.run(
            query,
            [tournament_name, active, finished],
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

async function updateStatsAfterMatch(id_player, goal_scored, goal_taken, tournament_won)
{
    return new Promise((resolve, reject) => {
    const query = `
      UPDATE player_all_time_stats
      SET 
        goal_scored = goal_scored + ?,
        goal_taken = goal_taken + ?,
        tournament_won = tournament_won + ?
      WHERE id_player = ?
    `;

    db.run(query, [goal_scored, goal_taken, tournament_won, id_player], function(err) {
      if (err) {
        console.error('Error while updating stats:', err);
        reject(err);
      } else {
        resolve({ changes: this.changes });
      }
    });
  });
}

export async function insertMatch(id_tournament, users_ids, users_goal_scored, users_goal_taken)
{
    try
    {
        const match = await insertMatchInDB(id_tournament, users_ids.length);
    
        for (let i = 0; i < users_ids.length; i++)
        {
            const userId = users_ids[i];          
            const goalsScored = users_goal_scored[i];
            const goalsTaken = users_goal_taken[i];
            await insertPlayerMatchStats(userId, match.id, goalsScored, goalsTaken);
            await updateStatsAfterMatch(userId, goalsScored, goalsTaken, 0);
        }
        return { matchId: match.id };
    }
    catch (error)
    {
        console.error("Error inserting match and stats:", error);
        throw error;
    }
}