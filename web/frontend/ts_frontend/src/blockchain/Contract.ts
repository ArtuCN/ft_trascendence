import {
	createPublicClient,
	http,
	parseEther,
	parseUnits,
	type Address,
} from 'viem';
import stakingAbi from '../abi/Staking1.abi.json';
import ScoreAbi from '../abi/Score1.abi.json';
import { fujiC } from './chains.js';
import { getStoredAccount, getStoredWalletClient } from './Wallet.js';

// --- env / constants ---
const CONTRACT_ADDRESS: Address = (import.meta.env.VITE_CONTRACT_ADDRESS as string) as Address;
const SCORES_ADDRESS: Address = (import.meta.env.VITE_SCORES_ADDRESS as string) as Address;

if (!CONTRACT_ADDRESS) {
	console.warn('VITE_CONTRACT_ADDRESS not provided. Set it in your .env file.');
}
if (!SCORES_ADDRESS) {
	console.warn('VITE_SCORES_ADDRESS not provided. Set it in your .env file.');
}

// --- clients ---
// Read-only client (uses RPC_URL)
export const publicClient = createPublicClient({ 
	chain: fujiC,
	transport: http()
});

// ==================== SCORES CONTRACT ====================

/**
 * Returns tournament data for specific tournament
 * @param tournamentIndex - The index of the tournament
 * @returns Tournament data structure
 */
export async function getTournamentData(tournamentIndex: number) {
	try {
		const res = await publicClient.readContract({
			address: SCORES_ADDRESS,
			abi: ScoreAbi as any,
			functionName: 'getTournamentData',
			args: [BigInt(tournamentIndex)],
		});
		return res;
	} catch (error) {
		console.error('Error fetching tournament data:', error);
		throw error;
	}
}

/**
 * Returns game data for specific gameId
 * @param game_id - The ID of the game
 * @returns Game data structure with user_ids, user_wallets, user_scores, winner_ids, game_id
 */
export async function getGameData(game_id: number) {
	try {
		const res = await publicClient.readContract({
			address: SCORES_ADDRESS,
			abi: ScoreAbi as any,
			functionName: 'getGameData',
			args: [BigInt(game_id)],
		});
		return res;
	} catch (error) {
		console.error('Error fetching game data:', error);
		throw error;
	}
}

/**
 * Returns all the games user participated in (needs user address)
 * @param userAddress - The wallet address of the user
 * @returns Array of game IDs
 */
export async function getUserGames(userAddress: Address): Promise<number[]> {
	try {
		const res = await publicClient.readContract({
			address: SCORES_ADDRESS,
			abi: ScoreAbi as any,
			functionName: "getUserGames",
			args: [userAddress]
		});
		return res as number[];
	} catch (error) {
		console.error('Error fetching user games:', error);
		throw error;
	}
}

/**
 * Saves game data on the blockchain
 * @param _user_ids - Array of user IDs (length 8, pad with 0)
 * @param _user_wallets - Array of user wallet addresses (length 8, pad with 0x0)
 * @param _user_scores - Array of user scores (length 8, pad with 0)
 * @returns The game ID created
 */
export async function saveGameData(
	_user_ids: number[],
	_user_wallets: Address[],
	_user_scores: number[]
): Promise<bigint> {
	const walletClient = getStoredWalletClient();
	const clientAddress: Address | null = getStoredAccount();
	
	if (!walletClient || !clientAddress) {
		throw new Error("Wallet not connected. Please connect MetaMask first.");
	}

	try {
		const { request, result } = await publicClient.simulateContract({
			account: clientAddress,
			address: SCORES_ADDRESS,
			abi: ScoreAbi,
			functionName: 'saveGameData',
			args: [_user_ids, _user_wallets, _user_scores]
		});
		
		await walletClient.writeContract(request);
		return result;
	} catch (error) {
		console.error('Error saving game data:', error);
		throw error;
	}
}

/*
 * Saves tournament data on the blockchain
 * @param _NofPlayers - Number of players (max 8)
 * @param _user_ids - Array of user IDs (length 8, pad with 0)
 * @param _user_scores - Array of user scores (length 8, pad with 0)
 * @param _winner_ids - Array of winner IDs (length 8, pad with 0)
 * @param _winner_names - Winner name string
 * @param _tournament_id - Tournament ID
 */
