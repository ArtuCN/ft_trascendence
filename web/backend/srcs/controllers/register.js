// routes/register.js
import { getUserByMail, getUserByUsername, createUser } from '../database_comunication/user_db.js';
import bcrypt from 'bcrypt'

export default async function (fastify, opts) {
  fastify.post('/register', async (request, reply) => {
    const { username, mail, password } = request.body;

    const userByMail = await getUserByMail(mail);
    if (userByMail)
      return reply.code(400).send({ error: 'Mail already registered!' });

    const userByUsername = await getUserByUsername(username);
    if (userByUsername)
      return reply.code(400).send({ error: 'Username already registered!' });

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await createUser({ mail, username, passwordHash: hashedPassword });

    const token = fastify.jwt.sign({ id: newUser.id, mail: newUser.mail });

    reply.send({
      token,
      user: {
        id: newUser.id,
        mail: newUser.mail,
        username: newUser.username
      }
    });
  });
}
