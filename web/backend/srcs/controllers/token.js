import { getUserById } from '../database_comunication/user_db.js';

export default async function (fastify, opts) {
  // Endpoint per validare token JWT e restituire dati utente
  fastify.get('/token', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      // request.user è già popolato da fastify.authenticate
      const userId = request.user.id;
      
      // Recupera dati freschi dal database
      const user = await getUserById(userId);
      
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      // Genera un nuovo token (refresh)
      const newToken = fastify.jwt.sign({ 
        id: user.id, 
        mail: user.mail,
        username: user.username
      });
      
      reply.send({
        token: newToken,
        user: {
          id: user.id,
          mail: user.mail,
          username: user.username
        }
      });
    } catch (err) {
      console.error("Token validation error:", err);
      reply.code(500).send({ error: 'Internal Server Error', details: err.message });
    }
  });
}
