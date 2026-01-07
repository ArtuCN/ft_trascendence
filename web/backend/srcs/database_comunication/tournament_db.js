import sqlite3 from 'sqlite3';
import models from '../models/models.js'
import {winTournament} from './user_db.js';
const { verbose } = sqlite3;
import path, { resolve } from 'path';
import { rejects } from 'assert';
import { getUserById } from './user_db.js';


const dbPath = path.resolve('/app/data/database.sqlite');
const db = new (verbose()).Database(dbPath, (err) => {

  if (err) {
    console.error('error while opening db:', err);
  }
});
db.run("PRAGMA foreign_keys = ON")

export async function insertTournamentInDB(name)
{
    const stmt = db.prepare("INSERT INTO tournament (tournament_name) VALUES (?)");
    stmt.run(name, function (err) {
        if (err) {
            console.error('Error inserting tournament:', err);
        } else {
            console.log('Tournament inserted with ID:', this.lastID);
        }
    });
    return { id: stmt.lastID };
}

export async function getAllTournaments()
{
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM tournament`;
        db.all(query, [], (err, rows) => {
            if (err) {
                console.error('Error fetching tournaments:', err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

export async function startTournament(id)
{
    return new Promise((resolve, reject) => {
        const query = `
        UPDATE tournament
        SET has_started = true
        WHERE id = ?
        `;
        db.run(
            query,
            [id],
            function (err) {
                if (err) {
                    console.error('Error starting tournament:', err);
                    reject(err);
                } else {
                    resolve({ id, status: 'started' });
                }
            }
        );
    });
}

async function finishTournamentDb(id, id_winner)
{
    return new Promise((resolve, reject) => {
        const query = `
        UPDATE tournament
        SET finished = true, id_winner = ?
        WHERE id = ?
        `;
        db.run(
            query,
            [id_winner, id],
            function (err) {
                if (err) {
                    console.error('Error finishing tournament:', err);
                    reject(err);
                } else {
                    resolve({ id, status: 'finished', id_winner });
                }
            }
        );
    });
}

export async function finishTournament(id, id_winner)
{
  try {
      await finishTournamentDb(id, id_winner);
      await winTournament(id_winner);
      return { id, status: 'finished', id_winner };
  } catch (error) {
      console.error('Error finishing tournament:', error);
      throw error;
  }
}

export function getTournament(tournament_id)
{
	return new Promise((resolve, reject) => {
		db.all('SELECT * FROM tournament WHERE id = ?', [tournament_id], (err, rows) => {
			if (err) {
				console.error('error:', err);
				reject(err);
			} else {
				resolve(rows);
			}
		})
	});
}

export function getMatchesOfTournament(tournament_id)
{
	return new Promise((resolve, reject) => {
		db.all('SELECT * FROM game_match WHERE id_tournament = ?', [tournament_id], (err, rows) => {
			if (err) {
				console.error('error:', err);
				reject(err);
			} else {
				resolve(rows);
			}
		})
	})
}

export function getStatsOfMatch(match_id)
{
	return new Promise((resolve, reject) => {
		db.all('SELECT * FROM player_match_stats WHERE id_match = ?', [match_id], (err, rows) => {
			if (err) {
				console.error('error:', err);
				reject(err);
			} else {
				resolve(rows);
			}
		})
	})
}

export async function getUsersOfMatch(match_id)
{
	try {
		const match_stats = await getStatsOfMatch(match_id);
		const user_ids = []
		for (let i = 0; i < match_stats.length; i++) {
			user_ids.push(match_stats[i].id_user);
		}
		const users = []
		for (let i = 0; i< user_ids.length; i++) {
			let tmp_user = await getUserById(user_ids[i])
			users.push(tmp_user)
		}
		return users
	} catch (error) {
		console.error('error:', error);
	}
}
	
function padTo8(arr, fill = 0) {
	const padded = [...arr];
	while (padded.length < 8)
		padded.push(fill);
	return padded.slice(0, 8);
}


export async function getTournamentDataForBlockchain(tournament_id)
{
	try {
		// get tournament
		const tournament = await getTournament(tournament_id);

		// get matches for the tournament and get match stats
		// get users for all matches
		const matches = await getMatchesOfTournament(tournament_id);
		const matchResults = await Promise.all(
			matches.map(async (match) => {
				const [stats, users] = await Promise.all([
					getStatsOfMatch(match.id),
					getUsersOfMatch(match.id),
				]);

				return { stats, users };
			})
		);

		//flatten and filter results
		const allStats = [];
		const allUsers = [];
		for (const result of matchResults) {
			allStats.push(...result.stats);
			allUsers.push(...result.users);
		}

		const uniqueStats = [];
		const uniqueUsers = [];
		const seenMatchIds = new Set();
		const seenUsers = new Set();

		for (const stat of allStats) {
			if (!seenMatchIds.has(stat.match_id)) {
				seenMatchIds.add(stat.match_id);
				uniqueStats.push(stat);
			}
		}
		for (const user of allUsers) {
			if (!seenUsers.has(user.id)) {
				seenUsers.add(user.id);
				uniqueUsers.push(user);
			}
		}

		// get scores for matches = all goals scored - all goals taken
		const winner_id = tournament.id_winner;
		const winner_name = uniqueUsers.find(user => user.id === winner_id).username;
		const user_scores = [];
		for (const user of uniqueUsers) {
			let total_score = uniqueStats.reduce((acc, stat) => {
				if (stat.id_user == user.id) {
					acc += Number(stat.goal_scored);
					acc -= Number(stat.goal_taken);
				}
				return acc;
			}, 0);
			const score_obj = {
				"id": user.id,
				"score": total_score >= 0 ? total_score : 0,
			};
			user_scores.push(score_obj);
		}


		//organize data
		const user_ids = uniqueUsers.map(user => user.id).sort((a,b) => a - b);
		const scoreByUserId = new Map(
			user_scores.map(score => [Number(score.id), score.score])
		);
		const userScores_sorted = user_ids.map(
			id => scoreByUserId.get(id) ?? 0
		);

		const user_ids_8     = padTo8(user_ids);
		const user_scores_8  = padTo8(user_scores_sorted);
		const winner_ids_8   = padTo8([Number(winner_id)]);
		const winner_name_str = winner_name;

		return {
			"user_ids": user_ids_8,
			"user_scores": user_scores_8,
			"winner_ids": winner_ids_8,
			"winner_names": winner_name_str,
			"tournament_id": Number(tournament_id)
		}
	} catch (error) {
		console.error('Error getting tournament data for blockchain for tournament id: ', tournament_id, ', error:', error);
		throw error;
	}
}
