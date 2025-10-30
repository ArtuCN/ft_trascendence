import sqlite3 from 'sqlite3';


const { verbose } = sqlite3;
import path from 'path';



const dbPath = path.resolve('/app/data/database.sqlite');
const db = new (verbose()).Database(dbPath, (err) => {

  if (err) {
    console.error('error while opening db:', err);
  }
});
db.run("PRAGMA foreign_keys = ON")

export async function get_blocked_user(userId) {
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM blocked WHERE id_user_1 = ?", [userId], (err, rows) => {
            if (err) {
                console.error('Error fetching blocked users:', err);
                return reject(err);
            }
            resolve(rows);
        });
    });
}
export async function add_blocked_user(userId, blockedId) {
    return new Promise((resolve, reject) => {
        const query = `
        INSERT INTO blocked (id_user_1, id_blocked)
        VALUES (?,?)
        `;
         db.run(
            query,
            [userId, blockedId],
            function (err)
            {
                if (err) {
                console.error('Error while adding blocked user:', err);
                reject(err);
                } else {
                resolve({ id: this.lastID });
                }
            }
        )
    })
}