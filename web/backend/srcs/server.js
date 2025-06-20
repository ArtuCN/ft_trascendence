import Fastify from 'fastify';
import { insertUser, getAllUsers } from './db.js';
import models from './models/models.js'

const fastify = Fastify({ logger: true });
fastify.post('/users', async (request, reply) => {
  try {
    const result = await insertUser(request.body);
    reply.send({ success: true, id: result.id });
  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Error while adding into the db' });
  }
});


// Avvio del server
fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening ${address}`);
});
