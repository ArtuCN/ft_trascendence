import { uploadAvatar_db, getAvatar_db, searchByToken } from "../database_comunication/user_db.js";

export default async function (fastify, opts) {
  fastify.post('/avatar', async (req, reply) => {
    try {
      const file = await req.file();
      if (!file) {
        return reply.status(400).send({ error: 'Nessun file ricevuto' });
      }

      // Prefer explicit id in form, otherwise derive from Bearer token
      let id = req.body?.id;
      if (!id) {
        const auth = req.headers?.authorization || req.headers?.Authorization;
        if (!auth) {
          return reply.status(401).send({ error: 'Unauthorized: missing token' });
        }
        const parts = auth.split(' ');
        const token = parts.length === 2 && parts[0].toLowerCase() === 'bearer' ? parts[1] : parts[0];
        if (!token) {
          return reply.status(401).send({ error: 'Unauthorized: invalid token' });
        }

        const users = await searchByToken(token);
        if (!users || users.length === 0) {
          return reply.status(401).send({ error: 'Unauthorized: token not found' });
        }
        id = users[0].id;
      }

      const buffer = await file.toBuffer();
      const base64Avatar = buffer.toString('base64');

  const res = await uploadAvatar_db(id, base64Avatar);
  reply.status(200).send({ message: 'Avatar uploaded successfully', id: id, db: res });
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  fastify.get('/avatar/:id', async (req, reply) => {
    try {
      const { id } = req.params;
      const avatar = await getAvatar_db(id);
      if (!avatar) {
        return reply.status(404).send({ error: 'Avatar not found' });
      }
      reply
        .header('Content-Type', 'image/png')
        .send(Buffer.from(avatar, 'base64'));
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
