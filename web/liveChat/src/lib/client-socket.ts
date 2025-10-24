import { io } from "socket.io-client";
import { Socket } from "socket.io-client";
import { chat } from "@/types/SocketTypes";

const		chats: chat[] = [];
export let	client_chat_ids: string[] = [];
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

export function getClientChats() {
	return new Promise((resolve) => {
		socket.emit("get_client_chat_ids");
		socket.once("get_client_chat_ids", (chat_ids) => {
			client_chat_ids = chat_ids;
			console.log("client_chat_id: ", chat_ids);
			resolve(client_chat_ids);
		});
	});
}

export async function getChatObject(chat_id: string, chat_name: string = "") {
	return new Promise((resolve) => {
		if (!chat_name)
			socket.emit("get_chat_object", chat_id);
		else
			socket.emit("get_chat_object", chat_id, chat_name);

		socket.once("get_chat_object", temp_chat => {
			resolve(temp_chat as chat);
		});
	});
	
}

export async function getChatname(chat_id: string) {
		const chat : chat = await getChatObject(chat_id) as chat;
		return chat.chat_name as string;
}

export async function getChatIdFromName(chat_name: string) {
	const chat : chat = await getChatObject("x", chat_name) as chat;
	return chat.chat_name as string;
}

export function startChat(recipients: string[], recipient_ids: string[] = [], chat_name: string = "") {	
	return new Promise((resolve) => {

		console.log("in promise of startChat");
		socket.emit("create_chat", {recipients, recipient_ids, chat_name});
		socket.once("create_chat", chat_id => {
			resolve(chat_id);
		});
	});
}

export async function addRecipient(chat_id: string, new_recipient: string) {
	const curr_chat =  await getChatObject(chat_id);
	console.log("curr chat client side: ", curr_chat);
	// @ts-ignore
	if (curr_chat && !curr_chat.recipients.find(r => r === new_recipient)) {
		console.log("adding recipients ...");
		return new Promise((resolve) => {
			socket.emit("add_recipient", {chat_id, new_recipient});
			socket.once("add_recipient", recipients => {
				resolve(recipients);
			});
		});
	}
	else console.log("wrong chat_id or recipient already in chat");
}

