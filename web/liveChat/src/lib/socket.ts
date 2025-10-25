// @ts-ignore
import { Server } from "socket.io";
import { fastifyServer} from "./server";
import { chat, startChatProps } from "@/types/SocketTypes";
import "dotenv/config";

export let io: Server | undefined;
const chats: chat[] = [];

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

			//create group chat -----------------------------------
			socket.on("create_chat", ({recipients,
									 recipient_ids = [],
										 chat_name = ""
			}: startChatProps) => {
				const updateRecipients = [ ...recipients];
				if (typeof socket.id?.toString() === "string") {
					console.log("added socket to recipients");
					updateRecipients.push(socket.id.toString());
				}
				const chat_id = crypto.randomUUID().toString();
				// console.log("updated recipients: ", updateRecipients);
				const temp_chat = {
					chat_id: chat_id,
					chat_name: chat_name,
					recipients: updateRecipients,
					recipient_ids: recipient_ids ? recipient_ids : undefined
				};
				chats.push(temp_chat);

				//emit event with chat id -----------------------------------
				updateRecipients.forEach((r: string) => {
					io?.to(r).emit("create_chat", chat_id);
				});
				console.log("new chat id:", chat_id, "recipients:", updateRecipients);
			});

			//add new recipient to group chat -----------------------------------
			socket.on("add_recipient", ({chat_id, new_recipient}) => {
				const curr_chat = chats.find((c: chat) => c.chat_id === chat_id);
				if (curr_chat && !curr_chat.recipients.find((r: string) => r === new_recipient)) {
					curr_chat.recipients.push(new_recipient);
					console.log(curr_chat.chat_id, " has recipients: ", curr_chat.recipients);
					curr_chat.recipients.forEach((r: string) => {
						io?.to(r).emit("add_recipient", curr_chat.recipients);
					});
					console.log("added recipient:", new_recipient, " to chat:", chat_id);
				}
				else console.log("wrong chat_id or recipient already in chat");

			});

			// delete client from chat -----------------------------------
			socket.on("delete_recipient", ({chat_id, client_id}) => {
				const curr_chat = chats.find((c: chat) => c.chat_id === chat_id);
				if (curr_chat && curr_chat.recipients.find((r: string) => r === client_id)) {
					const i  = curr_chat.recipients.indexOf(client_id);
					if (i !== -1) {
						curr_chat.recipients.splice(i, 1);
						curr_chat.recipients.forEach((r: string) => {
							io?.to(r).emit("delete_recipient", client_id);
						});
						console.log("deleted recipient:", client_id, " from chat:", chat_id);
					}
				}
				else console.log("wrong chat_id or recipient not in chat");
			});

			//get all chats client is in -----------------------------------
			socket.on("get_client_chat_ids", () => {
				const chat_ids = chats
					.filter((c: chat) =>{
						return c.recipients.find((r: string) => r === socket.id.toString());})
					.map((c: chat) => c.chat_id);

				io?.to(socket.id).emit("get_client_chat_ids", chat_ids);
			});

			socket.on("get_chat_object", (chat_id: string, chat_name: string = "") => {
				let temp_chat;
				if (!chat_name)
					temp_chat = chats.find((c: chat) => c.chat_id === chat_id);
				else
					temp_chat = chats.find((c: chat) => c.chat_name === chat_name);
				if (temp_chat)
					io?.to(socket.id).emit("get_chat_object", temp_chat as chat);
			});


			//group  private message -----------------------------------
			socket.on("private_message", ({recipients, msg}) => {
				console.log(`private message sent from ${socket.id} to ${recipients}`);
				const payload = { from: socket.id, msg};
				recipients.forEach((recipient: string) => (
					io?.to(recipient).emit("private_message", payload)
				));
			});

			//pass all the existing sockets -----------------------------------
			socket.on("get_sockets", () => {
				const allSockets = getAllSockets();
				io?.to(socket.id).emit("get_sockets", allSockets);
				console.log("sent sockets: ", allSockets);
			});

		});

		// ----- end of socket APIs ------------------------------------
		console.log("Socket.io server started");
	} catch (error) {
		console.log(error);
	}
}

// get all sockets that are connected to the server (only for developing) -----------------------------------
export function getAllSockets() {
	return Array.from(io?.sockets.sockets.keys() || []);
}
