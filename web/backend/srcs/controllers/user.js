import {
  getAllUsers,
  getUserByMail,
  getUserByUsername,
  getUserById,
  getStatsById,
  searchByToken,
  getUserByGoogleId,
  getAllPlayerStats,
  getUserLastActive
} from '../database_comunication/user_db.js';
import { sanitizeUser, sanitizeUsers } from '../utils/sanitize.js';

export default async function (fastify, opts) {

  fastify.get('/allusers', { preHandler: [fastify.authenticateAdmin] }, async (request, reply) => {
    try {
      const result = await getAllUsers();
      const sanitized = sanitizeUsers(result);
      reply.send(sanitized);
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });

  fastify.get('/userbyid', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { id } = request.query;
      if (!id) {
        return reply.code(400).send({ error: 'Missing id' });
      }

      const result = await getUserById(id);
      if (!result) {
        return reply.code(404).send({ error: 'User not found' });
      }
      reply.send(sanitizeUser(result));
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });

  fastify.get('/userbyusername', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { username } = request.query;
      if (!username) {
        return reply.code(400).send({ error: 'Missing username' });
      }

      const result = await getUserByUsername(username);
      reply.send(sanitizeUsers(result));
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });

  fastify.get('/userbymail', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { mail } = request.query;
      if (!mail) {
        return reply.code(400).send({ error: 'Missing mail' });
      }

      const result = await getUserByMail(mail);
      if (!result) {
        return reply.code(404).send({ error: 'User not found' });
      }
      reply.send(sanitizeUser(result));
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });

  fastify.get('/userbygoogleid', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { google_id } = request.query;
      if (!google_id) {
        return reply.code(400).send({ error: 'Missing google_id' });
      }

      const result = await getUserByGoogleId(google_id);
      if (!result) {
        return reply.code(404).send({ error: 'User not found' });
      }
      reply.send(sanitizeUser(result));
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });

  fastify.get('/userbytoken', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { token } = request.query;
      if (!token) {
        return reply.code(400).send({ error: 'Missing token' });
      }

      const result = await searchByToken(token);
      reply.send(sanitizeUsers(result));
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });

  fastify.get('/statsbyid', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { id } = request.query;
      if (!id) {
        return reply.code(400).send({ error: 'Missing id' });
      }

      const result = await getStatsById(id);
      reply.send(result);
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });

  fastify.get('/allplayerstats', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const result = await getAllPlayerStats();
      reply.send(result);
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });

  fastify.get('/userlastactive', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { id } = request.query;
      if (!id) {
        return reply.code(400).send({ error: 'Missing id' });
      }

      const result = await getUserLastActive(id);
      reply.send({ last_active: result });
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });
}
