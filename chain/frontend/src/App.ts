import { connectWallet, getStoredAccount } from './Wallet';


document.addEventListener('DOMContentLoaded', () => {

	const connectBtn = document.getElementById("connectBtn");
	const accountInfo = document.getElementById("accountInfo");
	const testBtn = document.getElementById("testBtn");

	if (connectBtn && accountInfo) {
		connectBtn.onclick = async () => {
			const { client, account } = await connectWallet();
			if (account)
				accountInfo.textContent = "Connected: " + account;
			else
				accountInfo.textContent = "Connection failed";
		};
	}

	if (testBtn) {
		testBtn.onclick = async () => {
			console.log("test click");
			const address: string | null =  getStoredAccount();
			if (address)
				console.log(address);
			else
				console.log("error getting address");
		};

	}
	else
		console.log("no test button");
});
