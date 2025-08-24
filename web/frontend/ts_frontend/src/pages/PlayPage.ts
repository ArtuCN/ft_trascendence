import { createElement } from '../utils/dom.js';

export class PlayPage {
  private element: HTMLElement;

  constructor() {
    this.element = this.createPage();
  }

  private createPage(): HTMLElement {
    const container = createElement('div', {
      className: 'p-6'
    });

    const title = createElement('h1', {
      className: 'text-3xl font-bold text-gray-800 mb-6',
      innerHTML: 'Gioca'
    });

    const content = createElement('div', {
      className: 'bg-white rounded-lg shadow-md p-6'
    });

    const description = createElement('p', {
      className: 'text-gray-600',
      innerHTML: 'Inizia una nuova partita di Pong!'
    });

    content.appendChild(description);
    container.appendChild(title);
    container.appendChild(content);

    return container;
  }

  getElement(): HTMLElement {
    return this.element;
  }

  destroy(): void {
  }
}
