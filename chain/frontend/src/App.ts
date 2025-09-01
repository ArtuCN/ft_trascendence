import { connectWallet } from './Wallet';


window.onload = () => {

	const connectBtn = document.getElementById("connectBtn");
	const accountInfo = document.getElementById("accountInfo");

	if (connectBtn && accountInfo) {
		connectBtn.onclick = async () => {
			const { client, account } = await connectWallet();
			if (account)
				accountInfo.textContent = "Connected: " + account;
			else
				accountInfo.textContent = "Connection failed";
			return (client);
		};
	};
};
