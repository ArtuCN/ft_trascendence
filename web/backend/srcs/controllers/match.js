// controllers/match.js
import { insertMatch, getAllMatches, getMatchById, getPlayerMatchStats, getPlayerByMatchId, insertPlayerMatchStats, upsertStatsAfterMatch } from '../database_comunication/match_db.js';
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
      
      // Allow id_tournament to be null for non-tournament matches
      if (users_ids === undefined || users_goal_scored === undefined || users_goal_taken === undefined) {
        return reply.code(400).send({ error: 'Missing required fields in request body' });
      }

      // Validate arrays
      if (!Array.isArray(users_ids) || !Array.isArray(users_goal_scored) || !Array.isArray(users_goal_taken)) {
        return reply.code(400).send({ error: 'users_ids, users_goal_scored, and users_goal_taken must be arrays' });
      }

      if (users_ids.length !== users_goal_scored.length || users_ids.length !== users_goal_taken.length) {
        return reply.code(400).send({ error: 'Array lengths must match' });
      }
const invalidIndex = users_ids.findIndex(id => id === -1);

if (invalidIndex !== -1) {
  console.log('⚠️ Partial match: saving ONLY player stats');

  // filtra solo utenti validi
  const validPlayers = users_ids
    .map((id, i) => ({
      id,
      goalsScored: users_goal_scored[i],
      goalsTaken: users_goal_taken[i],
    }))
    .filter(p => p.id !== -1);

  for (const player of validPlayers) {
    console.log(`📊 Saving stats for player ${player.id}: scored ${player.goalsScored}, taken ${player.goalsTaken}`);
    const res = await insertPlayerMatchStats(
      player.id,
      0,
      player.goalsScored,
      player.goalsTaken
    );

    if (res?.error) {
      return reply.code(500).send({ error: res.error });
    }

    const upd = await upsertStatsAfterMatch(
      player.id,
      player.goalsScored,
      player.goalsTaken,
      0
    );

    if (upd?.error) {
      return reply.code(500).send({ error: upd.error });
    }
  }

  return reply.send({ success: true, partial: true });
}
      else {
        console.log('📊 Saving match:', { id_tournament, users_ids, users_goal_scored, users_goal_taken });

        const result = await insertMatch(id_tournament, users_ids, users_goal_scored, users_goal_taken);
        reply.send(result);
      }
    } catch (error) {
      console.log(error);
      reply.code(500).send({ error: 'Internal Server Error ' + error });
    }
  });
}