export async function saveTournamentData(
  _NofPlayers: number,
  _user_ids: number[],
  _user_scores: number[],
  _winner_ids: number[],
  _winner_names: string,
  _tournament_id: number
): Promise<void> {
  const walletClient = getStoredWalletClient();
  const clientAddress: Address | null = getStoredAccount();

  if (!walletClient || !clientAddress) {
    throw new Error("Wallet not connected. Please connect MetaMask first.");
  }

  try {
    const { request } = await publicClient.simulateContract({
      account: clientAddress,
      address: SCORES_ADDRESS,
      abi: ScoreAbi,
      functionName: 'saveTournamentData',
      args: [
        BigInt(_NofPlayers),
        _user_ids.map(BigInt),
        _user_scores.map(BigInt),
        _winner_ids.map(BigInt),
        _winner_names,
        BigInt(_tournament_id)
      ]
    });

    await walletClient.writeContract(request);
  } catch (error) {
    console.error('Error saving tournament data:', error);
    throw error;
  }
}

/**
 * Mints a NFT if the minter has participated in the game with the id passed as arg
 * @param gameId - The ID of the game to mint NFT for
 */
export async function mint(gameId: number) {
	const walletClient = getStoredWalletClient();
	const clientAddress: Address | null = getStoredAccount();
	
	if (!walletClient || !clientAddress) {
		throw new Error("Wallet not connected. Please connect MetaMask first.");
	}

	try {
		const { request } = await publicClient.simulateContract({
			account: clientAddress,
			address: SCORES_ADDRESS,
			abi: ScoreAbi,
			functionName: "mint",
			args: [BigInt(gameId)],
			value: parseEther("0.000006")
		});
		
		await walletClient.writeContract(request);
	} catch (error) {
		console.error('Error minting NFT:', error);
		throw error;
	}
}

// ==================== STAKING CONTRACT ====================

/**
 * Check time for a tournament
 * @param tournament_id - The tournament ID
 * @returns Time value as bigint
 */
export async function checkTime(tournament_id: number) {
	try {
		const res = await publicClient.readContract({
			address: CONTRACT_ADDRESS,
			abi: stakingAbi as any,
			functionName: 'checkTime',
			args: [BigInt(tournament_id)],
		});
		return res as bigint;
	} catch (error) {
		console.error('Error checking time:', error);
		throw error;
	}
}

/**
 * Check tournament status
 * @param tournament_id - The tournament ID
 * @returns True if tournament is active, false otherwise
 */
export async function checkTournamentStatus(tournament_id: number) {
	try {
		const res = await publicClient.readContract({
			address: CONTRACT_ADDRESS,
			abi: stakingAbi as any,
			functionName: 'checkTournamentStatus',
			args: [BigInt(tournament_id)],
		});
		return res as boolean;
	} catch (error) {
		console.error('Error checking tournament status:', error);
		throw error;
	}
}

/**
 * Test return function
 * @returns Test result
 */
export async function testReturn() {
	try {
		const res = await publicClient.readContract({
			address: CONTRACT_ADDRESS,
			abi: stakingAbi as any,
			functionName: 'testReturn',
			args: [],
		});
		console.log("contract addr: ", CONTRACT_ADDRESS);
		const walletClient = getStoredWalletClient();
		return res;
	} catch (error) {
		console.error('Error in test return:', error);
		throw error;
	}
}

/**
 * Stakes tokens in a tournament
 * @param tournament_id - The tournament ID
 * @param _user_id - The user ID
 * @param _username - The username
 * @param _user_wallet - The user wallet address
 * @param stakeValueEth - The amount to stake in ETH (string)
 */
export async function stake(
	tournament_id: number,
	_user_id: number,
	_username: string,
	_user_wallet: Address,
	stakeValueEth: string
) {
	const walletClient = getStoredWalletClient();
	const clientAddress: Address | null = getStoredAccount();
	
	if (!walletClient || !clientAddress) {
		throw new Error("Wallet not connected. Please connect MetaMask first.");
	}

	try {
		const valueWei = parseUnits(stakeValueEth, 18);
		const { request, result } = await publicClient.simulateContract({
			account: clientAddress,
			address: CONTRACT_ADDRESS,
			abi: stakingAbi,
			functionName: 'stake',
			args: [tournament_id, _user_id, _username, _user_wallet],
			value: valueWei
		});
		
		await walletClient.writeContract(request);
		return result;
	} catch (error) {
		console.error('Error staking:', error);
		throw error;
	}
}

