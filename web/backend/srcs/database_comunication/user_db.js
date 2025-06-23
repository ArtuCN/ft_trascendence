import sqlite3 from 'sqlite3';
import models from '../models/models.js'

const { verbose } = sqlite3;
const db = new (verbose()).Database('./data/database.sqlite', (err) => {
  if (err) {
    console.error('error while opening db:', err);
  } else {
    console.log('DB opened successfully!');
  }
});
export function insertUser(user) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO user (username, mail, psw, token, wallet, is_admin, google_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(
      query,
      [
        user.username,
        user.mail,
        user.psw,
        user.token,
        user.wallet,
        user.is_admin ? 1 : 0,
        user.google_id
      ],
      function (err) {
        if (err) {
          console.error('Error while adding user:', err);
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      }
    );
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


export function getUserByMail(mail)
{
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM user WHERE mail = ?', [mail], (err, rows) => {
      if (err) {
        console.error('Error during SELECT by mail:', err);
        reject(err);
      } else {
        if (rows.length === 0) {
          resolve(null);
        } else {
          resolve(rows[0]);
        }
      }
    });
  });
}


export function getUserByUsername(username)
{
  return new Promise((resolve, reject)=> {
    db.all('SELECT * FROM user WHERE username = ?', [username], (err, rows) => {
      if (err) {
        console.error('Error during SELECT by username:', err);
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}