import { updateUserLastActive, getUserLastActive } from '../database_comunication/user_db.js';

export default async function (fastify, opts) {
	/**
	* POST /api/heartbeat
	* Requires Authorization: Bearer <token>
	* decorator in server.js verifies and sets request.user
	*/
	fastify.post('/heartbeat', {
		preHandler: [fastify.authenticate],
	}, async (request, reply) => {
		try {
			console.log('Heartbeat request.user:', request.user);
			const userId = request.user && request.user.id;
			console.log('Extracted userId:', userId);
			
			if (!userId) {
				console.log('No userId found in request.user');
				return reply.code(400).send({ error: 'Invalid user payload' });
			}

			const { offline } = request.body || {};
			let timestamp;

			if (offline) {
				// Se offline, imposta last_active a una data molto vecchia (1 gennaio 2000)
				timestamp = new Date('2000-01-01').toISOString();
			} else {
				// Altrimenti usa il timestamp corrente
				timestamp = new Date(Date.now()).toISOString();
			}

			await updateUserLastActive(userId, timestamp);

			return reply.code(200).send({ ok: true });
		} catch (err) {
			console.error('Heartbeat error:', err);
			request.log.error(err);
			return reply.code(500).send({ error: 'Failed to update heartbeat' });
		}
	});

	// heartbeat/get?id=123
	fastify.get('/heartbeat/get', async (request, reply) => {
		try {
			const { id } = request.query;
			if (!id) {
				return reply.code(400).send({ error: 'Missing id' });
			}

			const last_active = await getUserLastActive(id);
			return	reply.code(200).send(last_active);;
		} catch (error) {
			console.log(error);
			return reply.code(500).send({ error: 'Server error: ' + error.message });
		}
	});
}

