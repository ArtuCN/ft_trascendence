import { add_friendship, get_friends_by_user, remove_friendship, get_all_friendships } from "../database_comunication/friendship_db.js";
import { who_blocked_user } from "../database_comunication/blocked_db.js";
export default async function (fastify, opts) {

    fastify.get('/friend', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try {
            const { id } = request.query;
            if (!id) {
                return reply.code(400).send({ error: 'Missing id' });
            }
            const users = await get_friends_by_user(Number(id));
            const blocked = await who_blocked_user(Number(id));
            const blockedSet = new Set((blocked || []).map(b => Number(b)));
            const filteredUsers = users.filter(user => {
                const uid = Number(user.id);
                return !blockedSet.has(uid);
            });
            return reply.send(filteredUsers);
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Server error: ' + error.message });
        }
    });

    fastify.post('/addfriend', { preHandler: [fastify.authenticate] }, async (request, reply) => {
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

    fastify.delete('/removefriend/:id1/:id2', { preHandler: [fastify.authenticate] }, async (request, reply) => {
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

    fastify.get('/allfriendships', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        try {

            const users = await get_all_friendships();
            return reply.send(users);
        } catch (error) {
            console.error(error);
            return reply.code(500).send({ error: 'Server error: ' + error.message });
        }
    });
}
