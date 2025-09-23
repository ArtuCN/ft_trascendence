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