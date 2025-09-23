import { getStatsById } from '../database_comunication/user_db.js';
import { createRequire } from 'module';
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

}