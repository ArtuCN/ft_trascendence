import { createPublicClient,
		createWalletClient,
		http,
		parseUnits,
		type Address,
		parseEther } from 'viem';
import stakingAbi from './abi/Staking1.abi.json';
import ScoreAbi from './abi/Score1.abi.json';
import { fujiC } from './chains';
import { getStoredAccount, getStoredWalletClient } from './Wallet';

// --- env / constants ---
const CONTRACT_ADDRESS: Address = (import.meta.env.VITE_CONTRACT_ADDRESS as string) as Address
const SCORES_ADDRESS: Address = (import.meta.env.VITE_SCORES_ADDRESS as string) as Address

if (!CONTRACT_ADDRESS) {
	console.warn('VITE_CONTRACT_ADDRESS not provided. Set it in your .env (Vite) file.')
}

// --- clients ---
// Read-only client (uses RPC_URL)
export const publicClient = createPublicClient({ 
	chain: fujiC,
	transport: http()
})

// const walletClient = getStoredWalletClient();
const clientAddress: Address | null = getStoredAccount();



// Read-only helpers (Scores  contract) ----------

// this returs tournament data for specific tournament
export async function getTournamentData(tournamentIndex: number) {
	const res = await publicClient.readContract({
		address: SCORES_ADDRESS,
		abi: ScoreAbi as any,
		functionName: 'getTournamentData',
		args: [BigInt(tournamentIndex)],
	})
	return res;
}


//returns game data for specific gameId
export async function getGameData(game_id: number) {
	const res = await publicClient.readContract({
		address: SCORES_ADDRESS,
		abi: ScoreAbi as any,
		functionName: 'getGameData',
		args: [BigInt(game_id)],
	});

	return res;
}

// returns all the games user participated in (needs user address)
export async function getUserGames(userAddress: Address): Promise<number[]> {
	const res = await publicClient.readContract({
		address: SCORES_ADDRESS,
		abi: ScoreAbi as any,
		functionName: "getUserGames",
		args: [userAddress]
	});
	return res as number[];
}

// returns all the tournaments user participated in (needs user address)
export async function getUserTournaments(userAddress: Address): Promise<number[]> {
	const res = await publicClient.readContract({
		address: SCORES_ADDRESS,
		abi: ScoreAbi as any,
		functionName: "getUserTournaments",
		args: [userAddress]
	});
	return res as number[];
}

// ---- write contract functions for tournament/game contract
// scores saving for each match/game
export async function saveGameData(
	_user_ids: number[],
	_user_wallets: Address[],
	_user_scores: number[]
) : Promise<bigint> {
	const walletClient = getStoredWalletClient();
	const clientAddress: Address | null = getStoredAccount();
	if (!walletClient || !clientAddress) {
		throw new Error("Wallet client or account not available");
	}
	const {request, result} = await publicClient.simulateContract({
		account: clientAddress,
		address: SCORES_ADDRESS,
		abi: ScoreAbi,
		functionName: 'saveGameData',
		args: [ _user_ids,
				_user_wallets,
				_user_scores]
	});
	await walletClient.writeContract(request);
	return(result);
}

//saving the tournament data
// all arrays passed need to have a fixed size of 8!!!
// so zero out the values in array that are supposed to be null
export async function saveTournamentData(
	_nOfPlayers: number,
	_user_ids: number[],
	_user_scores: number[],
	_user_names: string[],
	_tournament_id: number
) {
	const walletClient = getStoredWalletClient();
	const clientAddress: Address | null = getStoredAccount();
	if (!walletClient || !clientAddress) {
		throw new Error("Wallet client or account not available");
	}
	const {request} = await publicClient.simulateContract({
		account: clientAddress,
		address: SCORES_ADDRESS,
		abi: ScoreAbi,
		functionName: 'standAloneSaveTournamentData',
		args: [ 
			_nOfPlayers,
			_user_ids,
			_user_scores,
			_user_names,
			_tournament_id
		]
	});
	const tx = await walletClient.writeContract(request);
	return (tx);
}


//mints a nft if the minter has participated in the game with the id passed as arg
export async function mint(gameId: number) {
	const walletClient = getStoredWalletClient();
	const clientAddress: Address | null = getStoredAccount();
	if (!walletClient || !clientAddress) {
		throw new Error("Wallet client or account not available");
	}
	const {request} = await publicClient.simulateContract({
		account: clientAddress,
		address: SCORES_ADDRESS,
		abi: ScoreAbi,
		functionName: "mint",
		args: [ BigInt(gameId) ],
		value: parseEther("0.000006")
	});
	await walletClient.writeContract(request);
}


