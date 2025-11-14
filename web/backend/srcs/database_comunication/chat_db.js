import sqlite3 from 'sqlite3';
import models from '../models/models.js'
const { verbose } = sqlite3;
import path, { resolve } from 'path';

const dbPath = path.resolve('/app/data/database.sqlite');
const db = new (verbose()).Database(dbPath, (err) => {

  if (err) {
    console.error('error while opening db:', err);
  }
});
db.run("PRAGMA foreign_keys = ON")


export async function add_chat_message_db(message) {
    return new Promise((resolve, reject) =>
    {
        const query = `
        INSERT INTO chat_message (id_sender, id_receiver, message)
        VALUES (?,?,?)
        `;
        db.run(
            query,
            [message.id_sender, message.id_receiver, message.message],
            function (err)
            {
                if (err) {
                console.error('Error while adding chat message:', err);
                reject(err);
                } else {
                resolve({ id: this.lastID });
                }
            }
        )
    })
}

export async function get_chat_messages_db(id1, id2) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT * FROM chat_message
        WHERE (id_sender = ? AND id_receiver = ?)
           OR (id_sender = ? AND id_receiver = ?)
        ORDER BY time_stamp ASC
        `;
        db.all(query, [id1, id2, id2, id1], (err, rows) => {
            if (err) {
                console.error('Error fetching chat messages:', err);
                return reject(err);
            }
            const messages = rows.map(row => new ChatMessage({
                id_sender: row.id_sender,
                id_receiver: row.id_receiver,
                message: row.message,
                time_stamp: row.time_stamp
            }));
            resolve(messages);
        });
    });
}