/**
 * Blockchain Service
 * Centralized service for all blockchain interactions
 */

import { connectWallet, getStoredAccount, getStoredWalletClient, disconnectWallet } from '../blockchain/Wallet.js';
import { 
  saveGameData, 
  getUserGames, 
  getGameData, 
  mint,
  getTournamentData,
  checkTime,
  checkTournamentStatus,
  testReturn,
  stake,
  startPayableTournament,
  reimbursePlayer,
  reimburseIfFailedStart,
  saveResultsAndTransferToken
} from '../blockchain/Contract.js';
import type { WalletState, BlockchainGameData, GameData } from '../types/index.js';
import type { Address } from 'viem';

class BlockchainService {
  private walletState: WalletState = {
    isConnected: false,
    address: null,
    chainId: null
  };

  private listeners: Set<(state: WalletState) => void> = new Set();

  /**
   * Connect to MetaMask wallet
   */
  async connect(): Promise<{ address: string; success: boolean; error?: string }> {
    try {
      const { address } = await connectWallet();
      
      this.walletState = {
        isConnected: true,
        address: address as string,
        chainId: 43113 // Fuji-C testnet
      };
      
      this.notifyListeners();
      
      return { 
        address: address as string, 
        success: true 
      };
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      return { 
        address: '', 
        success: false, 
        error: error.message || 'Failed to connect wallet'
      };
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    disconnectWallet();
    this.walletState = {
      isConnected: false,
      address: null,
      chainId: null
    };
    this.notifyListeners();
  }

  /**
   * Get current wallet state
   */
  getWalletState(): WalletState {
    const account = getStoredAccount();
    const client = getStoredWalletClient();
    
    if (account && client) {
      this.walletState = {
        isConnected: true,
        address: account as string,
        chainId: 43113
      };
    }
    
    return this.walletState;
  }

  /**
   * Subscribe to wallet state changes
   */
  subscribe(listener: (state: WalletState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.walletState));
  }

  /**
   * Save game data to blockchain
   * @param gameData - Game data with user IDs, wallets, and scores
   * @returns The blockchain game ID
   */
  async saveGame(gameData: BlockchainGameData): Promise<{ success: boolean; gameId?: string; error?: string }> {
    try {
      if (!this.walletState.isConnected) {
        throw new Error('Wallet not connected');
      }

      // Ensure arrays are exactly 8 elements (pad with zeros)
      const userIds = [...gameData.user_ids];
      const userWallets = [...gameData.user_wallets];
      const userScores = [...gameData.user_scores];

      while (userIds.length < 8) userIds.push(0);
      while (userWallets.length < 8) userWallets.push('0x0000000000000000000000000000000000000000');
      while (userScores.length < 8) userScores.push(0);

      const gameId = await saveGameData(userIds, userWallets as any, userScores);
      
      return {
        success: true,
        gameId: gameId.toString()
      };
    } catch (error: any) {
      console.error('Failed to save game to blockchain:', error);
      return {
        success: false,
        error: error.message || 'Failed to save game'
      };
    }
  }

  /**
   * Get user's games from blockchain
   * @param address - Wallet address
   * @returns Array of game IDs
   */
  async getUserGames(address?: string): Promise<number[]> {
    try {
      const walletAddress = address || this.walletState.address;
      if (!walletAddress) {
        console.warn('No wallet address provided');
        return [];
      }

      return await getUserGames(walletAddress as any);
    } catch (error) {
      console.error('Failed to fetch user games:', error);
      return [];
    }
  }

  /**
   * Get game data from blockchain
   * @param gameId - The ID of the game
   * @returns Game data
   */
  async getGameData(gameId: number): Promise<GameData | null> {
    try {
      const data = await getGameData(gameId);
      return data as GameData;
    } catch (error) {
      console.error('Failed to fetch game data:', error);
      return null;
    }
  }

