import { createElement } from '../utils/dom.js';
import { MatchmakingModal } from '../components/MatchmakingModal.js';

export class PlayPage3D {
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
      className: 'relative w-full',
      style: 'height: calc(100vh - 80px); overflow: hidden;' // Sottrae l'altezza della navbar
    });

    // Game iframe - occupa tutto lo spazio disponibile
    this.gameFrame = createElement('iframe', {
      src: '/game/3d/',
      className: 'absolute inset-0 w-full h-full border-0',
      style: 'display: block;'
    }) as HTMLIFrameElement;

    // Loading overlay
    const loadingOverlay = createElement('div', {
      className: 'absolute inset-0 bg-gray-100 flex items-center justify-center z-10',
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

    container.appendChild(loadingOverlay);
    container.appendChild(this.gameFrame);

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
