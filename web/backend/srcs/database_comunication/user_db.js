import sqlite3 from 'sqlite3';
import models from '../models/models.js'

const { verbose } = sqlite3;
// MIGLIORAMENTO: Path database relativo per compatibilità multi-ambiente
const db = new (verbose()).Database('./data/database.sqlite', (err) => {
  if (err) {
    console.error('error while opening db:', err);
  } else {
    console.log('DB opened successfully!');
  }
});

// aggiunti gli altri campi alla risorsa user, prima era solo id(comodo ancghe per i test con curl)
export function insertUser(user) {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO user (username, mail, psw, token, wallet, is_admin, google_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    db.run(
      query, // migliorati un po' i check forzando i tipi di dato accettati
      [
        user.username,
        user.mail,
        user.psw,
        user.token || '',
        user.wallet || '', 
        user.is_admin ? 1 : 0,
        user.google_id || '' 
      ],
      function (err) {
        if (err) {
          console.error('Error while adding user:', err);
          reject(err);
        } else {//ritonrna l'oggetto completo
          resolve({ 
            id: this.lastID,
            username: user.username,
            mail: user.mail,
            psw: user.psw,
            token: user.token || '',
            wallet: user.wallet || '',
            is_admin: user.is_admin || false,
            google_id: user.google_id || ''
          });
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