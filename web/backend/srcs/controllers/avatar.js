import { uploadAvatar_db, getAvatar_db } from "../database_comunication/user_db.js";

export default async function (fastify, opts) {
  fastify.post('/avatar', {
    preHandler: fastify.authenticate
  }, async (req, reply) => {
    try {
      const file = await req.file();
      if (!file) {
        return reply.status(400).send({ error: 'Nessun file ricevuto' });
      }

      // Get user ID from decoded JWT token (populated by fastify.authenticate)
      const id = req.user?.id;
      if (!id) {
        return reply.status(401).send({ error: 'Unauthorized: user ID not found in token' });
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
