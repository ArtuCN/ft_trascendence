import {socket,
		sendMessage,
		sendPrivateMessage,
		getAllSockets,
		getChatObject,
		startChat,
		addRecipient,
		} from "../lib/client-socket";
import { chat } from "@/types/SocketTypes";

export default function SocketComponent(): HTMLElement {
	const element = document.createElement("div");
	const status = document.createElement("p");
	const to = document.createElement("input");
	const input = document.createElement("input");
	const select = document.createElement("select");
	const button = document.createElement("button");
	const buttonPrivate = document.createElement("button");
	const buttonChat = document.createElement("button");
	const messages = document.createElement("div");

	//this only for dev -- done differently in production
	let sockets: string[] = [];
	let curr_chat: string = "";
	

	status.textContent = "Connecting to socket ...";
	input.placeholder = "type message";
	to.placeholder = "type user socket id";
	button.textContent = "send";
	buttonPrivate.textContent = "private send";
	buttonChat.textContent = "start chat";

	//styling
	select.style.margin = "0 8px";
	element.style.display = "grid";
	element.style.gridTemplateColumns = "1fr 1fr 1fr";
	element.style.gap = "8px";


	socket.on("connect", () => {
		status.textContent = `connected to: ${socket.id}`;
		getAllSockets();
	});

	socket.on("disconnect", () => {
		status.textContent = `disconnected from: ${socket.id}`;
	});

	socket.on("get_sockets", (allSockets: string[]) => {
		sockets = allSockets;
		select.innerHTML = "";
		sockets.forEach(id => {
			const option = document.createElement("option");
			option.value = id;
			option.textContent = id;
			select.appendChild(option);
		});
		console.log("sockets: ", allSockets);
	});

	buttonChat.addEventListener("click", () => {
		if (!select.value)
			return ;
		const recipients: string[] = [select.value];
		const chatId = startChat(recipients);
		curr_chat = chatId;
		const line = document.createElement("p");
		line.textContent = "curr_chat: " + curr_chat;
		messages.appendChild(line);
	});

	button.addEventListener("click", () => {
		const msg = input.value.trim();
		if (msg) {
			sendMessage(msg);
			input.value = "";
		}
	});

	buttonPrivate.addEventListener("click", () => {
		const msg = input.value.trim();
		const id = to.value.trim();
		if (msg && id) {
			const tmp_chat = getChatObject(id);
			console.log(tmp_chat);
			if (tmp_chat) {
				sendPrivateMessage(tmp_chat.recipients, msg);
				input.value = "";
				to.value = "";
			}
		}
	});

	socket.on("chat:message", (msg) => {
		const line = document.createElement("p");
		line.textContent = msg;
		messages.appendChild(line);
	});
	socket.on("private_message", ({from, msg}) => {
		const line = document.createElement("p");
		line.textContent = "PM: sent from: " + from + ", message: " + msg;
		messages.appendChild(line);
	});

	element.append(status, select, buttonChat, to, input, button, buttonPrivate, messages);
	return (element);
}