// ------------------- CODE BELLOW IS NOT NEEDED FOR NOW --------------------

// --- helper wrappers ---
// Read-only helpers (Staking  contract)

export async function checkTime(tournament_id: number) {
	const res = await publicClient.readContract({
		address: CONTRACT_ADDRESS,
		abi: stakingAbi as any,
		functionName: 'checkTime',
		args: [BigInt(tournament_id)],
	})
	return res as bigint
}

export async function checkTournamentStatus(tournament_id: number) {
	const res = await publicClient.readContract({
		address: CONTRACT_ADDRESS,
		abi: stakingAbi as any,
		functionName: 'checkTournamentStatus',
		args: [BigInt(tournament_id)],
	})
	return res as boolean
}

export async function testReturn() {
	const res = await publicClient.readContract({
		address: CONTRACT_ADDRESS,
		abi: stakingAbi as any,
		functionName: 'testReturn',
		args: [],
	})
	console.log("contract addr: ", CONTRACT_ADDRESS);
	const walletClient = getStoredWalletClient();
	return (res + walletClient);
}

// --- write / payable helpers ---




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
		throw new Error("Wallet client or account not available");
	}
	const valueWei = parseUnits(stakeValueEth, 18);
	const {request, result} = await publicClient.simulateContract({
		account: clientAddress,
		address: CONTRACT_ADDRESS,
		abi: stakingAbi,
		functionName: 'stake',
		args: [tournament_id,
				_user_id,
				_username,
				_user_wallet],
		value: valueWei
	});
	await walletClient.writeContract(request);

	return (result)
}

/**
	* startPayableTournament:
	* - _NofPlayers: number
* - _user_id: number
* - _username: string
* - _user_wallet: string
* - _min_stake: string (decimal in ETH)
*/
export async function startPayableTournament(
	_NofPlayers: number,
	_user_id: number,
	_username: string,
	_user_wallet: Address,
	_min_stake_eth: string
) : Promise<bigint> {
	const walletClient = getStoredWalletClient();
	const clientAddress: Address | null = getStoredAccount();
	if (!walletClient || !clientAddress) {
		throw new Error("Wallet client or account not available");
	}
	const valueWei = parseUnits(_min_stake_eth, 18);
	const {request, result} = await publicClient.simulateContract({
		account: clientAddress,
		address: CONTRACT_ADDRESS,
		abi: stakingAbi,
		functionName: 'startPayableTournament',
		args: [	_NofPlayers,
				_user_id,
				_username,
				_user_wallet,
				valueWei],
		value: valueWei,
	});
	await walletClient.writeContract(request);

	return result;
}



/**
	* reimbursePlayer (nonpayable, owner-only maybe)
*/
export async function reimbursePlayer(tournament_id: number, user_id: number) {
	if (!walletClient) {
		throw new Error("Wallet client not available");
	}
	const {request} = await publicClient.simulateContract({
		account: clientAddress,
		address: CONTRACT_ADDRESS,
		abi: stakingAbi,
		functionName: 'reimbursePlayer',
		args: [
			tournament_id,
			user_id
		],
	});
	await walletClient.writeContract(request);
}

/**
 * reimburseIfFailedStart (nonpayable)
 * Any participant can run this if they are participating in the tournament.
 * It reimburses all tournament participants, only if tournament couldn't start.
 */
export async function reimburseIfFailedStart(tournament_id: number, user_id: number) {
    if (!walletClient) {
        throw new Error("Wallet client not available");
    }
    const { request } = await publicClient.simulateContract({
        account: clientAddress,
        address: CONTRACT_ADDRESS,
        abi: stakingAbi,
        functionName: 'reimburseIfFailedStart',
        args: [
            tournament_id,
            user_id
        ],
    });
    await walletClient.writeContract(request);
}

/**
 * saveResultsAndTransferToken (nonpayable)
 * Only the tournament creator can call this after the tournament is finished.
 */
export async function saveResultsAndTransferToken(
    user_scores: bigint[], // or string[] if your client returns strings
    user_ids: bigint[],    // or string[]
    tournament_id: number
) {
    if (!walletClient) {
        throw new Error("Wallet client not available");
    }
    const { request } = await publicClient.simulateContract({
        account: clientAddress,
        address: CONTRACT_ADDRESS,
        abi: stakingAbi,
        functionName: 'saveResultsAndTransferToken',
        args: [
            user_scores,
            user_ids,
            tournament_id
        ],
    });
    await walletClient.writeContract(request);
}
