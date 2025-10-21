import { io } from "socket.io-client";
import { Socket } from "socket.io-client";
import { chat } from "@/types/SocketTypes";

const chats: chat[] = [];
// @ts-ignore
export const socket: Socket = io(`${import.meta.env.VITE_API_URL}`);

socket.on("connect", () => {
	console.log("connected to socket server:", socket.id);
});

socket.on("chat:message", (msg) => {
	console.log("new message:", msg);
});

export function sendMessage(msg: string) {
	socket.emit("chat:message", msg);
}

export function sendPrivateMessage(recipients: string[], msg: string) {
	socket.emit("private_message", {recipients, msg});
}

export function getAllSockets() {
	socket.emit("get_sockets");
}

export function getChatObject(chat_id: string, chat_name: string = "") {
	return chats.find(c => c.chat_id === chat_id);
}

export function startChat(recipients: string[], recipient_ids: string[] = [], chat_name: string = "") {	
	const updateRecipients = [ ...recipients];
	if (typeof socket.id === "string")
		updateRecipients.push(socket.id);
	const chat_id = crypto.randomUUID().toString();
	const temp_chat = {
		chat_id: chat_id,
		chat_name: chat_name,
		recipients: updateRecipients,
		recipient_ids: recipient_ids ? recipient_ids : undefined
	};
	chats.push(temp_chat);
	return (chat_id);
}

export function addRecipient(chat_id: string, new_recipient: string) {
	const curr_chat = chats.find((c) => c.chat_id === chat_id);
	if (curr_chat)
		curr_chat.recipients.push(new_recipient);
}
	
