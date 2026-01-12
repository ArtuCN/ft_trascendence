import { getStatsById, getAllPlayerStats } from '../database_comunication/user_db.js';

export default async function (fastify, opts) {
  fastify.get('/stats', { preHandler: [fastify.authenticate] }, async (request, reply) => {
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
  fastify.get('/allstats', { preHandler: [fastify.authenticate] }, async (request, reply) => {
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
}
