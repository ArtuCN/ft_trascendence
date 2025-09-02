// src/contract.ts
// Contract interaction layer (viem). Exports read and write helpers.
// Assumes vite env vars: VITE_RPC_URL and VITE_CONTRACT_ADDRESS
//
// ABI is imported from ../Staking1.abi.json — adjust path if needed.

import { createPublicClient, createWalletClient, http, custom, parseUnits, Address } from 'viem'
import stakingAbi from './abi/Staking1.abi.json'
import { fujiC } from './chains';

// --- env / constants ---
const CONTRACT_ADDRESS = (import.meta.env.VITE_CONTRACT_ADDRESS as string) as Address

if (!CONTRACT_ADDRESS) {
	console.warn('VITE_CONTRACT_ADDRESS not provided. Set it in your .env (Vite) file.')
}

// --- clients ---
// Read-only client (uses RPC_URL)
export const publicClient = createPublicClient({ 
	chain: fujiC,
	transport: http()
})

// Wallet client (uses the injected wallet like MetaMask if available)
export function getWalletClient() {
	if (typeof window === 'undefined') throw new Error('Wallet client only available in browser.')
		const anyWin = window as any
	if (!anyWin.ethereum) throw new Error('No injected wallet found on window.ethereum')
		// use viem custom transport over the injected provider
		return createWalletClient({
			transport: custom(anyWin.ethereum),
		})
}

// --- helper wrappers ---
// Read-only helpers
export async function getTournamentData(tournamentIndex: number) {
	const res = await publicClient.readContract({
		address: CONTRACT_ADDRESS,
		abi: stakingAbi as any,
		functionName: 'getTournamentData',
		args: [BigInt(tournamentIndex)],
	})
	// res is an array-like return (matching the ABI outputs)
	return res
}

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
	return res
}

// --- write / payable helpers ---
// Generic write helper: returns the transaction hash
async function writeContract(functionName: string, args: any[] = [], valueWei?: bigint) {
	const walletClient = getWalletClient()
	// value optional for payable functions
	const txHash = await walletClient.writeContract({
		address: CONTRACT_ADDRESS,
		abi: stakingAbi as any,
		functionName,
		args,
		// if value is undefined, omit it; viem's writeContract accepts it optionally
		...(valueWei ? { value: valueWei } : {}),
	})
	return txHash
}

/**
	* stake:
	* - tournament_id: number
* - _user_id: number
* - _username: string
* - _user_wallet: address (string)
* - stakeValueEth: string (e.g. "0.01")
*
	* returns: txHash (string / Hex)
*/
export async function stake(
	tournament_id: number,
	_user_id: number,
	_username: string,
	_user_wallet: string,
	stakeValueEth: string
) {
	const valueWei = parseUnits(stakeValueEth, 18) // returns bigint
	const txHash = await writeContract('stake', [BigInt(tournament_id), BigInt(_user_id), _username, _user_wallet], valueWei)
	return txHash
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
	_user_wallet: string,
	_min_stake_eth: string
) {
	const minStakeWei = parseUnits(_min_stake_eth, 18)
	const txHash = await writeContract('startPayableTournament', [BigInt(_NofPlayers), BigInt(_user_id), _username, _user_wallet, minStakeWei], minStakeWei)
	return txHash
}

/**
	* reimbursePlayer (nonpayable, owner-only maybe)
*/
export async function reimbursePlayer(tournament_id: number, user_id: number) {
	const txHash = await writeContract('reimbursePlayer', [BigInt(tournament_id), BigInt(user_id)])
	return txHash
}

/**
	* Example helper to wait for a tx receipt using the public client
* (useful if you want to await confirmation)
	*/
export async function waitForTx(hash: string, confirmations = 1, timeoutMs = 120_000) {
	const start = Date.now()
	while (Date.now() - start < timeoutMs) {
		const receipt = await publicClient.getTransactionReceipt({ hash })
		if (receipt && (receipt.confirmations ?? 0) >= confirmations) {
			return receipt
		}
		// simple poll delay
		await new Promise((r) => setTimeout(r, 1000))
	}
	throw new Error('Timeout waiting for transaction receipt')
}

