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
      className: 'text-3xl font-bold mb-6 text-sky-900',
      innerHTML: 'Benvenuto a ft_transcendence'
    });

    const mainCard = createElement('div', {
      className: 'bg-white/80 rounded-lg shadow-md p-8 border border-sky-100'
    });

    const description = createElement('p', {
      className: 'text-sky-700 text-lg mb-8',
      innerHTML: 'Il classico gioco Pong reimplementato con tecnologie moderne. Sfida i tuoi amici o gioca contro l\'IA!'
    });

    const gameModesGrid = createElement('div', {
      className: 'grid grid-cols-1 md:grid-cols-2 gap-6'
    });

    const gameModes = [
      { 
        title: 'Gioco Locale', 
        description: 'Due giocatori sullo stesso computer',
        bgClass: 'bg-sky-50', 
        textClass: 'text-sky-800',
      },
      { 
        title: 'Gioco Online', 
        description: 'Sfida giocatori da tutto il mondo',
        bgClass: 'bg-cyan-50', 
        textClass: 'text-cyan-800',
      },
      { 
        title: 'VS Intelligenza Artificiale', 
        description: 'Metti alla prova le tue abilità contro l\'IA',
        bgClass: 'bg-blue-50', 
        textClass: 'text-blue-800',
      },
      { 
        title: 'Torneo', 
        description: 'Partecipa a tornei competitivi',
        bgClass: 'bg-indigo-50', 
        textClass: 'text-indigo-800',
      }
    ];

    gameModes.forEach(mode => {
      const modeCard = createElement('div', {
        className: `${mode.bgClass} p-6 rounded-lg border border-sky-100 hover:shadow-lg transition-shadow cursor-pointer`
      });

      const modeTitle = createElement('h3', {
        className: `font-semibold ${mode.textClass} mb-2`,
        innerHTML: mode.title
      });

      const modeDescription = createElement('p', {
        className: 'text-sky-600 text-sm',
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
