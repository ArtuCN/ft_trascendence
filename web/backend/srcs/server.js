import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';

import { getAllUsers } from './database_comunication/user_db.js';

// Rotte modulari
import registerRoute from './controllers/register.js';
import loginRoute from './controllers/login.js';
import logoutRoute from './controllers/logout.js';
import tokenRoute from './controllers/token.js';
import statsRoute from './controllers/stats.js';
import friendRoute from './controllers/friendship.js';

import { setupMatchmaking } from './controllers/online_match/online_match.js';

const fastify = Fastify({ logger: true });

// Abilita CORS
await fastify.register(cors, { origin: '*' });

// Configura JWT
await fastify.register(jwt, { secret: 'your_secret_key' });

// Rotte modulari
await fastify.register(loginRoute);
await fastify.register(registerRoute);
await fastify.register(logoutRoute);
await fastify.register(tokenRoute);
await fastify.register(statsRoute);
await fastify.register(friendRoute);

fastify.get('/users', async (request, reply) => {
  try {
    const result = await getAllUsers();
    reply.send({ success: true, users: result });
  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Error searching in the db' });
  }
});

const wss = setupMatchmaking(fastify.server);

setInterval(() => {
  wss.clients.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        console.log('Sending ping to client');
        console.log('web socket status: ', ws.readyState);
        ws.send(JSON.stringify({ type: 'ping' }));
      }
  });
}, 10000); // Send a ping every 10 seconds

fastify.server.on('upgrade', (request, socket, head) => {
  if (request.url === '/ws') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// Avvia server
const address = await fastify.listen({ port: 3000, host: '0.0.0.0' });
fastify.log.info(`Server listening at ${address}`);