  /**
   * Mint NFT for a game
   * @param gameId - The ID of the game
   * @returns Success status
   */
  async mintGameNFT(gameId: number): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.walletState.isConnected) {
        throw new Error('Wallet not connected');
      }

      await mint(gameId);
      
      return { success: true };
    } catch (error: any) {
      console.error('Failed to mint NFT:', error);
      return {
        success: false,
        error: error.message || 'Failed to mint NFT'
      };
    }
  }

  /**
   * Format wallet address for display
   */
  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Check if MetaMask is installed
   */
  isMetaMaskInstalled(): boolean {
    return typeof window !== 'undefined' && typeof (window as any).ethereum !== 'undefined';
  }

  // ==================== STAKING METHODS ====================

  /**
   * Get tournament data
   * @param tournamentIndex - The tournament index
   */
  async getTournamentData(tournamentIndex: number) {
    try {
      return await getTournamentData(tournamentIndex);
    } catch (error) {
      console.error('Failed to get tournament data:', error);
      return null;
    }
  }

  /**
   * Check time for a tournament
   * @param tournamentId - Tournament ID
   * @returns Time value as bigint
   */
  async checkTime(tournamentId: number): Promise<bigint | null> {
    try {
      return await checkTime(tournamentId);
    } catch (error) {
      console.error('Failed to check time:', error);
      return null;
    }
  }

  /**
   * Check tournament status
   * @param tournamentId - Tournament ID
   * @returns True if tournament is active
   */
  async checkTournamentStatus(tournamentId: number): Promise<boolean | null> {
    try {
      return await checkTournamentStatus(tournamentId);
    } catch (error) {
      console.error('Failed to check tournament status:', error);
      return null;
    }
  }

  /**
   * Test return function
   * @returns Test result
   */
  async testReturn() {
    try {
      return await testReturn();
    } catch (error) {
      console.error('Failed to test return:', error);
      return null;
    }
  }

  /**
   * Stake tokens in tournament
   * @param tournamentId - Tournament ID
   * @param userId - User ID
   * @param username - Username
   * @param stakeAmount - Amount to stake in ETH (string)
   * @returns Success status
   */
  async stake(
    tournamentId: number,
    userId: number,
    username: string,
    stakeAmount: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.walletState.isConnected || !this.walletState.address) {
        throw new Error('Wallet not connected');
      }

      await stake(
        tournamentId,
        userId,
        username,
        this.walletState.address as Address,
        stakeAmount
      );

      return { success: true };
    } catch (error: any) {
      console.error('Failed to stake:', error);
      return {
        success: false,
        error: error.message || 'Failed to stake'
      };
    }
  }

  /**
   * Start a payable tournament
   * @param numberOfPlayers - Number of players
   * @param userId - User ID
   * @param username - Username
   * @param minStake - Minimum stake in ETH (string)
   * @returns Tournament ID and success status
   */
  async startPayableTournament(
    numberOfPlayers: number,
    userId: number,
    username: string,
    minStake: string
  ): Promise<{ success: boolean; tournamentId?: string; error?: string }> {
    try {
      if (!this.walletState.isConnected || !this.walletState.address) {
        throw new Error('Wallet not connected');
      }

      const tournamentId = await startPayableTournament(
        numberOfPlayers,
        userId,
        username,
        this.walletState.address as Address,
        minStake
      );

      return {
        success: true,
        tournamentId: tournamentId.toString()
      };
    } catch (error: any) {
      console.error('Failed to start tournament:', error);
      return {
        success: false,
        error: error.message || 'Failed to start tournament'
      };
    }
  }

  /**
   * Reimburse a player (owner-only)
   * @param tournamentId - Tournament ID
   * @param userId - User ID to reimburse
   * @returns Success status
   */
  async reimbursePlayer(
    tournamentId: number,
    userId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.walletState.isConnected) {
        throw new Error('Wallet not connected');
      }

      await reimbursePlayer(tournamentId, userId);

      return { success: true };
    } catch (error: any) {
      console.error('Failed to reimburse player:', error);
      return {
        success: false,
        error: error.message || 'Failed to reimburse player'
      };
    }
  }

  /**
   * Reimburse if tournament failed to start
   * @param tournamentId - Tournament ID
   * @param userId - User ID
   * @returns Success status
   */
  async reimburseIfFailedStart(
    tournamentId: number,
    userId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.walletState.isConnected) {
        throw new Error('Wallet not connected');
      }

      await reimburseIfFailedStart(tournamentId, userId);

      return { success: true };
    } catch (error: any) {
      console.error('Failed to reimburse failed start:', error);
      return {
        success: false,
        error: error.message || 'Failed to reimburse failed start'
      };
    }
  }

  /**
   * Save results and transfer tokens (tournament creator only)
   * @param userScores - Array of user scores
   * @param userIds - Array of user IDs
   * @param tournamentId - Tournament ID
   * @returns Success status
   */
  async saveResultsAndTransferToken(
    userScores: bigint[],
    userIds: bigint[],
    tournamentId: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.walletState.isConnected) {
        throw new Error('Wallet not connected');
      }

      await saveResultsAndTransferToken(userScores, userIds, tournamentId);

      return { success: true };
    } catch (error: any) {
      console.error('Failed to save results:', error);
      return {
        success: false,
        error: error.message || 'Failed to save results'
      };
    }
  }
}

export const blockchainService = new BlockchainService();
