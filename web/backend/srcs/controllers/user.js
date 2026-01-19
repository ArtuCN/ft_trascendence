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

  fastify.put('/updateprofile', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.id;
      const { username, password, currentPassword } = request.body;

      if (!username && !password) {
        return reply.code(400).send({ error: 'No fields to update' });
      }

      // Get current user to verify password if needed
      const currentUser = await getUserById(userId);
      if (!currentUser) {
        return reply.code(404).send({ error: 'User not found' });
      }

      // If password change is requested, verify current password
      if (password) {
        if (!currentPassword) {
          return reply.code(400).send({ error: 'Current password is required to change password' });
        }

        const bcrypt = require('bcrypt');
        const passwordMatch = await bcrypt.compare(currentPassword, currentUser.psw);
        if (!passwordMatch) {
          return reply.code(401).send({ error: 'Current password is incorrect' });
        }
      }

      // Check if username is being changed and if it's already taken
      if (username && username !== currentUser.username) {
        const existingUser = await getUserByUsername(username);
        if (existingUser && existingUser.length > 0 && existingUser[0].id !== userId) {
          return reply.code(400).send({ error: 'Username already taken' });
        }
      }

      // Prepare updates object
      const updates = {};
      if (username && username !== currentUser.username) {
        const { sanitizeInput } = await import('../utils/sanitize.js');
        updates.username = sanitizeInput(username);
      }

      if (password) {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        updates.psw = await bcrypt.hash(password, saltRounds);
      }

      // Import updateUserProfile dynamically
      const { updateUserProfile } = await import('../database_comunication/user_db.js');
      await updateUserProfile(userId, updates);

      // Get updated user data
      const updatedUser = await getUserById(userId);

      // Generate new token with updated info
      const newToken = fastify.jwt.sign({
        id: updatedUser.id,
        mail: updatedUser.mail,
        username: updatedUser.username,
        is_admin: updatedUser.is_admin || false
      });

      reply.send({
        success: true,
        token: newToken,
        user: {
          id: updatedUser.id,
          mail: updatedUser.mail,
          username: updatedUser.username
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      reply.code(500).send({ error: 'Internal Server Error: ' + error.message });
    }
  });
}
