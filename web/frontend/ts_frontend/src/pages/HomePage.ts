import { createElement, createButton } from '../utils/dom.js';
import { router } from '../router/router.js';
import { apiService } from '../services/api.js';

export class HomePage {
  private element: HTMLElement;
  private leaderboardsContainer?: HTMLElement;
  private hasLoadedOnce: boolean = false;

  constructor() {
    this.element = this.createPage();
    // Non caricare automaticamente - verrà chiamato esplicitamente
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
      className: 'text-9xl font-black tracking-wider mb-0',
      innerHTML: 'DREAM-TEAM',
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

    const play = createButton(
      'PLAY',
      'text-white font-bold text-2xl px-16 py-5 rounded-md transition-all transform hover:scale-105 border-3 uppercase tracking-wider',
      () => router.navigate('/play')
    );
    play.style.background = 'rgba(0, 229, 255, 0.1)';
    play.style.borderColor = '#00e5ff';
    play.style.borderWidth = '3px';
    play.style.color = '#00e5ff';
    play.style.boxShadow = '0 0 30px rgba(0, 229, 255, 0.6), inset 0 0 30px rgba(0, 229, 255, 0.15)';
    play.style.fontFamily = '"Press Start 2P", "Courier New", monospace';
    play.style.fontSize = '1.1rem';

    const play3c = createButton(
      'PLAY 3D',
      'text-white font-bold text-2xl px-16 py-5 rounded-md transition-all transform hover:scale-105 border-3 uppercase tracking-wider',
      () => router.navigate('/play3D')
    );
    play3c.style.background = 'rgba(255, 110, 199, 0.1)';
    play3c.style.borderColor = '#ff6ec7';
    play3c.style.borderWidth = '3px';
    play3c.style.color = '#ff6ec7';
    play3c.style.boxShadow = '0 0 30px rgba(255, 110, 199, 0.6), inset 0 0 30px rgba(255, 110, 199, 0.15)';
    play3c.style.fontFamily = '"Press Start 2P", "Courier New", monospace';
    play3c.style.fontSize = '1.1rem';

    buttonsContainer.appendChild(play);
    buttonsContainer.appendChild(play3c);

    // =====================
    // BOTTOM SECTION - Solo leaderboard
    // =====================
    const bottomSection = createElement('div', {
      className: 'flex justify-center w-full max-w-5xl'
    });

    // Leaderboards Box - Stile retro con bordo neon azzurro
    const leaderboardsBox = createElement('div', {
      className: 'w-full max-w-2xl rounded-lg p-8 border-3',
      style:
        'background: rgba(10, 14, 39, 0.8); border-color: #00e5ff; border-width: 3px; box-shadow: 0 0 30px rgba(0, 229, 255, 0.5), inset 0 0 40px rgba(0, 229, 255, 0.08);'
    });

    const leaderboardsTitle = createElement('h2', {
      className: 'text-2xl font-bold mb-6 uppercase tracking-wider',
      innerHTML: 'LEADERBOARDS',
      style: 'color: #00e5ff; letter-spacing: 0.15em; font-family: "Press Start 2P", "Courier New", monospace; font-size: 1.3rem;'
    });

    const leaderboardsList = createElement('div', {
      className: 'space-y-2 '
    });

    // Salvo il riferimento per aggiornarlo dopo
    this.leaderboardsContainer = leaderboardsList;

    // Placeholder iniziale
    const loadingRow = createElement('div', {
      className: 'flex justify-center items-center text-white px-4 py-2',
      innerHTML: 'Loading...',
      style: 'font-family: "Courier New", monospace; font-size: 1.2rem; color: #00e5ff;'
    });
    leaderboardsList.appendChild(loadingRow);

    leaderboardsBox.appendChild(leaderboardsTitle);
    leaderboardsBox.appendChild(leaderboardsList);

    bottomSection.appendChild(leaderboardsBox);

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

  // Carica leaderboards solo se non già caricata
  public async ensureLeaderboardsLoaded(): Promise<void> {
    if (!this.hasLoadedOnce) {
      this.hasLoadedOnce = true;
      await this.loadLeaderboards();
    }
  }

  // Forza refresh leaderboards
  public async refreshLeaderboards(): Promise<void> {
    await this.loadLeaderboards();
  }

  private async loadLeaderboards(): Promise<void> {
    try {
      const stats = await apiService.getAllStats();
      
      if (!this.leaderboardsContainer) return;
      
      // Pulisci il contenitore
      this.leaderboardsContainer.innerHTML = '';
      
      // Prendi i top 10 giocatori
      const topPlayers = stats.slice(0, 10);
      
      if (topPlayers.length === 0) {
        const noDataRow = createElement('div', {
          className: 'flex justify-center items-center text-white px-4 py-2',
          innerHTML: 'Nessun dato disponibile',
          style: 'font-family: "Courier New", monospace; font-size: 1.2rem; color: #00e5ff;'
        });
        this.leaderboardsContainer.appendChild(noDataRow);
        return;
      }
      
      topPlayers.forEach((player: any, index: number) => {
        const row = createElement('div', {
          className: 'flex justify-between items-center text-white px-4 py-2',
          style: 'font-family: "Courier New", monospace; font-size: 1.2rem;'
        });
        
        const leftSpan = createElement('span', {
          innerHTML: `${index + 1}. ${player.username || 'Unknown'}`,
          style: 'color: #00e5ff; font-weight: bold; font-size: 1.2rem;'
        });
        
        const rightSpan = createElement('span', {
          innerHTML: `${player.tournament_won || 0}`,
          className: 'font-bold',
          style: 'color: #ffffff; font-size: 1.2rem;'
        });
        
        row.appendChild(leftSpan);
        row.appendChild(rightSpan);
        if (this.leaderboardsContainer) {
          this.leaderboardsContainer.appendChild(row);
        }
      });
    } catch (error) {
      console.error('Error loading leaderboards:', error);
      if (this.leaderboardsContainer) {
        this.leaderboardsContainer.innerHTML = '';
        const errorRow = createElement('div', {
          className: 'flex justify-center items-center text-white px-4 py-2',
          innerHTML: 'Errore caricamento dati',
          style: 'font-family: "Courier New", monospace; font-size: 1.2rem; color: #ff6ec7;'
        });
        this.leaderboardsContainer.appendChild(errorRow);
      }
    }
  }

  destroy(): void {}
}
