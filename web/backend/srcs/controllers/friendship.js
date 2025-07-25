import { add_friendship, get_friends_by_user, remove_friendship } from "../database_comunication/friendship_db.js";

export default async function (fastify, opts) {

    fastify.get('/friend', async (request, reply) => {
        try {
            const { id } = request.query;
            if (!id) {
                return reply.code(400).send({ error: 'Missing id' });
            }

            const users = await get_friends_by_user(Number(id));
            return reply.send(users);
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Server error: ' + error.message });
        }
    });

    fastify.post('/addfriend', async (request, reply) => {
        try {
            const { id1, id2 } = request.body;

            if (!id1 || !id2) {
                return reply.code(400).send({ error: 'Missing id1 or id2' });
            }
            if (id1 === id2) {
                return reply.code(400).send({ error: 'Cannot friend yourself' });
            }

            await add_friendship(Number(id1), Number(id2));
            return reply.send({ success: true });
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Server error: ' + error.message });
        }
    });

    fastify.delete('/removefriend/:id1/:id2', async (request, reply) => {
        try {
            const { id1, id2 } = request.params;

            if (!id1 || !id2) {
                return reply.code(400).send({ error: 'Missing id1 or id2' });
            }

            const result = await remove_friendship(Number(id1), Number(id2));
            if (result.deletedRows === 0) {
                return reply.code(404).send({ success: false, message: 'Friendship not found' });
            }

            return reply.send({ success: true, deleted: result.deletedRows });
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Server error: ' + error.message });
        }
    });
}
