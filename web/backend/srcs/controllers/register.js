
import { getUserByMail, getUserByUsername, insertUser } from '../database_comunication/user_db.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');

export default async function (fastify, opts) {
  fastify.post('/register', async (request, reply) => {
    try
    {
      const { username, mail, psw } = request.body;
  
      //controlli su mail e password
      const userByMail = await getUserByMail(mail);
      if (userByMail)
        return reply.code(400).send({ error: 'Mail already registered!' });
      /*const userByUsername = await getUserByUsername(username);
      if (userByUsername)
        return reply.code(400).send({ error: 'Username already registered!' });
      mi si bugga il cazzo di controllo poi lo rimetto
      */ 
      // migliorato l'hashing della password con chat. ora la password viene salavata già hashata
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(psw, saltRounds);
      const newUser = await insertUser({ username, mail, psw: hashedPassword });
      const token = fastify.jwt.sign({ id: newUser.id, mail: newUser.mail });
      reply.send({
        token,
        user: {
          id: newUser.id,
          mail: newUser.mail,
          username: newUser.username
        }
      });
    }
    catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Internal Server Error', details: err.message });
    }
  });
}
