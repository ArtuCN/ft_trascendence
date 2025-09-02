import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import { getAllUsers } from './database_comunication/user_db.js';

// Rotte modulari
import registerRoute from './controllers/register.js';
import loginRoute from './controllers/login.js';
import logoutRoute from './controllers/logout.js';
import tokenRoute from './controllers/token.js';
import googleAuthRoute from './controllers/google-auth.js';
import statsRoute from './controllers/stats.js';
import friendRoute from './controllers/friendship.js';

const fastify = Fastify({ logger: true });

// Abilita CORS (per il frontend React o altro)
await fastify.register(cors, { origin: '*' });

// Configura JWT
await fastify.register(jwt, { secret: 'your_secret_key' }); // 🔐 metti un valore sicuro in .env

// Registra le rotte modulari
await fastify.register(loginRoute);
await fastify.register(registerRoute);
await fastify.register(logoutRoute);
await fastify.register(tokenRoute);
await fastify.register(googleAuthRoute);
await fastify.register(statsRoute);
await fastify.register(friendRoute);

// Endpoint semplice per debug
fastify.get('/users', async (request, reply) => {
  try {
    const result = await getAllUsers();
    reply.send({ success: true, users: result });
  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Error searching in the db' });
  }
});

// Avvia il server
fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
