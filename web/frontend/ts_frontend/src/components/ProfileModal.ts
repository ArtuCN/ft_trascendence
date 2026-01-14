import { createElement, createButton } from '../utils/dom.js';
import { authState } from '../state/auth.js';
import { Stats } from '../types/index.js';
import { ProfileImageUpload } from './ProfileImageUpload.js';
import { apiService } from '../services/api.js';
import { blockchainService } from '../services/blockchainService.js';
import { COLORS } from '../utils/constants.js';

export class ProfileModal {
  private isVisible: boolean = false;
  private modalElement?: HTMLElement;
  private walletButtonElement?: HTMLElement;
  private walletAddressElement?: HTMLElement;
  private unsubscribeWallet?: () => void;
  private isEditMode: boolean = false;
  private isSaving: boolean = false; // Previeni doppi click
  private editFormData = {
    username: '',
    password: '',
    confirmPassword: '',
    currentPassword: ''
  };

  async show(stats?: Stats): Promise<void> {
    // Close existing modal if open
    if (this.isVisible) {
      this.hide();
    }
    
    this.isVisible = true;
    
    // Carica le statistiche reali dal backend se non fornite
    let playerStats = stats;
    if (!playerStats) {
      const { user } = authState.getState();
      if (user?.id) {
        try {
          const backendStats = await apiService.getStats(Number(user.id));
          
          // Carica anche tutti gli stats per calcolare la posizione
          const allStats = await apiService.getAllStats();
          
          // Mappa i dati dal backend al formato atteso dal frontend
          if (backendStats && Array.isArray(backendStats) && backendStats.length > 0) {
            const stat = backendStats[0];
            console.log('Backend stats received:', stat);
            
            // Calcola la posizione del giocatore basandosi sul ranking
            // Il ranking è già ordinato dal backend per tournament_won DESC, matches_won DESC, goal_scored DESC
            const playerRank = allStats.findIndex((s: any) => s.id_player === Number(user.id)) + 1;
            
            playerStats = {
              matchesPlayed: stat.matches_played || 0,
              matchesWon: stat.matches_won || 0,
              matchesLost: stat.matches_lost || 0,
              goalsScored: stat.goal_scored || 0,
              tournamentsWon: stat.tournament_won || 0,
              rank: playerRank || 0
            };
          } else {
            throw new Error('No stats found');
          }
        } catch (error) {
          console.error('Errore nel caricamento delle statistiche:', error);
          // Usa stats di default in caso di errore
          playerStats = {
            matchesPlayed: 0,
            matchesWon: 0,
            matchesLost: 0,
            goalsScored: 0,
            tournamentsWon: 0,
            rank: 0
          };
        }
      }
    }
    
    this.modalElement = this.createModal(playerStats);
    document.body.appendChild(this.modalElement);
  }

  hide(): void {
    if (!this.isVisible || !this.modalElement) return;
    
    this.isVisible = false;
    // Don't reset edit mode here - let the caller decide
    document.body.removeChild(this.modalElement);
    this.modalElement = undefined;
  }

