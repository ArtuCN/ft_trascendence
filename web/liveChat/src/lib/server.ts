// @ts-ignore
import Fastify from "fastify";
import type { FastifyRequest, FastifyReply } from "fastify";
import {dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";

export const PORT: number = Number(process.env.VITE_PORT) || 3000;
// export const PORT = 3001;
const fastify = Fastify();

export const fastifyServer = fastify.server;

// const __dirname = dirname(fileURLToPath(import.meta.url));

fastify.get("/", async (request: FastifyRequest, reply: FastifyReply) => {
	// console.log("dirname: ",__dirname);
	return { hello: 'world'};
});

export async function startServer() {
	return new Promise<void>((resolve, reject) => {
		fastify.listen({ port: PORT }, (err: Error | null, address: string) => {
			if (err) return reject(err);

			console.log(`Fastify server running at ${address} and port ${PORT}`);
			resolve();
			console.log("resolved");
		});
	});
}