/**
 * Starts a payable tournament
 * @param _NofPlayers - Number of players
 * @param _user_id - User ID
 * @param _username - Username
 * @param _user_wallet - User wallet address
 * @param _min_stake_eth - Minimum stake in ETH (string)
 * @returns The tournament ID created
 */
export async function startPayableTournament(
	_NofPlayers: number,
	_user_id: number,
	_username: string,
	_user_wallet: Address,
	_min_stake_eth: string
): Promise<bigint> {
	const walletClient = getStoredWalletClient();
	const clientAddress: Address | null = getStoredAccount();
	
	if (!walletClient || !clientAddress) {
		throw new Error("Wallet not connected. Please connect MetaMask first.");
	}

	try {
		const valueWei = parseUnits(_min_stake_eth, 18);
		const { request, result } = await publicClient.simulateContract({
			account: clientAddress,
			address: CONTRACT_ADDRESS,
			abi: stakingAbi,
			functionName: 'startPayableTournament',
			args: [_NofPlayers, _user_id, _username, _user_wallet, valueWei],
			value: valueWei,
		});
		
		await walletClient.writeContract(request);
		return result;
	} catch (error) {
		console.error('Error starting payable tournament:', error);
		throw error;
	}
}

/**
 * Reimburse a player (owner-only function)
 * @param tournament_id - The tournament ID
 * @param user_id - The user ID to reimburse
 */
export async function reimbursePlayer(tournament_id: number, user_id: number) {
	const walletClient = getStoredWalletClient();
	const clientAddress: Address | null = getStoredAccount();
	
	if (!walletClient || !clientAddress) {
		throw new Error("Wallet not connected. Please connect MetaMask first.");
	}

	try {
		const { request } = await publicClient.simulateContract({
			account: clientAddress,
			address: CONTRACT_ADDRESS,
			abi: stakingAbi,
			functionName: 'reimbursePlayer',
			args: [tournament_id, user_id],
		});
		
		await walletClient.writeContract(request);
	} catch (error) {
		console.error('Error reimbursing player:', error);
		throw error;
	}
}

/**
 * Reimburse if tournament failed to start
 * Any participant can run this if they are participating in the tournament.
 * It reimburses all tournament participants, only if tournament couldn't start.
 * @param tournament_id - The tournament ID
 * @param user_id - The user ID
 */
export async function reimburseIfFailedStart(tournament_id: number, user_id: number) {
	const walletClient = getStoredWalletClient();
	const clientAddress: Address | null = getStoredAccount();
	
	if (!walletClient || !clientAddress) {
		throw new Error("Wallet not connected. Please connect MetaMask first.");
	}

	try {
		const { request } = await publicClient.simulateContract({
			account: clientAddress,
			address: CONTRACT_ADDRESS,
			abi: stakingAbi,
			functionName: 'reimburseIfFailedStart',
			args: [tournament_id, user_id],
		});
		
		await walletClient.writeContract(request);
	} catch (error) {
		console.error('Error reimbursing failed start:', error);
		throw error;
	}
}

/**
 * Save results and transfer tokens
 * Only the tournament creator can call this after the tournament is finished.
 * @param user_scores - Array of user scores
 * @param user_ids - Array of user IDs
 * @param tournament_id - The tournament ID
 */
export async function saveResultsAndTransferToken(
	user_scores: bigint[],
	user_ids: bigint[],
	tournament_id: number
) {
	const walletClient = getStoredWalletClient();
	const clientAddress: Address | null = getStoredAccount();
	
	if (!walletClient || !clientAddress) {
		throw new Error("Wallet not connected. Please connect MetaMask first.");
	}

	try {
		const { request } = await publicClient.simulateContract({
			account: clientAddress,
			address: CONTRACT_ADDRESS,
			abi: stakingAbi,
			functionName: 'saveResultsAndTransferToken',
			args: [user_scores, user_ids, tournament_id],
		});
		
		await walletClient.writeContract(request);
	} catch (error) {
		console.error('Error saving results and transferring token:', error);
		throw error;
	}
}
