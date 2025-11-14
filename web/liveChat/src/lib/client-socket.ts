import { io } from "socket.io-client";
import { Socket } from "socket.io-client";
import { chat } from "@/types/SocketTypes";

export let	client_chat_ids: string[] = [];
export let	client_id_local: number = 0;
// @ts-ignore
export const socket: Socket = io(`${import.meta.env.VITE_API_URL}`);

socket.on("connect", async () => {
	const storedId: string | null = localStorage.getItem("client_id_websocket");
	if (storedId) {
		await saveClientId(parseInt(storedId));
		await getClientChats();
	}
	console.log("connected to socket server:", socket.id);
});

socket.on("chat:message", (msg) => {
	console.log("new message:", msg);
});

export function sendMessage(msg: string) {
	socket.emit("chat:message", msg);
}

export function saveClientId(client_id: number) {
	return new Promise((resolve) => {
		client_id_local = client_id;
		localStorage.setItem("client_id_websocket", client_id_local.toString());
		socket.emit("save_client_id", client_id);
		socket.once("save_client_id", (client_id) => {
			console.log("client id saved", client_id);
			resolve(client_id)
		});
	});
}

export async function sendPrivateMessage(chat_id: string, msg: string) {
	const tmp_chat: chat = await getChatObject(chat_id) as chat;
	console.log("tmp_chat", tmp_chat);
	if (tmp_chat && Array.isArray(tmp_chat.recipients)) {
		const recipients = tmp_chat.recipients;
		socket.emit("private_message", {recipients, msg});
	}
}

export function getAllSockets() {
	socket.emit("get_sockets");
}

export function getAllClients() {
	socket.emit("get_all_clients");
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




// setters -----------------------------------
export function startChat(recipients: number[], chat_name: string = "") {	
	return new Promise((resolve) => {

		console.log("in promise of startChat");
		socket.emit("create_chat", {recipients, chat_name});
		socket.once("create_chat", chat_id => {
			resolve(chat_id);
		});
	});
}

export async function addRecipient(chat_id: string, new_recipient: number) {
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


export function deleteRecipient(chat_id: string, client_id: number) {
	return new Promise((resolve) => {
		socket.emit("delete_recipient", {chat_id, client_id});
		socket.once("delete_recipient", client_id => {
			resolve(client_id);
		});
	});
}

