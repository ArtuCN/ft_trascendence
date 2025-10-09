import sqlite3 from 'sqlite3';
import models from '../models/models.js'
import {winTournament} from './user_db.js';
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