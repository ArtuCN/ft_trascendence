import { insertTournament, getTournamentByBackendId, getTournamentByBlockchainId } from '../database_comunication/blockchain_tournament.js';
import { sanitizeInput } from '../utils/sanitize.js';

export default async function (fastify, opts) {
  fastify.post('/blockchain/tournament', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { backend_id, blockchain_id } = request.body;
    if (!backend_id || !blockchain_id)
      return reply.code(400).send({ error: 'Missing backend_id or blockchain_id' });
    try {
      const sanitizedBackendId = sanitizeInput(backend_id);
      const sanitizedBlockchainId = sanitizeInput(blockchain_id);
      const result = await insertTournament(sanitizedBackendId, sanitizedBlockchainId);
      reply.send({ insertedId: result });
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });

  fastify.get('/blockchain/tournament/by-backend', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { backend_id } = request.query;
    if (!backend_id)
      return reply.code(400).send({ error: 'Missing backend_id' });
    try {
      const sanitizedBackendId = sanitizeInput(backend_id);
      const result = await getTournamentByBackendId(sanitizedBackendId);
      reply.send(result);
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });

  fastify.get('/blockchain/tournament/by-blockchain', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { blockchain_id } = request.query;
    if (!blockchain_id)
      return reply.code(400).send({ error: 'Missing blockchain_id' });
    try {
      const sanitizedBlockchainId = sanitizeInput(blockchain_id);
      const result = await getTournamentByBlockchainId(sanitizedBlockchainId);
      reply.send(result);
    } catch (error) {
      console.error(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });
}
