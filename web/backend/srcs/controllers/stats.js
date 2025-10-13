import { getStatsById, getAllPlayerStats } from '../database_comunication/user_db.js';
import { insertMatch } from '../database_comunication/match_db.js';

export default async function (fastify, opts) {
  fastify.get('/stats', async (request, reply) => {
    try
    {
        const { id } = request.query;
        if (!id)
            return reply.code(400).send({ error: 'Missing id' });
        const result = await getStatsById(id);
        reply.send(result);
    }
    catch(error)
    {
        console.log(error);
        reply.code(500).send({ error: ('Internal Server Error' + error)});
    }
  })
  
  //stats of ALL players
  fastify.get('/allstats', async (request, reply) => {
    try
    {
        const result = await getAllPlayerStats();
        reply.send(result);
    }
    catch(error)
    {
        console.log(error);
        reply.code(500).send({ error: ('Internal Server Error' + error)});
    }
  })
  
  fastify.post('/tournament', async (request, reply) => {
    {
      try
      {
        console.log("I BODY DIAHANE ", request.body);
        const { id_tournament, users_ids, users_goal_scored, users_goal_taken} = request.body;
  
        if (!id_tournament || !users_ids || !users_goal_scored || !users_goal_taken)
            return reply.code(400).send({ error: 'Missing something in request body' });
        const result = await insertMatch(id_tournament, users_ids, users_goal_scored, users_goal_taken);
        reply.send(result);
      }
      catch(error)
      {
        console.log(error);
        reply.code(500).send({ error: ('Internal Server Error' + error)});
      }
    }
  })
}