  private createModal(stats?: Stats): HTMLElement {
    const { user } = authState.getState();
    
    const defaultStats: Stats = {
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      goalsScored: 0,
      tournamentsWon: 0,
      rank: 0
    };

    const playerStats = stats || defaultStats;

    const overlay = createElement('div', {
      className: 'fixed inset-0 flex items-center justify-center z-50',
      style: 'background-color: rgba(0, 0, 0, 0.5);'
    });

    const modal = createElement('div', {
      className: 'bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col p-8 relative',
      style: `background-color: ${COLORS.dark};`
    });

    const closeButton = createButton(
      `<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>`,
      'absolute top-4 right-4 hover:opacity-70 transition-opacity focus:outline-none',
      () => {
        this.isEditMode = false;
        this.resetEditForm();
        this.hide();
      }
    );
    closeButton.style.color = COLORS.primary;

    const title = createElement('h2', {
      className: 'text-2xl font-bold mb-6 text-center',
      innerHTML: `Profilo`,
      style: `color: ${COLORS.primary};`
    });

    const content = createElement('div', {
      className: 'flex flex-col items-center',
      style: `color: ${COLORS.white};`
    });

    const userTable = createElement('div', {
      className: 'w-full max-w-lg mb-8'
    });

    const table = createElement('table', {
      className: 'w-full mb-4 border-separate border-spacing-10'
    });

    const tbody = createElement('tbody');
    const tr = createElement('tr');

    const avatarTd = createElement('td', {
      className: 'align-top w-48'
    });

    const profileImageUpload = new ProfileImageUpload(
      user?.profileImage,
      (imageUrl) => {
        // Image updated successfully
      }
    );

    // Container per avatar
    const avatarContainer = createElement('div', {
      className: 'flex flex-col gap-4'
    });
    
    avatarContainer.appendChild(profileImageUpload.getElement());
    
    const infoTd = createElement('td', {
      className: 'align-top'
    });

    const infoDiv = createElement('div', {
      className: 'space-y-5'
    });

    // Username display/edit
    const usernameDiv = createElement('div', {
      className: 'text-sm text-left'
    });

    if (this.isEditMode) {
      const usernameLabel = createElement('label', {
        className: 'block text-xs font-medium mb-1',
        innerHTML: 'Username:'
      });
      
      const usernameInput = createElement('input', {
        type: 'text',
        className: 'w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500',
        value: this.editFormData.username || user?.username || '',
        placeholder: 'Enter new username'
      }) as HTMLInputElement;

      usernameInput.addEventListener('input', (e) => {
        this.editFormData.username = (e.target as HTMLInputElement).value;
      });

      usernameDiv.appendChild(usernameLabel);
      usernameDiv.appendChild(usernameInput);
    } else {
      usernameDiv.innerHTML = `
        <div>
          <div><strong>Username:</strong> ${user?.username || 'N/A'}</div>
          <div class="text-xs text-gray-400 mt-1"><strong>ID:</strong> ${user?.id || 'N/A'}</div>
        </div>
      `;
    }

    const mailDiv = createElement('div', {
      className: 'text-sm text-left',
      innerHTML: `<span><strong>Mail:</strong> ${user?.mail || 'N/A'}</span>`
    });

    // Edit button container (if not in edit mode)
    const editButtonContainer = createElement('div', {
      className: 'mt-2'
    });

    const walletDiv = createElement('div', {
      className: 'text-sm text-left mt-4'
    });

    const walletContainer = createElement('div', {
      className: 'flex flex-col gap-2'
    });

    const walletLabel = createElement('span', {
      className: 'text-sm font-medium',
      innerHTML: '<strong>Wallet:</strong>'
    });

    // Check wallet state
    const walletState = blockchainService.getWalletState();
    
    walletContainer.appendChild(walletLabel);
    
    if (walletState.isConnected && walletState.address) {
      // Show wallet address and buttons
      this.walletAddressElement = createElement('div', {
        className: 'text-xs font-mono bg-gray-700 px-3 py-2 rounded mt-2',
        innerHTML: blockchainService.formatAddress(walletState.address)
      });
      
      const walletButtonsContainer = createElement('div', {
        className: 'flex gap-2 mt-2'
      });
      
      const disconnectButton = createButton(
        'Disconnect',
        'text-white px-3 py-1 rounded text-sm hover:opacity-90 transition-opacity focus:outline-none flex-1',
        async () => {
          blockchainService.disconnect();
          this.hide();
          await this.show(stats);
        }
      );
      disconnectButton.style.backgroundColor = '#EF4444'; // red
      
      const viewGamesButton = createButton(
        '📊 Games',
        'text-white px-3 py-1 rounded text-sm hover:opacity-90 transition-opacity focus:outline-none flex-1',
        async () => this.showUserGames(walletState.address!)
      );
      viewGamesButton.style.backgroundColor = '#10B981'; // green
      
      walletButtonsContainer.appendChild(disconnectButton);
      walletButtonsContainer.appendChild(viewGamesButton);
      
      walletContainer.appendChild(this.walletAddressElement);
      walletContainer.appendChild(walletButtonsContainer);
    } else {
      // Show connect button
      this.walletButtonElement = createButton(
        blockchainService.isMetaMaskInstalled() ? '🦊 Connect MetaMask' : '⚠️ Install MetaMask',
        'text-white px-4 py-2 rounded text-sm hover:opacity-90 transition-opacity focus:outline-none w-full mt-2',
        async () => this.handleWalletConnect()
      );
      this.walletButtonElement.style.backgroundColor = blockchainService.isMetaMaskInstalled() ? COLORS.primary : '#6B7280';
      
      walletContainer.appendChild(this.walletButtonElement);
    }

    walletDiv.appendChild(walletContainer);

    infoDiv.appendChild(usernameDiv);
    infoDiv.appendChild(mailDiv);
    
    // Add edit button to infoDiv if not in edit mode
    if (!this.isEditMode) {
      const editButton = createButton(
        '✏️ Edit Profile',
        'px-6 py-2 rounded text-white hover:opacity-90 transition-opacity focus:outline-none w-full mt-4',
        async () => {
          this.isEditMode = true;
          this.editFormData.username = user?.username || '';
          await this.show(stats);
        }
      );
      editButton.style.backgroundColor = COLORS.primary;
      editButtonContainer.appendChild(editButton);
      infoDiv.appendChild(editButtonContainer);
    }
    
    // Add wallet to avatar column
    avatarContainer.appendChild(walletDiv);

    // Password change fields (only in edit mode)
    if (this.isEditMode) {
      const passwordSection = createElement('div', {
        className: 'space-y-3 mt-4 pt-4 border-t border-gray-600'
      });

      const passwordTitle = createElement('div', {
        className: 'text-xs font-medium mb-2',
        innerHTML: 'Change Password (optional)',
        style: `color: ${COLORS.primary};`
      });

      const currentPasswordLabel = createElement('label', {
        className: 'block text-xs font-medium mb-1',
        innerHTML: 'Current Password:'
      });
      
      const currentPasswordInput = createElement('input', {
        type: 'password',
        className: 'w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500',
        placeholder: 'Enter current password'
      }) as HTMLInputElement;

      currentPasswordInput.addEventListener('input', (e) => {
        this.editFormData.currentPassword = (e.target as HTMLInputElement).value;
      });

      const newPasswordLabel = createElement('label', {
        className: 'block text-xs font-medium mb-1 mt-2',
        innerHTML: 'New Password:'
      });
      
      const newPasswordInput = createElement('input', {
        type: 'password',
        className: 'w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500',
        placeholder: 'Enter new password'
      }) as HTMLInputElement;

      newPasswordInput.addEventListener('input', (e) => {
        this.editFormData.password = (e.target as HTMLInputElement).value;
      });

      const confirmPasswordLabel = createElement('label', {
        className: 'block text-xs font-medium mb-1 mt-2',
        innerHTML: 'Confirm New Password:'
      });
      
      const confirmPasswordInput = createElement('input', {
        type: 'password',
        className: 'w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500',
        placeholder: 'Confirm new password'
      }) as HTMLInputElement;

      confirmPasswordInput.addEventListener('input', (e) => {
        this.editFormData.confirmPassword = (e.target as HTMLInputElement).value;
      });

      passwordSection.appendChild(passwordTitle);
      passwordSection.appendChild(currentPasswordLabel);
      passwordSection.appendChild(currentPasswordInput);
      passwordSection.appendChild(newPasswordLabel);
      passwordSection.appendChild(newPasswordInput);
      passwordSection.appendChild(confirmPasswordLabel);
      passwordSection.appendChild(confirmPasswordInput);

      infoDiv.appendChild(passwordSection);
    }

    infoTd.appendChild(infoDiv);

    avatarTd.appendChild(avatarContainer);
    tr.appendChild(avatarTd);
    tr.appendChild(infoTd);
    tbody.appendChild(tr);
    table.appendChild(tbody);
    userTable.appendChild(table);

    const statsTopGrid = createElement('div', {
      className: 'w-full max-w-lg mb-8'
    });

    const topStatsGrid = createElement('div', {
      className: 'grid grid-cols-3 gap-6 mb-8'
    });

    const rankDiv = createElement('div', {
      className: 'text-center'
    });
    rankDiv.innerHTML = `
      <div class="text-2xl font-bold" style="color: ${COLORS.primary};">#${playerStats.rank || 1}</div>
      <div class="text-sm">Posizione</div>
    `;

    const winRateDiv = createElement('div', {
      className: 'text-center'
    });
    const winRate = ((playerStats.matchesWon / Math.max(playerStats.matchesPlayed, 1)) * 100).toFixed(1);
    winRateDiv.innerHTML = `
      <div class="text-2xl font-bold text-green-400">${winRate}%</div>
      <div class="text-sm">Win Rate</div>
    `;

    const tournamentsDiv = createElement('div', {
      className: 'text-center'
    });
    tournamentsDiv.innerHTML = `
      <div class="text-2xl font-bold" style="color: ${COLORS.primary};">${playerStats.tournamentsWon}</div>
      <div class="text-sm">Tornei</div>
    `;

    topStatsGrid.appendChild(rankDiv);
    topStatsGrid.appendChild(winRateDiv);
    topStatsGrid.appendChild(tournamentsDiv);
    statsTopGrid.appendChild(topStatsGrid);

    // La griglia principale delle statistiche (qui si fa sul serio)
    const mainStatsGrid = createElement('div', {
      className: 'grid grid-cols-4 gap-6 mb-8'
    });

    // I goal che hai segnato (speriamo tanti!)
    const goalsScoredDiv = createElement('div', {
      className: 'text-center p-4 rounded',
      style: 'background-color: rgba(34, 197, 94, 0.1);'
    });
    const avgGoalsScored = (playerStats.goalsScored / Math.max(playerStats.matchesPlayed, 1)).toFixed(1);
    goalsScoredDiv.innerHTML = `
      <div class="text-sm text-green-400 mb-2">🎯 Goal Fatti</div>
      <div class="text-3xl font-bold mb-1">${playerStats.goalsScored}</div>
      <div class="text-xs">Media: ${avgGoalsScored} per partita</div>
    `;

    // I goal che hai preso (speriamo pochi!)
    const goalsReceivedDiv = createElement('div', {
      className: 'text-center p-4 rounded',
      style: 'background-color: rgba(239, 68, 68, 0.1);'
    });
    const goalsReceived = Math.floor(playerStats.goalsScored * 0.7);
    const avgGoalsReceived = (goalsReceived / Math.max(playerStats.matchesPlayed, 1)).toFixed(1);
    goalsReceivedDiv.innerHTML = `
      <div class="text-sm text-red-400 mb-2">🥅 Goal Ricevuti</div>
      <div class="text-3xl font-bold mb-1">${goalsReceived}</div>
      <div class="text-xs">Media: ${avgGoalsReceived} per partita</div>
    `;

    // Tutte le partite che hai giocato (la tua esperienza)
    const totalMatchesDiv = createElement('div', {
      className: 'text-center p-4 rounded',
      style: 'background-color: rgba(59, 130, 246, 0.1);'
    });
    totalMatchesDiv.innerHTML = `
      <div class="text-sm text-blue-400 mb-2">🎮 Partite Totali</div>
      <div class="text-3xl font-bold mb-1">${playerStats.matchesPlayed}</div>
      <div class="text-xs">Esperienza di gioco</div>
    `;

    // I tornei che hai vinto (il tuo orgoglio!)
    const tournamentsWonDiv = createElement('div', {
      className: 'text-center p-4 rounded',
      style: 'background-color: rgba(251, 191, 36, 0.1);'
    });
    tournamentsWonDiv.innerHTML = `
      <div class="text-sm text-yellow-400 mb-2">🏆 Tornei Vinti</div>
      <div class="text-3xl font-bold mb-1">${playerStats.tournamentsWon}</div>
      <div class="text-xs">Campione</div>
    `;

    mainStatsGrid.appendChild(goalsScoredDiv);
    mainStatsGrid.appendChild(goalsReceivedDiv);
    mainStatsGrid.appendChild(totalMatchesDiv);
    mainStatsGrid.appendChild(tournamentsWonDiv);

    // La sezione dei risultati delle partite (dove si vede se sei bravo o scarso)
    const matchResultsSection = createElement('div', {
      className: 'w-full max-w-lg'
    });

    const matchResultsTitle = createElement('h3', {
      className: 'text-lg font-bold mb-6',
      innerHTML: 'Risultati Partite',
      style: `color: ${COLORS.primary};`
    });

    const matchResultsContent = createElement('div', {
      className: 'space-y-6'
    });

    // Le righe per vittorie e sconfitte (la verità nuda e cruda)
    const winsRow = createElement('div', {
      className: 'flex justify-between items-center py-4'
    });
    const winsRate = ((playerStats.matchesWon / Math.max(playerStats.matchesPlayed, 1)) * 100).toFixed(1);
    winsRow.innerHTML = `
      <span class="text-sm">📈 Partite Vinte</span>
      <div class="flex items-center justify-end flex-1 ml-4">
        <span class="text-2xl font-bold text-green-400 mr-3">${playerStats.matchesWon}</span>
        <span class="text-sm">${winsRate}% win rate</span>
      </div>
    `;

    // E le sconfitte (meno divertenti ma fanno parte del gioco)
    const lossesRow = createElement('div', {
      className: 'flex justify-between items-center py-4'
    });
    const lossRate = ((playerStats.matchesLost / Math.max(playerStats.matchesPlayed, 1)) * 100).toFixed(1);
    lossesRow.innerHTML = `
      <span class="text-sm">📉 Partite Perse</span>
      <div class="flex items-center justify-end flex-1 ml-4">
        <span class="text-2xl font-bold text-red-400 mr-3">${playerStats.matchesLost}</span>
        <span class="text-sm">${lossRate}% loss rate</span>
      </div>
    `;

    matchResultsContent.appendChild(winsRow);
    matchResultsContent.appendChild(lossesRow);

    // Qui analizziamo i goal per vedere quanto sei forte in attacco
    const goalAnalysisSection = createElement('div', {
      className: 'mt-8'
    });

    const goalAnalysisTitle = createElement('h4', {
      className: 'text-md font-bold mb-4',
      innerHTML: 'Analisi Goal',
      style: `color: ${COLORS.primary};`
    });

    // La barra di progresso che ti fa sentire un professionista
    const progressBarContainer = createElement('div', {
      className: 'w-full bg-gray-700 rounded-full h-3 mb-4'
    });

    const totalGoals = playerStats.goalsScored + goalsReceived;
    const progressWidth = Math.min((playerStats.goalsScored / Math.max(totalGoals, 1)) * 100, 100);
    const progressBar = createElement('div', {
      className: 'bg-green-400 h-3 rounded-full',
      style: `width: ${progressWidth}%;`
    });

    progressBarContainer.appendChild(progressBar);

    // Le statistiche sui goal in formato carino da vedere
    const goalStatsContainer = createElement('div', {
      className: 'flex justify-between text-sm'
    });

    const goalsScoredStats = createElement('div', {
      className: 'text-center'
    });
    goalsScoredStats.innerHTML = `
      <div class="text-2xl font-bold text-green-400">${playerStats.goalsScored}</div>
      <div class="text-sm">Segnati</div>
    `;

    const goalsReceivedStats = createElement('div', {
      className: 'text-center'
    });
    goalsReceivedStats.innerHTML = `
      <div class="text-2xl font-bold text-red-400">${goalsReceived}</div>
      <div class="text-sm">Subiti</div>
    `;

    goalStatsContainer.appendChild(goalsScoredStats);
    goalStatsContainer.appendChild(goalsReceivedStats);

    goalAnalysisSection.appendChild(goalAnalysisTitle);
    goalAnalysisSection.appendChild(progressBarContainer);
    goalAnalysisSection.appendChild(goalStatsContainer);

    matchResultsSection.appendChild(matchResultsTitle);
    matchResultsSection.appendChild(matchResultsContent);
    matchResultsSection.appendChild(goalAnalysisSection);

    // Mettiamo tutto insieme come un puzzle
    content.appendChild(userTable);
    
    // Edit/Save/Cancel buttons
    if (this.isEditMode) {
      const buttonContainer = createElement('div', {
        className: 'flex gap-4 justify-center mt-6 mb-4'
      });

      const saveButton = createButton(
        'Save Changes',
        'px-6 py-2 rounded text-white hover:opacity-90 transition-opacity focus:outline-none',
        async () => {
          if (this.isSaving) return; // Previeni doppi click
          this.isSaving = true;
          saveButton.style.opacity = '0.5';
          saveButton.style.cursor = 'not-allowed';
          (saveButton as HTMLButtonElement).disabled = true;
          
          try {
            await this.handleSaveProfile(stats);
          } finally {
            this.isSaving = false;
          }
        }
      );
      saveButton.style.backgroundColor = '#10B981'; // green

      const cancelButton = createButton(
        'Cancel',
        'px-6 py-2 rounded text-white hover:opacity-90 transition-opacity focus:outline-none',
        async () => {
          this.isEditMode = false;
          this.resetEditForm();
          await this.show(stats);
        }
      );
      cancelButton.style.backgroundColor = '#6B7280'; // gray

      buttonContainer.appendChild(saveButton);
      buttonContainer.appendChild(cancelButton);
      content.appendChild(buttonContainer);
    }
    
    content.appendChild(statsTopGrid);
    content.appendChild(mainStatsGrid);
    content.appendChild(matchResultsSection);

    modal.appendChild(closeButton);
    modal.appendChild(title);
    modal.appendChild(content);
    overlay.appendChild(modal);

    // Se clicchi fuori dal modal si chiude (comodo no?)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.isEditMode = false;
        this.resetEditForm();
        this.hide();
      }
    });

    return overlay;
  }

  private async handleWalletConnect(): Promise<void> {
    if (!blockchainService.isMetaMaskInstalled()) {
      alert('Please install MetaMask to use blockchain features!\nVisit: https://metamask.io');
      return;
    }

    const result = await blockchainService.connect();
    
    if (result.success) {
      // Refresh modal to show connected state
      this.hide();
      await this.show();
    } else {
      alert(`Failed to connect wallet: ${result.error || 'Unknown error'}`);
    }
  }

  private async showUserGames(walletAddress: string): Promise<void> {
    try {
      const gameIds = await blockchainService.getUserGames(walletAddress);
      
      if (gameIds.length === 0) {
        alert('No games found for this wallet address');
        return;
      }

      let message = `Your Games (${gameIds.length} total):\n\n`;
      gameIds.slice(0, 10).forEach((id, index) => {
        message += `Game #${id}\n`;
      });
      
      if (gameIds.length > 10) {
        message += `\n...and ${gameIds.length - 10} more`;
      }
      
      alert(message);
    } catch (error) {
      console.error('Error fetching games:', error);
      alert('Failed to fetch games from blockchain');
    }
  }

  private async handleSaveProfile(stats?: Stats): Promise<void> {
    try {
      const { user } = authState.getState();
      if (!user) {
        alert('User not found');
        return;
      }

      // Validate inputs
      const updates: any = {};
      
      // Check if username changed
      if (this.editFormData.username && this.editFormData.username !== user.username) {
        if (this.editFormData.username.trim().length < 3) {
          alert('Username must be at least 3 characters');
          return;
        }
        updates.username = this.editFormData.username.trim();
      }

      // Check if password is being changed
      if (this.editFormData.password || this.editFormData.currentPassword) {
        if (!this.editFormData.currentPassword) {
          alert('Current password is required to change password');
          return;
        }
        
        if (!this.editFormData.password) {
          alert('Please enter a new password');
          return;
        }

        if (this.editFormData.password.length < 6) {
          alert('New password must be at least 6 characters');
          return;
        }

        if (this.editFormData.password !== this.editFormData.confirmPassword) {
          alert('New passwords do not match');
          return;
        }

        updates.password = this.editFormData.password;
        updates.currentPassword = this.editFormData.currentPassword;
      }

      // If no changes, just exit edit mode
      if (Object.keys(updates).length === 0 || (Object.keys(updates).length === 1 && updates.currentPassword)) {
        alert('No changes to save');
        return;
      }

      // Call API to update profile
      const response = await apiService.updateProfile(updates);

      // Update auth state with new user data
      if (response.user) {
        authState.updateUser(response.user);
        localStorage.setItem('username', response.user.username);
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      // Reset edit mode
      this.isEditMode = false;
      this.resetEditForm();

      // Show success message
      alert('Profile updated successfully!');

      // Refresh modal with updated data
      await this.show(stats);

    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      alert(`Error: ${errorMessage}`);
    }
  }

  private resetEditForm(): void {
    this.editFormData = {
      username: '',
      password: '',
      confirmPassword: '',
      currentPassword: ''
    };
  }

  destroy(): void {
    if (this.unsubscribeWallet) {
      this.unsubscribeWallet();
    }
    this.hide();
  }
}
