import { getUserByMail, saveToken, getTokenByUsername, tokenExists } from '../database_comunication/user_db.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const bcrypt = require('bcrypt');


export default async function (fastify, opts) {
    fastify.post('/login', async (request, reply) =>  {
        try
        {
            const { mail, password } = request.body;
            const user = await getUserByMail(mail);
            if (!user)
                return reply.code(400).send({ error: 'email not registered!'});
            console.log(user);

            if (user.google_id && user.google_id.trim() !== '') {
                return reply.code(400).send({ error: 'This account is linked to Google. Please use Google Sign In.' });
            }
            console.log("fatto get user");
            const isValid = await bcrypt.compare(password, user.psw);
            console.log("fatto check");
            if (!isValid)
                return reply.code(401).send({ error: 'Invalid password' });
            let token = '';
            console.log("fatto check2");
            if (await tokenExists(user.mail) == true)
            {
                token = await getTokenByUsername(user.mail);
            }
            else
            {
                token = fastify.jwt.sign({
                    id: user.id,
                    mail: user.mail,
                    username: user.username
                });
            }
            console.log("fatto check3");
            reply.send({
                token,
                user: {
                    id: user.id,
                    mail: user.mail,
                    username: user.username
                }
            });
            console.log("fatto check4");
        }
        catch (err)
        {
            return reply.code(404).send({error: 'error '+ err});
        }
    })
}