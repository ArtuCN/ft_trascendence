import { error } from 'console';
import { getUserByMail, getUserByUsername, insertUser } from '../database_comunication/user_db.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');


export default async function (fastify, opts) {
    fastify.post('/login', async (request, reply) =>  {
        try
        {
            const { username, password } = request.body;
            const user = await getUserByMail(username);
            if (!user)
                return reply.code(400).send({ error: 'email not registered!'});
                    const isValid = await bcrypt.compare(password, user.psw);
            if (!isValid)
                return reply.code(401).send({ error: 'Invalid password' });
            const token = fastify.jwt.sign({
                id: user.id,
                mail: user.mail,
                username: user.username
            });
            reply.send({
                token,
                user: {
                id: user.id,
                mail: user.mail,
                username: user.username
                }
            });
           
        }
        catch (err)
        {
            return reply.code(404).send({error: 'error '+ err});
        }
    })
}