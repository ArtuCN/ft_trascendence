import { searchByToken } from '../database_comunication/user_db.js';


export default async function (fastify, opts) {
    fastify.get('/token', async (request, reply) =>{
        try
        {
            const token = request.body.token;
            res = await searchByToken(token);
            if (res.length === 0)
                return reply.code(404).send({ error: 'Token not valid or user not present in the database!' });
            const user = res[0];
            reply.send({
                token,
                user: {
                    id: user.id,
                    mail: user.mail,
                    username: user.username
                }
            })
        }
        catch (err)
        {
            reply.code(500).send( {error: ('Error ' + err)})
        }
    })
    
}