import { getUserByMail, saveToken, getTokenByUsername, tokenExists } from '../database_comunication/user_db.js';
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
            
            // Verifica se l'utente è registrato tramite Google
            if (user.google_id && user.google_id.trim() !== '') {
                return reply.code(400).send({ error: 'This account is linked to Google. Please use Google Sign In.' });
            }
            
            const isValid = await bcrypt.compare(password, user.psw);
            if (!isValid)
                return reply.code(401).send({ error: 'Invalid password' });
            let token = '';
            if (await tokenExists(user.username) == true)
            {
                token = await getTokenByUsername(user.username);
            }
            else
            {
                token = fastify.jwt.sign({
                    id: user.id,
                    mail: user.mail,
                    username: user.username
                });
                const saveResult = await saveToken(user.username, token);
            }
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