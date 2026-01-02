import { get_chat_messages_db, add_chat_message_db} from '../database_comunication/chat_db.js';
export default async function (fastify, opts) {
    fastify.get('/chat', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { id1, id2 } = request.query;
        try {
            const messages = await get_chat_messages_db(id1, id2);
            reply.send(messages);
        } catch (error) {
            reply.status(500).send({ error: 'Failed to fetch chat messages' });
        }
    });
    fastify.post('/chat', { preHandler: [fastify.authenticate] }, async (request, reply) => {
        const { id_sender, id_receiver, message } = request.body;
        try {
            const newMessage = await add_chat_message_db(id_sender, id_receiver, message);
            reply.status(201).send(newMessage);
        } catch (error) {
            reply.status(500).send({ error: 'Failed to create chat message' });
        }
    });
}