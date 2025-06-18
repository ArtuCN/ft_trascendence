import sqlite3 from 'sqlite3';

const { verbose } = sqlite3;
const db = new (verbose()).Database('./data/database.sqlite', (err) => {
  if (err) {
    console.error('error while opening db:', err);
  } else {
    console.log('DB opened successfully!');
  }
});

export function insertUser(name, mail, callback) {
  const query = 'INSERT INTO users (name, mail) VALUES (?, ?)';
  db.run(query, [name, mail], function (err) {
    if (err) {
      console.error('Error while adding user:', err);
      callback(err);
    } else {
      console.log(`User insert with ID ${this.lastID}`);
      callback(null, { id: this.lastID });
    }
  });
}

export function getAllUsers(callback) {
  db.all('SELECT * FROM users', (err, rows) => {
    if (err) {
      console.error('Error during SELECT:', err);
      callback(err);
    } else {
      callback(null, rows);
    }
  });
}
