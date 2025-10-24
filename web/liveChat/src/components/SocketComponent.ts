import {socket,
		sendMessage,
		sendPrivateMessage,
		getAllSockets,
		getChatObject,
		startChat,
		addRecipient,
        getClientChats,
		client_chat_ids,
		} from "../lib/client-socket";
import { chat } from "@/types/SocketTypes";

export default function SocketComponent(): HTMLElement {
	const element = document.createElement("div");
	const status = document.createElement("p");
	const input = document.createElement("input");
	const selectChat = document.createElement("select");
	const select = document.createElement("select");
	const button = document.createElement("button");
	const buttonPrivate = document.createElement("button");
	const buttonChat = document.createElement("button");
	const buttonAddRecipient = document.createElement("button");
	const messages = document.createElement("div");

	//this only for dev -- done differently in production
	let sockets: string[] = [];
	let curr_chat: string = "";
	

	status.textContent = "Connecting to socket ...";
	input.placeholder = "type message";
	button.textContent = "refresh";
	buttonPrivate.textContent = "private send";
	buttonChat.textContent = "start chat";
	buttonAddRecipient.textContent = "add new recipient";

	//styling
	select.style.margin = "0 8px";
	selectChat.style.margin = "0 8px";
	element.style.display = "grid";
	element.style.gridTemplateColumns = "1fr 1fr 1fr";
	element.style.gap = "8px";

	function clientChats() {
		selectChat.innerHTML = "";
		client_chat_ids.forEach( id => {
			const option = document.createElement("option");
			option.value = id;
			option.textContent = id;
			selectChat.appendChild(option);
		});
	};

	socket.on("connect", async () => {
		status.textContent = `connected to: ${socket.id}`;
		getAllSockets();
		await getClientChats();
		clientChats();
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

	socket.on("get_client_chat_ids", (chat_ids) => {
		clientChats();
	});

	buttonChat.addEventListener("click", async () => {
		if (!select.value)
			return ;
		const recipients: string[] = [select.value];
		const chatId = await startChat(recipients);
		console.log("curr_chat: " + chatId + ", recipients: " + recipients);
		const line = document.createElement("p");
		line.textContent = "curr_chat: " + chatId + ", recipients: " + recipients;
		messages.appendChild(line);
		await getClientChats();
		clientChats();
	});

	buttonAddRecipient.addEventListener("click", async () => {
		if (!select.value || !selectChat.value)
			return ;
		const recipients = await addRecipient(selectChat.value, select.value);
		console.log("recipients: ", recipients);
		const line = document.createElement("p");
		line.textContent = "new recipients: " + recipients;
		messages.appendChild(line);
	});

	button.addEventListener("click", async () => {
		getAllSockets();
		await getClientChats();
	});

	buttonPrivate.addEventListener("click", async () => {
		const msg = input.value.trim();
		const id = selectChat.value.trim();
		if (msg && id) {
			const tmp_chat = await getChatObject(id);
			console.log("tmp_chat", tmp_chat);
			// @ts-ignore
			if (tmp_chat && Array.isArray(tmp_chat.recipients)) {
			// @ts-ignore
				sendPrivateMessage(tmp_chat.recipients, msg);
				input.value = "";
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

	element.append(status, select, buttonChat, selectChat, input, button, buttonPrivate, buttonAddRecipient, messages);
	return (element);
}
