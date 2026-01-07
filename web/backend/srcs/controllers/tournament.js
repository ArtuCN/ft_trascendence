import { insertTournamentInDB, getAllTournaments, startTournament, finishTournament, getTournamentDataForBlockchain } from '../database_comunication/tournament_db.js';
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

  fastify.get('/gettournamentforblockchain', { preHandler: [fastify.authenticate] }, async (request, reply) => {
	  try {
		  const { id, tournament_id } = request.query;
		  if (!id || !tournament_id) return reply.code(400).send({ error: 'Missing id or tournament_id' });

		  const result = await getTournamentDataForBlockchain(Number(tournament_id));
		  const tournament_ids = result.user_ids;
		  if (!tournament_ids.includes(Number(id))) {
			  return reply.code(403).send({ error: 'User not in tournament' });
		  }
		  return reply.send(result);
	  } catch (error) {
		  console.log(error);
		  reply.code(500).send({ error: 'Internal Server Error ' + error});
	  }
  });
}

