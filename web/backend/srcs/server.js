import Fastify from 'fastify';
import sqlite3 from 'sqlite3';

const fastify = Fastify({
  logger: true
});

const { verbose } = sqlite3;
const db = new (verbose()).Database('./data/database.sqlite', (err) => {
  if (err) {
    console.error('error while opening db:', err);
  } else {
    console.log('DB opened successfully!');
  }
});

fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
