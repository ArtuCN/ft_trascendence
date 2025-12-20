import { createElement } from '../utils/dom.js';
import { TestLiveChat } from '../components/TestLiveChat.js';

export class LiveChatPage {
	private element: HTMLElement;
	private liveChatComponent: TestLiveChat;

	constructor() {
		this.liveChatComponent = new TestLiveChat();
		this.element = this.createPage();
	}

	private createPage(): HTMLElement {
		console.log("creating live-chat page")
		const container = createElement('div', {
			className: 'p-6'
		});

		const title = createElement('h1', {
			className: 'text-3xl font-bold mb-6 text-sky-900',
			innerHTML: 'Live Chat - Testing'
		});

		container.appendChild(title);
		container.appendChild(this.liveChatComponent.getElement());

		return container;
	}

	getElement(): HTMLElement {
		return this.element;
	}

	destroy(): void {
		this.liveChatComponent.destroy();
	}
}
