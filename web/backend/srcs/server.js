import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import { insertUser } from './database_comunication/user_db.js';
import registerRoute from './routes/register.js'; // 👈 importa la rotta modulare

const fastify = Fastify({ logger: true });

// CORS
await fastify.register(cors, {
  origin: '*',
});

// JWT
await fastify.register(jwt, {
  secret: 'your_secret_key', // 🔐 metti un valore sicuro in .env
});

// Rotte manuali
fastify.post('/users', async (request, reply) => {
  try {
    const result = await insertUser(request.body);
    reply.send({ success: true, id: result.id });
  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Error while adding into the db' });
  }
});

// Registra la rotta custom
await fastify.register(registerRoute);

// Avvio del server
fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
