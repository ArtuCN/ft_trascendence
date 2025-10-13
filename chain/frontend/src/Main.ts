// import { Buffer } from 'buffer'
import Fastify from "fastify";
import { fastifyView } from "@fastify/view";
import * as ejs from "ejs";
// import app from "./App.tsx";

const server = Fastify();
const PORT = 3000;


server.register(fastifyView, {
	engine: {
		ejs: ejs
	},
	root: __dirname + "/views",
	layout: "layout.ejs"
});

// server.register(app, { prefix: "/staking" });


server.get("/", async (req, reply) => {
	req = req;
	return reply.viewAsync("staking.ejs", { title: "Staking dApp" });
});

server.listen({ port: PORT }, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`🚀 Backend running at ${address}`);
});
