 // aggiunto il token jwt per l'autenticazione ma va implementatop in un punto.env
// aggiunto controllo CORS(praticamente per la coerenza lato frontend e backend)
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import { getAllUsers, insertUser } from './database_comunication/user_db.js';
import registerRoute from './controllers/register.js';
import loginRoute from './controllers/login.js'; // mancava l'import del controller login

const fastify = Fastify({ logger: true });
await fastify.register(cors, {
  origin: '*',
});

await fastify.register(jwt, {
  secret: 'your_secret_key',
});

await fastify.register(registerRoute);
await fastify.register(loginRoute);
fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) 
  {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});

await fastify.get('/users', async (request, reply) => {
  {
    try 
    {
      const result = await getAllUsers();
      reply.send({ success: true, users: result });
    } catch (err) {
      request.log.error(err);
      reply.code(500).send({ error: 'Error searching in the db' });
  }
  }
})