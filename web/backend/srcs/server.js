import Fastify from 'fastify';
import { insertUser, getAllUsers } from './db.js';

const fastify = Fastify({ logger: true });

// Route POST /users
fastify.post('/users', async (request, reply) => {
  const { name, mail } = request.body;
  insertUser(name, mail, (err, result) => {
    if (err) {
      reply.code(500).send({ error: 'Errore durante l\'inserimento' });
    } else {
      reply.send({ success: true, id: result.id });
    }
  });
});

// Route GET /users
fastify.get('/users', async (request, reply) => {
  getAllUsers((err, users) => {
    if (err) {
      reply.code(500).send({ error: 'Errore durante la lettura degli utenti' });
    } else {
      reply.send(users);
    }
  });
});

// Avvio del server
fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server in ascolto su ${address}`);
});
