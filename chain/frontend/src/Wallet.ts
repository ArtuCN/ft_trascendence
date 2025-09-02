import { fujiC } from "./chains";
import { createWalletClient, WalletClient, custom, http } from 'viem'

declare global {
	interface Window {
		ethereum?: any;
	}
};
	
let _walletClient: WalletClient | null = null;
let _account: string | null = null;

export async function connectWallet() {
	if (typeof window === "undefined") throw new Error("Browser only");
	if (!window.ethereum) throw new Error("No injected provider");


	const accounts = await window.ethereum!.request({ method: 'eth_requestAccounts' });
	const account = accounts[0];

	const client = createWalletClient({
		transport: custom(window.ethereum),
		chain: fujiC,
		account,
	});

	_walletClient = client;
	_account = account;

	try {
		window.ethereum.on?.("accountsChanged", (accounts: string[]) => {
			_account = accounts[0] ?? null;
			// update wallet client with new account if you want:
			_walletClient = createWalletClient({
				transport: custom(window.ethereum),
				chain: fujiC,
				account,
			});
		});
		window.ethereum.on?.("chainChanged", () => {
			_walletClient = null;
		});
	} catch (e) {}

	return { client, account };
}

export function getStoredWalletClient(): WalletClient | null {
	return _walletClient;
}

export function getStoredAccount(): string | null {
	return _account;
}

export function getWalletClientOnDemand() {
	if (typeof window === "undefined") throw new Error("Browser only");
	if (!window.ethereum) throw new Error("No injected provider");
	// create a client but do NOT request accounts here, MetaMask will prompt on tx/sign
	return createWalletClient({ transport: custom(window.ethereum), chain: fujiC });
}

export function getReadClient() {
	if (typeof window === "undefined") throw new Error("Browser only");
	if (!window.ethereum) throw new Error("No injected provider");

	const accounts = await window.ethereum!.request({ method: 'eth_requestAccounts' });
	const account = accounts[0];

	const client = createWalletClient({
		transport: http(),
		chain: fujiC,
		account,
	});

	return {client, account};
}
