"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = exports.fastifyServer = exports.PORT = void 0;
// @ts-ignore
const fastify_1 = require("fastify");
// export const PORT: number = Number(process.env.PORT) || 3000;
exports.PORT = 3001;
const fastify = (0, fastify_1.default)();
exports.fastifyServer = fastify.server;
// const __dirname = dirname(fileURLToPath(import.meta.url));
fastify.get("/", async (request, reply) => {
    // console.log("dirname: ",__dirname);
    return { hello: 'world' };
});
async function startServer() {
    return new Promise((resolve, reject) => {
        fastify.listen({ port: exports.PORT }, (err, address) => {
            if (err)
                return reject(err);
            console.log(`Fastify server running at ${address} and port ${exports.PORT}`);
            resolve();
            console.log("resolved");
        });
    });
}
exports.startServer = startServer;
