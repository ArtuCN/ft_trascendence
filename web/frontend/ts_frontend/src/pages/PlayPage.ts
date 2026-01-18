import { createElement } from '../utils/dom.js';
import { MatchmakingModal } from '../components/MatchmakingModal.js';
import { blockchainService } from '../services/blockchainService.js';
import { blockchainTournamentApi } from '../services/blockchainTournamentApi.js';
import { saveTournamentData } from '../blockchain/Contract.js';
import { router } from '../router/router.js';

export class PlayPage {
  private element: HTMLElement;
  private matchmakingModal: MatchmakingModal;
  private gameFrame?: HTMLIFrameElement;
  private walletStateUnsubscribe?: () => void;

  constructor() {
    this.matchmakingModal = new MatchmakingModal();
    this.element = this.createPage();
    this.setupIframeListeners();
    // Don't setup wallet sync here - wait for iframe to load
  }

  private createPage(): HTMLElement {
    const container = createElement('div', {
      className: 'relative w-full',
      style: 'height: calc(100vh - 80px); overflow: hidden;' // Sottrae l'altezza della navbar
    });

    // Game iframe - occupa tutto lo spazio disponibile
    this.gameFrame = createElement('iframe', {
      src: '/game/',
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
      // Setup wallet sync only after iframe is loaded
      this.setupWalletStateSync();
    };

    container.appendChild(loadingOverlay);
    container.appendChild(this.gameFrame);

    return container;
  }

  private setupIframeListeners(): void {
    window.addEventListener('message', async (event) => {
      if (event.origin !== window.location.origin) return;

      const data = event.data;
      
      if (data.type === 'matchmaking_start') {
        this.matchmakingModal.show(() => {
          this.sendMessageToIframe({ type: 'matchmaking_cancel' });
        });
      } else if (data.type === 'matchmaking_found') {
        this.matchmakingModal.hide();
      } else if (data.type === 'matchmaking_error') {
        this.matchmakingModal.hide();
        alert(data.message || 'Errore durante la ricerca della partita');
      } else if (data.type === 'request_wallet_state') {
        this.sendWalletState();
      } else if (data.type === 'save_tournament_to_blockchain') {
        await this.handleTournamentSave(data.tournamentId, data.messageId);
      } else if (data.type === 'navigate_to_home') {
        router.navigate('/');
      }
    });
  }

  private setupWalletStateSync(): void {
    this.walletStateUnsubscribe = blockchainService.subscribe((state) => {
      this.sendWalletState();
    });

    setTimeout(() => this.sendWalletState(), 500);
  }

  private sendWalletState(): void {
    const walletState = blockchainService.getWalletState();
    this.sendMessageToIframe({
      type: 'wallet_state_update',
      isConnected: walletState.isConnected,
      address: walletState.address,
      chainId: walletState.chainId
    });
  }

  private async handleTournamentSave(tournamentId: number, messageId: string): Promise<void> {
    try {
      const userId = parseInt(localStorage.getItem('id') || '0');
      
      if (!userId) {
        throw new Error('User not logged in');
      }

	  await new Promise(resolve => setTimeout(resolve, 500));

      const tournamentData = await blockchainTournamentApi.getTournamentForBlockchain(
        userId,
        tournamentId
      );

	  console.log("tournament data from backend: ", tournamentData);

	  // if (!tournamentData.winner_ids || tournamentData.winner_ids[0] === 0) {
             // throw new Error('Tournament winner not yet recorded. Please try again.');
           // }

      const actualPlayers = tournamentData.user_ids.filter(id => id !== 0).length;

      await saveTournamentData(
        actualPlayers,
        tournamentData.user_ids,
        tournamentData.user_scores,
        tournamentData.winner_ids,
        tournamentData.winner_names,
        tournamentData.tournament_id
      );

	  // const saveBlockchainId = await blockchainService.insertTournament(
		  // tournamentId,
		  // 0
	  // );


      this.sendMessageToIframe({
        type: 'tournament_saved',
        messageId,
        tournamentId
      });

    } catch (error) {
      console.error('Error saving tournament to blockchain:', error);
      
      this.sendMessageToIframe({
        type: 'tournament_save_error',
        messageId,
        error: error instanceof Error ? error.message : 'Failed to save tournament'
      });
    }
  }

  private sendMessageToIframe(message: any): void {
    if (this.gameFrame && this.gameFrame.contentWindow) {
      try {
        this.gameFrame.contentWindow.postMessage(message, window.location.origin);
      } catch (error) {
        console.error('Error sending message to iframe:', error);
      }
    }
  }

  getElement(): HTMLElement {
    return this.element;
  }

  destroy(): void {
    this.matchmakingModal.hide();
    if (this.walletStateUnsubscribe) {
      this.walletStateUnsubscribe();
    }
  }
}
