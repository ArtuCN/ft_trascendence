import {socket,
		sendMessage,
		saveClientId,
		sendPrivateMessage,
		getAllSockets,
		getChatObject,
		startChat,
		addRecipient,
		deleteRecipient,
        getClientChats,
		client_chat_ids,
        getAllClients,
		} from "../lib/client-socket";
import { chat } from "@/types/SocketTypes";

export default function SocketComponent(): HTMLElement {
	//main elements
	const element = document.createElement("div");
	const status = document.createElement("p");

	//inputs/selects
	const input = document.createElement("input");
	const selectChat = document.createElement("select");
	const select = document.createElement("select");
	const clientId = document.createElement("input");

	//buttons
	const button = document.createElement("button");
	const buttonPrivate = document.createElement("button");
	const buttonChat = document.createElement("button");
	const buttonAddRecipient = document.createElement("button");
	const buttonDeleteRecipient = document.createElement("button");
	const buttonClientId = document.createElement("button");

	//logs
	const messages = document.createElement("div");

	//this only for dev -- done differently in production
	let sockets: string[] = [];
	let clients: number[] = [];
	let curr_chat: string = "";
	

	status.textContent = "Connecting to socket ...";
	input.placeholder = "type message";
	clientId.placeholder = "client id";

	//button values placeholders
	button.textContent = "refresh";
	buttonPrivate.textContent = "private send";
	buttonChat.textContent = "start chat";
	buttonAddRecipient.textContent = "add new recipient";
	buttonDeleteRecipient.textContent = "delete recipient";
	buttonClientId.textContent = "client id";

	//styling
	select.style.margin = "0 8px";
	selectChat.style.margin = "0 8px";
	element.style.display = "grid";
	element.style.gridTemplateColumns = "1fr 1fr 1fr";
	element.style.gap = "8px";

	function updateElementclientChats() {
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
		// getAllSockets();
		getAllClients();
		await getClientChats();
		updateElementclientChats();
	});

	socket.on("disconnect", () => {
		status.textContent = `disconnected from: ${socket.id}`;
	});

	socket.on("get_all_clients", (allClientIds: number[]) => {
		clients = allClientIds;
		select.innerHTML = "";
		clients.forEach(id => {
			const option = document.createElement("option");
			option.value = id.toString();
			option.textContent = id.toString();
			select.appendChild(option);
		});
		console.log("clients: ", allClientIds);
	});



	socket.on("get_client_chat_ids", (chat_ids) => {
		updateElementclientChats();
	});

	buttonChat.addEventListener("click", async () => {
		if (!select.value)
			return ;
		const recipients: number[] = [Number(select.value.trim())];
		const chatId = await startChat(recipients);
		console.log("curr_chat: " + chatId + ", recipients: " + recipients);
		const line = document.createElement("p");
		line.textContent = "curr_chat: " + chatId + ", recipients: " + recipients;
		messages.appendChild(line);
		await getClientChats();
		updateElementclientChats();
	});

	buttonAddRecipient.addEventListener("click", async () => {
		if (!select.value || !selectChat.value)
			return ;
		const recipients = await addRecipient(selectChat.value, Number(select.value));
		console.log("recipients: ", recipients);
		const line = document.createElement("p");
		line.textContent = "new recipients: " + recipients;
		messages.appendChild(line);
	});


	buttonDeleteRecipient.addEventListener("click", async () => {
		if (!select.value || !selectChat.value)
			return ;
		const deleted_id = await deleteRecipient(selectChat.value, Number(select.value));
		console.log("recipient deleted: ", deleted_id);
		const line = document.createElement("p");
		line.textContent = "deleted recipient: " + deleted_id;
		messages.appendChild(line);
	});

	button.addEventListener("click", async () => {
		// getAllSockets();
		getAllClients();
		await getClientChats();
	});

	buttonPrivate.addEventListener("click", async () => {
		const msg = input.value.trim();
		const id = selectChat.value.trim();
		if (msg && id) {
			sendPrivateMessage(id, msg);
			input.value = "";
		}
	});

	buttonClientId.addEventListener("click", async () => {
		const id : number = Number(input.value.trim());
		if (id) {
			const saved_id : number = await saveClientId(id) as number;
			input.value = "";
			if (saved_id === id) {
				const line = document.createElement("p");
				line.textContent = "id was saved: " + id.toString();
				messages.appendChild(line);
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

	element.append(status, select, buttonChat, selectChat, input, button, buttonPrivate, buttonAddRecipient, buttonClientId, buttonDeleteRecipient, messages);
	return (element);
}
