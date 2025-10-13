// routes/register.js
import { getUserByMail, getUserByUsername, insertUser, saveToken } from '../database_comunication/user_db.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');

export default async function (fastify, opts) {
  fastify.post('/register', async (request, reply) => {
    try
    {
      const { username, mail, psw } = request.body;
  
      const userByMail = await getUserByMail(mail);
      if (userByMail)
        return reply.code(400).send({ error: 'Mail already registered!' });

      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(psw, saltRounds);
      const newUser = await insertUser({ username, mail, psw: hashedPassword });
      const token = fastify.jwt.sign({ id: newUser.id, mail: newUser.mail });
      console.log("BACKEND NEWUSER ", newUser.id, " mail: ", newUser.mail, " username ", newUser.username);
      saveToken(newUser.username, token);
      reply.send({
        token,
        user: {
          id: newUser.id,
          mail: mail,
          username: username
        }
      });
    }
    catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: 'Internal Server Error', details: err.message });
    }
  });
}
