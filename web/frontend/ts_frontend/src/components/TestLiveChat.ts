import {
	socket,
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
} from "../liveChat/socketConnection";
import { chat } from "../types/socketTypes";

export class TestLiveChat {
	private element: HTMLElement;
	private status: HTMLParagraphElement;
	private input: HTMLInputElement;
	private selectChat: HTMLSelectElement;
	private select: HTMLSelectElement;
	private clientId: HTMLInputElement;
	private button: HTMLButtonElement;
	private buttonPrivate: HTMLButtonElement;
	private buttonChat: HTMLButtonElement;
	private buttonAddRecipient: HTMLButtonElement;
	private buttonDeleteRecipient: HTMLButtonElement;
	private buttonClientId: HTMLButtonElement;
	private messages: HTMLDivElement;

	private sockets: string[] = [];
	private clients: number[] = [];
	private curr_chat: string = "";

	constructor() {
		console.log("creating live-chat component")	
		this.element = document.createElement("div");
		this.status = document.createElement("p");
		this.input = document.createElement("input");
		this.selectChat = document.createElement("select");
		this.select = document.createElement("select");
		this.clientId = document.createElement("input");
		this.button = document.createElement("button");
		this.buttonPrivate = document.createElement("button");
		this.buttonChat = document.createElement("button");
		this.buttonAddRecipient = document.createElement("button");
		this.buttonDeleteRecipient = document.createElement("button");
		this.buttonClientId = document.createElement("button");
		this.messages = document.createElement("div");

		this.initializeComponent();
		this.setupSocketListeners();
		console.log("created live-chat component")
	}

	private initializeComponent(): void {
		this.element.style.color = "black"
		this.status.textContent = "Connecting to socket ...";
		this.input.placeholder = "type message";
		this.clientId.placeholder = "client id";

		this.button.textContent = "refresh";
		this.buttonPrivate.textContent = "private send";
		this.buttonChat.textContent = "start chat";
		this.buttonAddRecipient.textContent = "add new recipient";
		this.buttonDeleteRecipient.textContent = "delete recipient";
		this.buttonClientId.textContent = "client id";

		this.select.style.margin = "0 8px";
		this.select.style.border = "2px";
		this.selectChat.style.border = "2px";
		this.selectChat.style.margin = "0 8px";
		this.element.style.display = "grid";
		this.element.style.gridTemplateColumns = "1fr 1fr 1fr";
		this.element.style.gap = "8px";

		this.setupEventListeners();
		this.buildElement();
	}

	private setupEventListeners(): void {
		this.buttonChat.addEventListener("click", async () => {
			if (!this.select.value) return;
			const recipients: number[] = [Number(this.select.value.trim())];
			const chatId = await startChat(recipients);
			console.log("curr_chat: " + chatId + ", recipients: " + recipients);
			const line = document.createElement("p");
			line.textContent = "curr_chat: " + chatId + ", recipients: " + recipients;
			this.messages.appendChild(line);
			await getClientChats();
			getAllClients();
			this.updateElementclientChats();
		});

		this.buttonAddRecipient.addEventListener("click", async () => {
			if (!this.select.value || !this.selectChat.value) return;
			const recipients = await addRecipient(this.selectChat.value, Number(this.select.value));
			console.log("recipients: ", recipients);
			const line = document.createElement("p");
			line.textContent = "new recipients: " + recipients;
			this.messages.appendChild(line);
		});

		this.buttonDeleteRecipient.addEventListener("click", async () => {
			if (!this.select.value || !this.selectChat.value) return;
			const deleted_id = await deleteRecipient(this.selectChat.value, Number(this.select.value));
			console.log("recipient deleted: ", deleted_id);
			const line = document.createElement("p");
			line.textContent = "deleted recipient: " + deleted_id;
			this.messages.appendChild(line);
		});

		this.button.addEventListener("click", async () => {
			getAllClients();
			await getClientChats();
		});

		this.buttonPrivate.addEventListener("click", async () => {
			const msg = this.input.value.trim();
			const id = this.selectChat.value.trim();
			if (msg && id) {
				sendPrivateMessage(id, msg);
				this.input.value = "";
			}
		});

		this.buttonClientId.addEventListener("click", async () => {
			const id: number = Number(this.input.value.trim());
			if (id) {
				const saved_id: number = await saveClientId(id) as number;
				this.input.value = "";
				if (saved_id === id) {
					const line = document.createElement("p");
					line.textContent = "id was saved: " + id.toString();
					this.messages.appendChild(line);
				}
			}
		});
	}

	private setupSocketListeners(): void {
		socket.on("connect", async () => {
			this.status.textContent = `connected to: ${socket.id}`;
			getAllClients();
			await getClientChats();
			this.updateElementclientChats();
		});

		socket.on("disconnect", () => {
			this.status.textContent = `disconnected from: ${socket.id}`;
		});

		socket.on("get_all_clients", (allClientIds: number[]) => {
			this.clients = allClientIds;
			this.select.innerHTML = "";
			this.clients.forEach(id => {
				const option = document.createElement("option");
				option.value = id.toString();
				option.textContent = id.toString();
				this.select.appendChild(option);
			});
			console.log("clients: ", allClientIds);
		});

		socket.on("get_client_chat_ids", (chat_ids) => {
			this.updateElementclientChats();
		});

		socket.on("chat:message", (msg) => {
			const line = document.createElement("p");
			line.textContent = msg;
			this.messages.appendChild(line);
		});

		socket.on("private_message", ({ from, msg }) => {
			const line = document.createElement("p");
			line.textContent = "PM: sent from: " + from + ", message: " + msg;
			this.messages.appendChild(line);
		});
	}

	private updateElementclientChats(): void {
		this.selectChat.innerHTML = "";
		client_chat_ids.forEach(id => {
			const option = document.createElement("option");
			option.value = id;
			option.textContent = id;
			this.selectChat.appendChild(option);
		});
	}

	private buildElement(): void {
		this.element.append(
			this.status,
			this.select,
			this.buttonChat,
			this.selectChat,
			this.input,
			this.button,
			this.buttonPrivate,
			this.buttonAddRecipient,
			this.buttonClientId,
			this.buttonDeleteRecipient,
			this.messages
		);
	}

	getElement(): HTMLElement {
		return this.element;
	}

	destroy(): void {
		socket.off("connect");
		socket.off("disconnect");
		socket.off("get_all_clients");
		socket.off("get_client_chat_ids");
		socket.off("chat:message");
		socket.off("private_message");
	}
}
