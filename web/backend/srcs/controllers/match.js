// controllers/match.js
import { insertMatch, getAllMatches } from '../database_comunication/match_db.js';

export default async function (fastify, opts) {
  fastify.get('/allmatch', async (request, reply) => {
    try {
      const { id } = request.query;
      if (!id) return reply.code(400).send({ error: 'Missing id' });
      const result = await getAllMatches();
      reply.send(result);
    } catch (error) {
      console.log(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });

  fastify.post('/match', async (request, reply) => {
    try {
      const { id_tournament, users_ids, users_goal_scored, users_goal_taken } = request.body;

      if (!id_tournament || !users_ids || !users_goal_scored || !users_goal_taken)
        return reply.code(400).send({ error: 'Missing something in request body' });

      const result = await insertMatch(id_tournament, users_ids, users_goal_scored, users_goal_taken);
      reply.send(result);
    } catch (error) {
      console.log(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });
}
