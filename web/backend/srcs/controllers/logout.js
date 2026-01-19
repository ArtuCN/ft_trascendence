import { removeToken } from '../database_comunication/user_db.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');

export default async function (fastify, opts) {
    fastify.post('/logout', { preHandler: [fastify.authenticate] }, async (request, reply)=>{
        try
        {
            const username = request.body.username;
            removeToken(username);
            return reply.code(200).send({ message: 'Logged out successfully' });
        }
        catch
        {
            reply.code(400).send({ error: 'Failed logout' });
        }
    })
    
}