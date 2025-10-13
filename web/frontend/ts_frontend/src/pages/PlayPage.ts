import { createElement } from '../utils/dom.js';
import { MatchmakingModal } from '../components/MatchmakingModal.js';

export class PlayPage {
  private element: HTMLElement;
  private matchmakingModal: MatchmakingModal;
  private gameFrame?: HTMLIFrameElement;

  constructor() {
    this.matchmakingModal = new MatchmakingModal();
    this.element = this.createPage();
    this.setupIframeListeners();
  }

  private createPage(): HTMLElement {
    const container = createElement('div', {
      className: 'h-full flex flex-col'
    });

    const title = createElement('h1', {
      className: 'text-3xl font-bold text-gray-800 p-4 bg-white shadow-sm',
      innerHTML: 'Gioca - Pong Game'
    });

    // Main content area with game
    const mainContent = createElement('div', {
      className: 'flex-1 flex min-h-0'
    });

    // Left side - Game instructions/controls
    const leftPanel = createElement('div', {
      className: 'w-1/3 bg-gray-50 p-4 border-r-4 border-blue-500 overflow-y-auto'
    });

    const instructionsTitle = createElement('h2', {
      className: 'text-xl font-semibold text-gray-800 mb-4',
      innerHTML: 'Controlli di Gioco'
    });

    const instructionsList = createElement('div', {
      className: 'space-y-3 text-gray-700'
    });

    const controls = [
      'W / S - Giocatore 1 (sinistra)',
      'Frecce Su/Giù - Giocatore 2 (destra)', 
      'Spacebar - Pausa/Resume',
      'ESC - Menu principale'
    ];

    controls.forEach(control => {
      const controlItem = createElement('div', {
        className: 'bg-white p-3 rounded-lg border border-gray-200',
        innerHTML: `<code class="text-blue-600 font-mono">${control}</code>`
      });
      instructionsList.appendChild(controlItem);
    });

    const gameInfo = createElement('div', {
      className: 'mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg',
      innerHTML: `
        <h3 class="font-semibold text-blue-800 mb-2">Modalità di Gioco</h3>
        <ul class="text-sm text-blue-700 space-y-1">
          <li>• <strong>Local:</strong> Due giocatori sullo stesso computer</li>
          <li>• <strong>Remote:</strong> Gioco online</li>
          <li>• <strong>VS Bot:</strong> Contro l'intelligenza artificiale</li>
          <li>• <strong>Tournament:</strong> Torneo con più giocatori</li>
        </ul>
      `
    });

    leftPanel.appendChild(instructionsTitle);
    leftPanel.appendChild(instructionsList);
    leftPanel.appendChild(gameInfo);

    // Right side - Game iframe
    const rightPanel = createElement('div', {
      className: 'w-2/3 bg-white relative min-h-0'
    });

    // Game iframe
    this.gameFrame = createElement('iframe', {
      src: 'https://localhost/game/',
      className: 'w-full h-full border-0',
      style: 'min-height: 500px;'
    }) as HTMLIFrameElement;

    // Loading overlay
    const loadingOverlay = createElement('div', {
      className: 'absolute inset-0 bg-gray-100 flex items-center justify-center',
      innerHTML: `
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p class="text-gray-600">Caricamento gioco...</p>
        </div>
      `
    });

    // Hide loading overlay when iframe loads
    this.gameFrame.onload = () => {
      loadingOverlay.style.display = 'none';
    };

    rightPanel.appendChild(loadingOverlay);
    rightPanel.appendChild(this.gameFrame);

    mainContent.appendChild(leftPanel);
    mainContent.appendChild(rightPanel);

    container.appendChild(title);
    container.appendChild(mainContent);

    return container;
  }

  private setupIframeListeners(): void {
    // Listen for messages from the game iframe
    window.addEventListener('message', (event) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) return;

      const data = event.data;
      
      if (data.type === 'matchmaking_start') {
        // Show matchmaking modal
        this.matchmakingModal.show(() => {
          // Cancel button clicked - notify iframe
          this.sendMessageToIframe({ type: 'matchmaking_cancel' });
        });
      } else if (data.type === 'matchmaking_found') {
        // Match found - hide modal
        this.matchmakingModal.hide();
      } else if (data.type === 'matchmaking_error') {
        // Error occurred - hide modal and show alert
        this.matchmakingModal.hide();
        alert(data.message || 'Errore durante la ricerca della partita');
      }
    });
  }

  private sendMessageToIframe(message: any): void {
    if (this.gameFrame && this.gameFrame.contentWindow) {
      this.gameFrame.contentWindow.postMessage(message, window.location.origin);
    }
  }

  getElement(): HTMLElement {
    return this.element;
  }

  destroy(): void {
    this.matchmakingModal.hide();
  }
}
