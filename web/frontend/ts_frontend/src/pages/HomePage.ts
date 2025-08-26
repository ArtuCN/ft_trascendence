import { createElement } from '../utils/dom.js';

export class HomePage {
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
      innerHTML: 'Benvenuto a ft_transcendence'
    });

    const mainCard = createElement('div', {
      className: 'bg-white rounded-lg shadow-md p-8'
    });

    const description = createElement('p', {
      className: 'text-gray-600 text-lg mb-8',
      innerHTML: 'Il classico gioco Pong reimplementato con tecnologie moderne. Sfida i tuoi amici o gioca contro l\'IA!'
    });

    const gameModesGrid = createElement('div', {
      className: 'grid grid-cols-1 md:grid-cols-2 gap-6'
    });

    const gameModes = [
      { 
        title: 'Gioco Locale', 
        description: 'Due giocatori sullo stesso computer',
        bgClass: 'bg-blue-50', 
        textClass: 'text-blue-800',
      },
      { 
        title: 'Gioco Online', 
        description: 'Sfida giocatori da tutto il mondo',
        bgClass: 'bg-green-50', 
        textClass: 'text-green-800',
      },
      { 
        title: 'VS Intelligenza Artificiale', 
        description: 'Metti alla prova le tue abilità contro l\'IA',
        bgClass: 'bg-purple-50', 
        textClass: 'text-purple-800',
      },
      { 
        title: 'Torneo', 
        description: 'Partecipa a tornei competitivi',
        bgClass: 'bg-orange-50', 
        textClass: 'text-orange-800',
      }
    ];

    gameModes.forEach(mode => {
      const modeCard = createElement('div', {
        className: `${mode.bgClass} p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer`
      });

      const modeTitle = createElement('h3', {
        className: `font-semibold ${mode.textClass} mb-2`,
        innerHTML: mode.title
      });

      const modeDescription = createElement('p', {
        className: 'text-gray-600 text-sm',
        innerHTML: mode.description
      });

      modeCard.appendChild(modeTitle);
      modeCard.appendChild(modeDescription);
      gameModesGrid.appendChild(modeCard);
    });

    mainCard.appendChild(description);
    mainCard.appendChild(gameModesGrid);
    container.appendChild(title);
    container.appendChild(mainCard);

    return container;
  }

  getElement(): HTMLElement {
    return this.element;
  }

  destroy(): void {
  }
}
