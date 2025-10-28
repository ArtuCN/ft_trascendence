

import { get_blocked_user, add_blocked_user } from '../database_comunication/blocked_db.js';

export default async function (fastify, opts) {

    fastify.get('/blocked', async (request, reply) => {
        try {
            const { id } = request.query;
            if (!id) {
                return reply.code(400).send({ error: 'Missing id' });
            }

            const users = await get_blocked_user(Number(id));
            return reply.send(users);
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Server error: ' + error.message });
        }
    });
    fastify.post('/blockuser', async (request, reply) => {
        try {
            const { id, id_blocked } = request.query;

            if (!id || !id_blocked) {
                return reply.code(400).send({ error: 'Missing id or id_blocked' });
            }
            if (id === id_blocked) {
                return reply.code(400).send({ error: 'Cannot block yourself' });
            }

            await add_blocked_user(Number(id), Number(id_blocked));
            return reply.send({ success: true });
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Server error: ' + error.message });
        }
    });
}