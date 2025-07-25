import sqlite3 from 'sqlite3';
import models from '../models/models.js'

const { verbose } = sqlite3;
import path, { resolve } from 'path';
import { rejects } from 'assert';
import { getUserById } from './user_db.js';
import { error } from 'console';


const dbPath = path.resolve('/app/data/database.sqlite');
const db = new (verbose()).Database(dbPath, (err) => {

  if (err) {
    console.error('error while opening db:', err);
  } else {
    console.log('DB opened successfully!');
  }
});
db.run("PRAGMA foreign_keys = ON")

async function add_friendship_db(id1, id2) {
    return new Promise((resolve, reject) =>
    {
        const query = `
        INSERT INTO friendship (id_user1, id_user2)
        VALUES (?,?)
        `;
         db.run(
            query,
            [id1, id2],
            function (err)
            {
                if (err) {
                console.error('Error while adding friendship:', err);
                reject(err);
                } else {
                resolve({ id: this.lastID });
                }
            }
        )
    })
}


async function remove_friendship_db(id1, id2) 
{
    return new Promise((resolve, reject) => {
        const query = `
        DELETE FROM friendship
        WHERE (id_user1 = ? AND id_user2 = ?)
           OR (id_user1 = ? AND id_user2 = ?)
        `;

        db.run(
            query,
            [id1, id2, id2, id1],
            function (err) {
                if (err) {
                    console.error('Error while removing friendship:', err);
                    reject(err);
                } else {
                    resolve({ deletedRows: this.changes });
                }
            }
        );
    });
}

export async function remove_friendship(id1, id2) {
    try
    {
        await remove_friendship_db(id1, id2);
    }
    catch (error)
    {
        console.log(error);
        throw error;
    }
}

export async function add_friendship(id1, id2)
{
    try
    {
        await add_friendship_db(id1, id2);
        await add_friendship_db(id2, id1);
    }
    catch(error)
    {
        console.log(error);
        throw error;
    }
}


async function get_friends_by_user_db(id1) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT id_user2
        FROM friendship
        WHERE id_user1 = ?
        `;

        db.all(query, [id1], (err, rows) => {
            if (err) {
                console.error('Error while fetching friends:', err);
                reject(err);
            } else {
                resolve(rows.map(row => row.id_user2));
            }
        });
    });
}

export async function get_friends_by_user(id) {
    try {
        const ids = await get_friends_by_user_db(id);
        const users = [];
        for (let i = 0; i < ids.length; i++) {
            const user = await getUserById(ids[i]);
            users.push(user);
        }
        return users;
    } catch (error) {
        console.error(error);
        throw error;
    }
}