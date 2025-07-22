import { searchByToken } from '../database_comunication/user_db.js';

export default async function (fastify, opts) {
  fastify.get('/token', async (request, reply) => {
    try {
      console.log("prima del request header");
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        return reply.code(401).send({ error: 'Missing Authorization header' });
      }
      const token = authHeader.split(' ')[1];
      if (!token) {
        return reply.code(401).send({ error: 'Invalid Authorization header format' });
      }

      console.log("Token ricevuto:", token);

      const res = await searchByToken(token);
      console.log("response DB:", res);

      if (!res || res.length === 0) {
        return reply.code(404).send({ error: 'Token not valid or user not present in the database!' });
      }

      const user = res[0];
      reply.send({
        token,
        user: {
          id: user.id,
          mail: user.mail,
          username: user.username
        }
      });
    } catch (err) {
      console.error("Errore:", err);
      reply.code(500).send({ error: 'Internal Server Error', details: err.message });
    }
  });
}
