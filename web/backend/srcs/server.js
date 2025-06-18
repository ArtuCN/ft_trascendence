import Fastify from 'fastify';
import { insertUser, getAllUsers } from './db.js';

const fastify = Fastify({ logger: true });
fastify.post('/users', async (request, reply) => {
  const { name, mail, psw } = request.body;

  try {
    const result = await insertUser(name, mail, psw);
    reply.send({ success: true, id: result.id });
  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Error while adding into the db' });
  }
});

fastify.get('/users', async (request, reply) => {
  try {
    const users = await getAllUsers();
    reply.send(users);
  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Error while reading users' });
  }
});

// Avvio del server
fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server in ascolto su ${address}`);
});
