import sqlite3 from 'sqlite3';
import models from '../models/models.js'
const { verbose } = sqlite3;
import path, { resolve } from 'path';
import { rejects } from 'assert';


const dbPath = path.resolve('/app/data/database.sqlite');
const db = new (verbose()).Database(dbPath, (err) => {

  if (err) {
    console.error('error while opening db:', err);
  }
});
db.run("PRAGMA foreign_keys = ON")

export async function insertTournament(backend_id, blockchain_id)
{
	return new Promise((resolve, reject) => {
		const query = `
			INSERT INTO blockchain_tournament (id_backend, id_blockchain)
			VALUES (?, ?) `;
		db.run(
			query, [backend_id, blockchain_id], function (err) {
				if (err) {
					console.error("sth wrong in blockchain_tournament", err);
					reject(err);
				} else {
					resolve(this.lastID)
				}
			}
		);

	});
}

export function getTournamentByBackendId(backend_id) {
	return new Promise((resolve, reject) => {
		const query = `
			SELECT * FROM blockchain_tournament WHERE id_backend = ?`;
		db.get(query, [backend_id], (err, row) => {
			if (err) {
				console.error("Error getting tournament by backend id:", err);
				reject(err);
			} else {
				resolve(row);
			}
		});
	});
}

export function getTournamentByBlockchainId(blockchain_id) {
	return new Promise((resolve, reject) => {
		const query = `
			SELECT * FROM blockchain_tournament WHERE id_blockchain = ?`;
		db.get(query, [blockchain_id], (err, row) => {
			if (err) {
				console.error("Error getting tournament by blockchain id:", err);
				reject(err);
			} else {
				resolve(row);
			}
		});
	});
}
