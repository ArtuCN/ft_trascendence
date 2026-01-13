import { createElement, createButton } from '../utils/dom.js';
import { router } from '../router/router.js';

export class HomePage {
  private element: HTMLElement;

  constructor() {
    this.element = this.createPage();
  }

  private createPage(): HTMLElement {
    // Page container - sfondo scuro con griglia prospettica
    const container = createElement('div', {
      className: 'min-h-screen flex items-center justify-center',
      style: 'background: linear-gradient(180deg, #0a0e27 0%, #1a1436 100%);'
    });

    // Central content wrapper - più compatto come nell'immagine
    const content = createElement('div', {
      className: 'flex flex-col items-center gap-8 max-w-4xl mx-auto'
    });

    // =====================
    // TITLE - Stile retro/glitch come nell'immagine (INGRANDITO)
    // =====================
    const titleContainer = createElement('div', {
      className: 'text-center mb-8'
    });

    const onlineText = createElement('h1', {
      className: 'text-9xl font-black tracking-wider mb-3',
      innerHTML: 'ONLINE',
      style:
        'color: #00e5ff; text-shadow: 0 0 30px rgba(0, 229, 255, 0.9), 0 0 60px rgba(0, 229, 255, 0.6), 3px 3px 0 #ff00ff, -3px -3px 0 #00ffff; letter-spacing: 0.15em; font-family: "Press Start 2P", "Courier New", monospace; font-size: 7rem;'
    });

    const pongText = createElement('h1', {
      className: 'text-9xl font-black tracking-wider',
      innerHTML: 'PONG',
      style:
        'background: linear-gradient(180deg, #ff00ff 0%, #ff6ec7 50%, #00e5ff 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-shadow: 0 0 40px rgba(255, 110, 199, 0.9); letter-spacing: 0.15em; font-family: "Press Start 2P", "Courier New", monospace; font-size: 7rem;'
    });

    titleContainer.appendChild(onlineText);
    titleContainer.appendChild(pongText);

    // =====================
    // MAIN BUTTONS - Come nell'immagine: QUICK PLAY (azzurro) e CREATE MATCH (rosa) - INGRANDITI
    // =====================
    const buttonsContainer = createElement('div', {
      className: 'flex gap-8 mb-10'
    });

    const quickPlayButton = createButton(
      'QUICK PLAY',
      'text-white font-bold text-2xl px-16 py-5 rounded-md transition-all transform hover:scale-105 border-3 uppercase tracking-wider',
      () => router.navigate('/play')
    );
    quickPlayButton.style.background = 'rgba(0, 229, 255, 0.1)';
    quickPlayButton.style.borderColor = '#00e5ff';
    quickPlayButton.style.borderWidth = '3px';
    quickPlayButton.style.color = '#00e5ff';
    quickPlayButton.style.boxShadow = '0 0 30px rgba(0, 229, 255, 0.6), inset 0 0 30px rgba(0, 229, 255, 0.15)';
    quickPlayButton.style.fontFamily = '"Press Start 2P", "Courier New", monospace';
    quickPlayButton.style.fontSize = '1.1rem';

    const createMatchButton = createButton(
      'CREATE MATCH',
      'text-white font-bold text-2xl px-16 py-5 rounded-md transition-all transform hover:scale-105 border-3 uppercase tracking-wider',
      () => router.navigate('/play3D')
    );
    createMatchButton.style.background = 'rgba(255, 110, 199, 0.1)';
    createMatchButton.style.borderColor = '#ff6ec7';
    createMatchButton.style.borderWidth = '3px';
    createMatchButton.style.color = '#ff6ec7';
    createMatchButton.style.boxShadow = '0 0 30px rgba(255, 110, 199, 0.6), inset 0 0 30px rgba(255, 110, 199, 0.15)';
    createMatchButton.style.fontFamily = '"Press Start 2P", "Courier New", monospace';
    createMatchButton.style.fontSize = '1.1rem';

    buttonsContainer.appendChild(quickPlayButton);
    buttonsContainer.appendChild(createMatchButton);

    // =====================
    // BOTTOM SECTION - Due box affiancati come nell'immagine - INGRANDITI
    // =====================
    const bottomSection = createElement('div', {
      className: 'flex gap-10 w-full max-w-5xl'
    });

    // Leaderboards Box - Stile retro con bordo neon azzurro
    const leaderboardsBox = createElement('div', {
      className: 'flex-1 rounded-lg p-8 border-3',
      style:
        'background: rgba(10, 14, 39, 0.8); border-color: #00e5ff; border-width: 3px; box-shadow: 0 0 30px rgba(0, 229, 255, 0.5), inset 0 0 40px rgba(0, 229, 255, 0.08);'
    });

    const leaderboardsTitle = createElement('h2', {
      className: 'text-2xl font-bold mb-6 uppercase tracking-wider',
      innerHTML: 'LEADERBOARDS',
      style: 'color: #00e5ff; letter-spacing: 0.15em; font-family: "Press Start 2P", "Courier New", monospace; font-size: 1.3rem;'
    });

    const leaderboardsList = createElement('div', {
      className: 'space-y-2'
    });

    const leaders = [
      { rank: 1, name: 'AB', score: 10 },
      { rank: 2, name: 'HB', score: 9 },
      { rank: 3, name: 'ID', score: 6 },
      { rank: 4, name: 'IA', score: 0 }
    ];

    leaders.forEach(leader => {
      const row = createElement('div', {
        className: 'flex justify-between items-center text-white px-4 py-2',
        style: 'font-family: "Courier New", monospace; font-size: 1.2rem;'
      });
      
      const leftSpan = createElement('span', {
        innerHTML: `${leader.rank}. ${leader.name}`,
        style: 'color: #00e5ff; font-weight: bold; font-size: 1.2rem;'
      });
      
      const rightSpan = createElement('span', {
        innerHTML: `${leader.score}`,
        className: 'font-bold',
        style: 'color: #ffffff; font-size: 1.2rem;'
      });
      
      row.appendChild(leftSpan);
      row.appendChild(rightSpan);
      leaderboardsList.appendChild(row);
    });

    leaderboardsBox.appendChild(leaderboardsTitle);
    leaderboardsBox.appendChild(leaderboardsList);

    // Current Matches Box - Stile retro con bordo neon rosa
    const matchesBox = createElement('div', {
      className: 'flex-1 rounded-lg p-8 border-3',
      style:
        'background: rgba(10, 14, 39, 0.8); border-color: #ff6ec7; border-width: 3px; box-shadow: 0 0 30px rgba(255, 110, 199, 0.5), inset 0 0 40px rgba(255, 110, 199, 0.08);'
    });

    const matchesTitle = createElement('h2', {
      className: 'text-2xl font-bold mb-6 uppercase tracking-wider',
      innerHTML: 'CURRENT MATCHES',
      style: 'color: #ff6ec7; letter-spacing: 0.15em; font-family: "Press Start 2P", "Courier New", monospace; font-size: 1.3rem;'
    });

    const matchesList = createElement('div', {
      className: 'space-y-3'
    });

    const matches = [
      { player1: '🔴', score1: 1, player2: '🔵', score2: 2 },
      { player1: '🟠', score1: 1, player2: '🟢', score2: 1 }
    ];

    matches.forEach(match => {
      const matchRow = createElement('div', {
        className: 'flex justify-center items-center gap-6 py-2',
        style: 'font-family: "Courier New", monospace;'
      });
      
      const player1 = createElement('span', {
        innerHTML: match.player1,
        className: 'text-3xl'
      });
      
      const score = createElement('span', {
        innerHTML: `${match.score1} - ${match.score2}`,
        className: 'font-bold text-white mx-3',
        style: 'font-size: 1.4rem;'
      });
      
      const player2 = createElement('span', {
        innerHTML: match.player2,
        className: 'text-3xl'
      });
      
      matchRow.appendChild(player1);
      matchRow.appendChild(score);
      matchRow.appendChild(player2);
      matchesList.appendChild(matchRow);
    });

    matchesBox.appendChild(matchesTitle);
    matchesBox.appendChild(matchesList);

    bottomSection.appendChild(leaderboardsBox);
    bottomSection.appendChild(matchesBox);

    // =====================
    // ASSEMBLY
    // =====================
    content.appendChild(titleContainer);
    content.appendChild(buttonsContainer);
    content.appendChild(bottomSection);

    container.appendChild(content);
    return container;
  }

  getElement(): HTMLElement {
    return this.element;
  }

  destroy(): void {}
}
