import { insertMatch } from '../database_comunication/match_db.js';
import { insertTournamentInDB } from '../database_comunication/tournament_db.js';

export default async function (fastify, opts) {
      fastify.post('/tournament', async (request, reply) => {
    {
      const { tournament_name } = request.body;
      const result = await insertTournamentInDB(tournament_name);
      reply.send(result);
    }
  })
}