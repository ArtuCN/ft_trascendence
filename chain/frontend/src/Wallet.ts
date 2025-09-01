import { fujiC } from "./chains";
import { createWalletClient, http } from 'viem'

declare global {
	interface Window {
		ethereum?: any;
	}
};
	
export async function connectWallet() {


	const accounts = await window.ethereum!.request({ method: 'eth_requestAccounts' });
	const account = accounts[0];

	const client = createWalletClient({
		account,
		chain: fujiC,
		transport: http()
	});

	return { client, account };
}
