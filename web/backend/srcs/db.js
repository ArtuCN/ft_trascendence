import sqlite3 from 'sqlite3';

const { verbose } = sqlite3;
const db = new (verbose()).Database('./data/database.sqlite', (err) => {
  if (err) {
    console.error('error while opening db:', err);
  } else {
    console.log('DB opened successfully!');
  }
});
export function insertUser(name, mail, psw) {
  return new Promise((resolve, reject) => {
    const query = 'INSERT INTO user (name, mail, psw) VALUES (?, ?, ?)';
    db.run(query, [name, mail, psw], function (err) {
      if (err) {
        console.error('Error while adding user:', err);
        reject(err);
      } else {
        resolve({ id: this.lastID });
      }
    });
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

