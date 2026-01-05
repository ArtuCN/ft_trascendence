import { insertTournamentInDB, getAllTournaments, startTournament, finishTournament } from '../database_comunication/tournament_db.js';
import { sanitizeInput } from '../utils/sanitize.js';

export default async function (fastify, opts) {
      fastify.post('/tournament', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    {
      const { tournament_name } = request.body;
      const sanitizedTournamentName = sanitizeInput(tournament_name);
      const result = await insertTournamentInDB(sanitizedTournamentName);
      reply.send(result);
    }
  })
  fastify.get('/alltournament', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const result = await getAllTournaments();
      reply.send(result);
    } catch (error) {
      console.log(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });
  fastify.post('/starttournament', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { id } = request.body;
      if (!id) return reply.code(400).send({ error: 'Missing id' });

      const result = await startTournament(id);
      reply.send(result);
    } catch (error) {
      console.log(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });
  fastify.post('/finishtournament', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const { id, id_winner } = request.body;
      if (!id || !id_winner) return reply.code(400).send({ error: 'Missing id or id_winner' });

      const result = await finishTournament(id, id_winner);
      reply.send(result);
    } catch (error) {
      console.log(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });
}