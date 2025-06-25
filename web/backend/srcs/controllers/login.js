import { getUserByMail, getUserByUsername } from '../database_comunication/user_db';
import fastify from '../fastify' 
const Fastify = new fastify;

Fastify.post('login', async (request, post))
{
    const { username,  mail, password } = request.body;
    user = '';
    if (mail)
    {
        user = await getUserByMail(mail)
        if (!user)
            return reply.code(400).send({ error: 'Mail not registered!'});
    }
    else if (username)
    {
        user = await getUserByUsername(username)
        if (!user)
            return reply.code(400).send({ error: 'Username not registered!'});
    }
    const valid = await bycrpt.compare(user)
        
    const bcrypt = require('bcrypt');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = await createUser({ mail, username, passwordHash: hashedPassword });
    const token = fastify.jwt.sign({ id: newUser.id, mail: newUser.mail });
    reply.send({ token, user: { id: newUser.id, mail: newUser.mail, username: newUser.username } });
}
