import { uploadAvatar_db, getAvatar_db } from "../database_comunication/user_db.js";

export default async function (fastify, opts) {
  fastify.post('/avatar', async (req, reply) => {
    try {
      const file = await req.file();
      if (!file) {
        return reply.status(400).send({ error: 'Nessun file ricevuto' });
      }

      const id = req.body?.id; // se lo invii come campo nel form
      const buffer = await file.toBuffer();
      const base64Avatar = buffer.toString('base64');

      await uploadAvatar_db(id, base64Avatar);
      reply.status(200).send({ message: 'Avatar uploaded successfully' });
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
      // rispedisci come immagine base64 o buffer
      reply
        .header('Content-Type', 'image/png')
        .send(Buffer.from(avatar, 'base64'));
    } catch (error) {
      console.error(error);
      reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
}
