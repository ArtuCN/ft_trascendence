import { fujiC } from "./chains";
import { createWalletClient, WalletClient, type Address, custom, http } from 'viem'

declare global {
	interface Window {
		ethereum?: any;
	}
};
	
let _walletClient: WalletClient | null = null;
let _account: Address | null = null;

export async function connectWallet() {
	if (typeof window === "undefined") throw new Error("Browser only");
	if (!window.ethereum) throw new Error("No injected provider");


	const client = createWalletClient({
		transport: custom(window.ethereum),
		chain: fujiC,
	});

	_walletClient = client;
	const [ address ] =  await client.requestAddresses();
	_account = address;

	try {
		window.ethereum.on?.("accountsChanged", (address: Address) => {
			_account = address ?? null;
			_walletClient = createWalletClient({
				transport: custom(window.ethereum),
				chain: fujiC,
			});
		});
		window.ethereum.on?.("chainChanged", () => {
			_walletClient = null;
		});
	} catch (e) {}

	return { client, address };
}

export function getStoredWalletClient(): WalletClient | null {
	return _walletClient;
}

export function getStoredAccount(): Address | null {
	return _account;
}

export function getWalletClientOnDemand() {
	if (typeof window === "undefined") throw new Error("Browser only");
	if (!window.ethereum) throw new Error("No injected provider");
	// create a client but do NOT request accounts here, MetaMask will prompt on tx/sign
	return createWalletClient({ transport: custom(window.ethereum), chain: fujiC });
}
