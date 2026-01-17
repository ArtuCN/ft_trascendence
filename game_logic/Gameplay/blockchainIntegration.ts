let isWalletConnected = false;
let walletAddress: string | null = null;
let currentTournamentId: string = '0';

export function initWalletListener(): void {
  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;

    const data = event.data;
    
    if (data.type === 'wallet_state_update') {
      isWalletConnected = data.isConnected || false;
      walletAddress = data.address || null;
      console.log('Wallet state updated:', { isWalletConnected, walletAddress });
    }
  });

  requestWalletState();
}

function requestWalletState(): void {
  if (window.parent !== window) {
    window.parent.postMessage({ type: 'request_wallet_state' }, window.location.origin);
  }
}

export function setCurrentTournamentId(tournamentId: string): void {
  currentTournamentId = tournamentId;
}

export function isWalletConnectedState(): boolean {
  return isWalletConnected;
}

export function getWalletAddress(): string | null {
  return walletAddress;
}

export async function saveTournamentToBlockchain(tournamentId: string): Promise<void> {
  if (!isWalletConnected) {
    throw new Error('Wallet not connected. Please connect your MetaMask wallet first.');
  }

  if (!tournamentId || tournamentId === '0') {
    throw new Error('Invalid tournament ID');
  }

  const tournamentIdNumber = parseInt(tournamentId);
  
  if (isNaN(tournamentIdNumber)) {
    throw new Error('Invalid tournament ID format');
  }

  return new Promise((resolve, reject) => {
    const messageId = `save_tournament_${Date.now()}`;
    
    const responseListener = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      const data = event.data;
      
      if (data.type === 'tournament_saved' && data.messageId === messageId) {
        window.removeEventListener('message', responseListener);
        resolve();
      } else if (data.type === 'tournament_save_error' && data.messageId === messageId) {
        window.removeEventListener('message', responseListener);
        reject(new Error(data.error || 'Failed to save tournament'));
      }
    };
    
    window.addEventListener('message', responseListener);
    
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'save_tournament_to_blockchain',
        tournamentId: tournamentIdNumber,
        messageId
      }, window.location.origin);
    } else {
      window.removeEventListener('message', responseListener);
      reject(new Error('Not running in iframe'));
    }
    
    setTimeout(() => {
      window.removeEventListener('message', responseListener);
      reject(new Error('Tournament save timeout'));
    }, 60000);
  });
}

export function setupSaveOnChainButton(
  getTournamentId: () => string,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): void {
  const saveOnChainButton = document.getElementById('saveOnChain') as HTMLButtonElement;
  
  if (!saveOnChainButton) {
    console.error('Save on Chain button not found');
    return;
  }

  saveOnChainButton.addEventListener('click', async () => {
    const tournamentId = getTournamentId();
    
    if (!tournamentId || tournamentId === '0') {
      alert('No tournament to save');
      return;
    }

    if (!isWalletConnected) {
      alert('Please connect your MetaMask wallet first from your profile.');
      return;
    }

    saveOnChainButton.disabled = true;
    const originalText = saveOnChainButton.textContent;
    saveOnChainButton.textContent = 'Saving...';

    try {
      await saveTournamentToBlockchain(tournamentId);
      alert('Tournament successfully saved to blockchain!');
      
      saveOnChainButton.style.display = 'none';
      currentTournamentId = '0';
      
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error saving tournament to blockchain:', error);
      alert(`Failed to save tournament: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      if (onError) onError(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      saveOnChainButton.disabled = false;
      saveOnChainButton.textContent = originalText;
    }
  });
}
