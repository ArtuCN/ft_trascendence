import { fujiC } from "./chains.js";
import { createWalletClient, WalletClient, type Address, custom } from 'viem';

declare global {
	interface Window {
		ethereum?: any;
	}
}
	
let _walletClient: WalletClient | null = null;
let _account: Address | null = null;

export async function connectWallet() {
	if (typeof window === "undefined") throw new Error("Browser only");
	if (!window.ethereum) throw new Error("No injected provider (MetaMask required)");

	const client = createWalletClient({
		transport: custom(window.ethereum),
		chain: fujiC,
	});

	_walletClient = client;
	const [ address ] =  await client.requestAddresses();
	_account = address;

	try {
		window.ethereum.on?.("accountsChanged", (accounts: Address[]) => {
			_account = accounts[0] ?? null;
			_walletClient = createWalletClient({
				transport: custom(window.ethereum),
				chain: fujiC,
			});
		});
		window.ethereum.on?.("chainChanged", () => {
			_walletClient = null;
			_account = null;
		});
	} catch (e) {
		console.error("Error setting up wallet listeners:", e);
	}

	return { client, address };
}

export function getStoredWalletClient(): WalletClient | null {
	return _walletClient;
}

export function getStoredAccount(): Address | null {
	return _account;
}

export function disconnectWallet(): void {
	_walletClient = null;
	_account = null;
}
