import { getUserByMail, getUserByUsername } from '../database_comunication/user_db.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');

export default async function (fastify, opts) {
  fastify.post('/login', async (request, reply) => {
    try {
      const { username, password } = request.body;
      //aggiunto un check per la ricezione(inserimento) dei dati
      if (!username || !password) {
        return reply.code(400).send({ error: 'Username and password are required' });
      }
      
      let user = null;
      
      //aggisunta la ricberca per email automatica almeno siamo coperti su entrambi i casi
      if (username.includes('@')) {
        user = await getUserByMail(username);
        if (!user) {
          return reply.code(400).send({ error: 'Email not registered!' });
        }
      } else {
        const users = await getUserByUsername(username);
        if (!users || users.length === 0) {
          return reply.code(400).send({ error: 'Username not registered!' });
        }
        user = users[0];
      }
        //non comparava le password correttamente
      const valid = await bcrypt.compare(password, user.psw);
      if (!valid) {
        return reply.code(400).send({ error: 'Invalid password!' });
      }
      //stesso discorso per il token
      const token = fastify.jwt.sign({ id: user.id, mail: user.mail });
      
      // aggiunto il token alla risposta
      reply.send({
        token,
        user: {
          id: user.id.toString(),
          mail: user.mail,
          username: user.username
        }
      });
    } catch (err) {
      // mancava il catch per gli errori. era questo che faceva crashare il server
      fastify.log.error(err);
      reply.code(500).send({ error: 'Internal Server Error', details: err.message });
    }
  });
}