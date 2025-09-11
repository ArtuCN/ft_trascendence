import { connectWallet } from './Wallet';
import { type Address, type WalletClient } from 'viem';
import { testReturn } from './Contract';

const connectBtn = document.getElementById('connectBtn') as HTMLButtonElement | null;
const accountInfo = document.getElementById('accountInfo') as HTMLDivElement | null;
const testBtn = document.getElementById('testBtn') as HTMLButtonElement | null;
const infoBlock = document.getElementById('infoBlock') as HTMLDivElement | null;
const inputHolder = document.getElementById("input") as HTMLInputElement | null;

const CONTRACT_ADDRESS: Address = (import.meta.env.VITE_CONTRACT_ADDRESS as string) as Address
let _client: WalletClient | null = null;
let _account: Address | null = null;

// // connect handler
connectBtn?.addEventListener('click', async () => {
  try {
    const { client, address } = await connectWallet();
    _client = client;
    _account = address;
    accountInfo!.textContent = address ? `Connected: ${address}` : 'Connection failed';
	console.log("contract address: ", CONTRACT_ADDRESS);
  } catch (err) {
    console.error('connect failed', err);
    accountInfo!.textContent = 'Connection failed';
  }
});

// test handler always attached — checks connection when clicked
testBtn?.addEventListener('click', async (ev) => {
  console.log('test button clicked');
  if (!_client || !_account) {
    console.log('wallet not connected');
    infoBlock!.innerHTML += `<p>Please connect your wallet first</p>`;
    return;
  }

  try {
    const res = await testReturn();
    infoBlock!.innerHTML += `<p>${res}</p>`;
  } catch (err) {
    console.error('contract call failed', err);
    infoBlock!.innerHTML += `<p>Error calling contract</p>`;
  }
});

// inputHolder?.addEventListener(

// import { connectWallet } from './Wallet';
// import { type Address, type WalletClient } from 'viem';
// import { testReturn } from './Contract';


// document.addEventListener('DOMContentLoaded', () => {

// 	const connectBtn = document.getElementById("connectBtn");
// 	const accountInfo = document.getElementById("accountInfo");
// 	const testBtn = document.getElementById("testBtn");
// 	const infoBlock = document.getElementById("infoBlock");

// 	let _client: WalletClient | null = null;
// 	let _account: Address | null = null;
	

// 	if (connectBtn && accountInfo) {
// 		connectBtn.onclick = async () => {
// 			const { client, account } = await connectWallet();
// 			if (account)
// 				accountInfo.textContent = "Connected: " + account;
// 			else
// 				accountInfo.textContent = "Connection failed";
// 			_client = client;
// 			_account = account;

// 			if (_client && _account && testBtn) {
// 				testBtn.onclick = async () => {
// 					console.log("clickiiing");
// 					const res = await testReturn();
// 					if (infoBlock)
// 						infoBlock.innerHTML += `<p>${res}</p>`;
// 				}
// 			}
// 		};
// 	}
// });



