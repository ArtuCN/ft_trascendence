// controllers/match.js
import { insertMatch, getAllMatches, getMatchById, getPlayerMatchStats, getPlayerByMatchId } from '../database_comunication/match_db.js';
import { getAllMatchesOfPlayer } from '../database_comunication/user_db.js';
export default async function (fastify, opts) {
  fastify.get('/allmatch', async (request, reply) => {
    try {
      const result = await getAllMatches();
      reply.send(result);
    } catch (error) {
      console.log(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });
  fastify.get('/matchid', async (request, reply) => {
    try {
      const { id } = request.query;
      if (!id) return reply.code(400).send({ error: 'Missing id' });

      const result = await getMatchById(id);
      reply.send(result);
    } catch (error) {
      console.log(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });

  fastify.get('/allmatchplayer', async (request, reply) => {
    try {
      const { id_player } = request.query;
      if (!id_player) return reply.code(400).send({ error: 'Missing id_player' });

      const result = await getAllMatchesOfPlayer(id_player);
      const all = result.map(match => match.id);

      const allMatchesDetails = [];
      for (const matchId of all) {
        const matchDetails = await getPlayerMatchStats(id_player, matchId);
        if (matchDetails) {
          allMatchesDetails.push(matchDetails);
        }
      }
      reply.send(allMatchesDetails);
    } catch (error) {
      console.log(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });

  fastify.get('/playersbymatchid', async (request, reply) => {
    try {
      const { id } = request.query;
      if (!id) return reply.code(400).send({ error: 'Missing id_match' });

      const result = await getPlayerByMatchId(id);
      reply.send(result);
    } catch (error) {
      console.log(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });

  fastify.post('/match', async (request, reply) => {
    try {
      const { id_tournament, users_ids, users_goal_scored, users_goal_taken } = request.body;
      console.log(request.body);
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
