import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import fastifyMultipart from 'fastify-multipart';
import rateLimit from '@fastify/rate-limit';


import { getAllUsers } from './database_comunication/user_db.js';
import { sanitizeUsers } from './utils/sanitize.js';

// Rotte modulari
import registerRoute from './controllers/register.js';
import loginRoute from './controllers/login.js';
import logoutRoute from './controllers/logout.js';
import tokenRoute from './controllers/token.js';
import googleAuthRoute from './controllers/google-auth.js';
import statsRoute from './controllers/stats.js';
import friendRoute from './controllers/friendship.js';
import matchRoute from './controllers/match.js';
import tournamentRoute from './controllers/tournament.js';
import heartBeatRoute from './controllers/heartBeat.js';
import avatarRoute from './controllers/avatar.js';
import blockedRoute from './controllers/blocked.js';
import chatRoute from './controllers/chat.js';
import userRoute from './controllers/user.js';

// WebSocket matchmaking
import { setupMatchmaking } from './controllers/online_match/online_match.js';

const fastify = Fastify({ logger: true });

// Rate limiting to prevent brute force attacks
await fastify.register(rateLimit, {
  max: 100, // Maximum 100 requests
  timeWindow: '15 minutes', // Per 15 minutes
  cache: 10000, // Cache size
  allowList: [], // IPs to whitelist
  redis: null, // No redis needed for simple rate limiting
  skipOnError: true, // Skip rate limiting on errors
  keyGenerator: (request) => {
    return request.ip; // Rate limit by IP address
  }
});

// Abilita CORS - restrict to specific origins
await fastify.register(cors, {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'https://192.168.1.203',
    'https://localhost'
  ],
  credentials: true
});


await fastify.register(fastifyMultipart, {
  limits: { fileSize: 5 * 1024 * 1024 }, // opzionale, max 5MB
});

// Configura JWT
await fastify.register(jwt, { secret: 'your_secret_key' }); // 🔐 usa un valore sicuro in .env

// per preHandler - estrare dati di user da token, senza lookup in database
fastify.decorate('authenticate', async function (request, reply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return reply.code(401).send({ error: 'Missing Authorization header' });
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return reply.code(401).send({ error: 'Invalid Authorization header format' });
    }

    const token = parts[1];
    // verify throws on invalid/expired token
    const payload = fastify.jwt.verify(token);
    // attach decoded payload to request for handlers
    request.user = payload;
  } catch (err) {
    return reply.code(401).send({ error: 'Invalid or expired token' });
  }
});

// Admin authentication decorator - prima fa autenticazione normale, poi guarda se is_admin
fastify.decorate('authenticateAdmin', async function (request, reply) {
  await fastify.authenticate(request, reply);

  // If authenticate already sent a response, don't continue
  if (reply.sent) {
    return;
  }

  if (!request.user || !request.user.is_admin) {
    return reply.code(403).send({ error: 'Forbidden: Admin access required' });
  }
});

// Registra le rotte modulari
await fastify.register(matchRoute);
await fastify.register(loginRoute);
await fastify.register(registerRoute);
await fastify.register(logoutRoute);
await fastify.register(tokenRoute);
await fastify.register(googleAuthRoute);
await fastify.register(statsRoute);
await fastify.register(friendRoute);
await fastify.register(tournamentRoute);
await fastify.register(heartBeatRoute);
await fastify.register(avatarRoute);
await fastify.register(blockedRoute);
await fastify.register(chatRoute);
await fastify.register(userRoute);
// Endpoint semplice per debug - Admin only
fastify.get('/users', { preHandler: [fastify.authenticateAdmin] }, async (request, reply) => {
  try {
    const result = await getAllUsers();
    const sanitized = sanitizeUsers(result);
    reply.send({ success: true, users: sanitized });
  } catch (err) {
    request.log.error(err);
    reply.code(500).send({ error: 'Error searching in the db' });
  }
});

// WebSocket setup per matchmaking online
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

// Avvia il server
const address = await fastify.listen({ port: 3000, host: '0.0.0.0' });
fastify.log.info(`Server listening at ${address}`);
