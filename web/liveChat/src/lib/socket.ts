// @ts-ignore
import { Server } from "socket.io";
import { fastifyServer} from "./server";
import "dotenv/config";

export let io: Server | undefined;

export function startSocket() {
	console.log("socket function");
	try {
		io = new Server(fastifyServer, {
			cors: {
				origin: "http://localhost:5173",
					methods: ["GET", "POST"]
			}
		});

		io.on('connection', (socket) => {
			console.log("a user connected:", socket.id);

			socket.on("disconnect", () => {
				console.log("user disconnected:", socket.id);
			});

			//simple message
			socket.on("chat:message", (msg) => {
				console.log("message:", msg);
				io?.emit("chat:message", msg);
			});

			////private message group
			//socket.on("private_message", ({to,msg}) => {
			//	console.log(`private message sent from ${socket.id} to ${to}`);
			//	const payload = { from: socket.id, to, msg };
			//	io?.to(to).to(socket.id).emit("private_message", payload);
			//});

			//group  private message
			socket.on("private_message", ({recipients, msg}) => {
				console.log(`private message sent from ${socket.id} to ${recipients}`);
				const payload = { from: socket.id, msg};
				recipients.foreach((recipient: string) => (
					io?.to(recipient).emit("private_message", payload)
				));
			});

			//pass all the existing sockets
			socket.on("get_sockets", () => {
				const allSockets = getAllSockets();
				io?.to(socket.id).emit("get_sockets", allSockets);
				console.log("sent sockets: ", allSockets);
			});

		});

		console.log("Socket.io server started");
	} catch (error) {
		console.log(error);
	}
}

export function getAllSockets() {
	return Array.from(io?.sockets.sockets.keys() || []);
}
