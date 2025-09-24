import { connectWallet } from './Wallet';
import { type Address, type WalletClient, parseUnits } from 'viem';
import { testReturn, stake, startPayableTournament, getTournamentData } from './Contract';

const connectBtn = document.getElementById('connectBtn') as HTMLButtonElement | null;
const accountInfo = document.getElementById('accountInfo') as HTMLDivElement | null;
const testBtn = document.getElementById('testBtn') as HTMLButtonElement | null;
const DataBtn = document.getElementById('dataBtn') as HTMLButtonElement | null;
const infoBlock = document.getElementById('infoBlock') as HTMLDivElement | null;

// --- stake form fields ---
const stakeTournamentId = document.getElementById('stakeTournamentId') as HTMLInputElement | null;
const stakeUserId = document.getElementById('stakeUserId') as HTMLInputElement | null;
const stakeUsername = document.getElementById('stakeUsername') as HTMLInputElement | null;
const stakeUserWallet = document.getElementById('stakeUserWallet') as HTMLInputElement | null;
const stakeValueEth = document.getElementById('stakeValueEth') as HTMLInputElement | null;
const stakeBtn = document.getElementById('stakeBtn') as HTMLButtonElement | null;

// --- start tournament form fields ---
const startNofPlayers = document.getElementById('startNofPlayers') as HTMLInputElement | null;
const startUserId = document.getElementById('startUserId') as HTMLInputElement | null;
const startUsername = document.getElementById('startUsername') as HTMLInputElement | null;
const startUserWallet = document.getElementById('startUserWallet') as HTMLInputElement | null;
const startMinStakeEth = document.getElementById('startMinStakeEth') as HTMLInputElement | null;
const startBtn = document.getElementById('startBtn') as HTMLButtonElement | null;

// --- getTournamentData
const tournamentDataId = document.getElementById('tournamentDataId') as HTMLInputElement | null;

const CONTRACT_ADDRESS: Address = (import.meta.env.VITE_CONTRACT_ADDRESS as string) as Address
let _client: WalletClient | null = null;
let _account: Address | null = null;

// connect handler
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

// test handler
testBtn?.addEventListener('click', async () => {
  if (!_client || !_account) {
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

// stake handler
stakeBtn?.addEventListener('click', async () => {
  if (!_client || !_account) {
    infoBlock!.innerHTML += `<p>Please connect your wallet first</p>`;
    return;
  }
  try {
    await stake(
      Number(stakeTournamentId!.value),
      Number(stakeUserId!.value),
      stakeUsername!.value,
      stakeUserWallet!.value as Address,
      stakeValueEth!.value
    );
    infoBlock!.innerHTML += `<p>Stake transaction sent!</p>`;
  } catch (err) {
    console.error('stake failed', err);
    infoBlock!.innerHTML += `<p>Stake failed</p>`;
  }
});

// startPayableTournament handler
startBtn?.addEventListener('click', async () => {
  if (!_client || !_account) {
    infoBlock!.innerHTML += `<p>Please connect your wallet first</p>`;
    return;
  }
  try {
    const result = await startPayableTournament(
      Number(startNofPlayers!.value),
      Number(startUserId!.value),
      startUsername!.value,
      startUserWallet!.value as Address,
      startMinStakeEth!.value
    );
    infoBlock!.innerHTML += `<p>Tournament started! ID: ${result}</p>`;
  } catch (err) {
    console.error('startPayableTournament failed', err);
    infoBlock!.innerHTML += `<p>Start tournament failed</p>`;
  }
});

DataBtn?.addEventListener('click', async () => {
  if (!_client || !_account) {
    infoBlock!.innerHTML += `<p>Please connect your wallet first</p>`;
    return;
  }
  try {
    const result = await getTournamentData(Number(tournamentDataId!.value));
    infoBlock!.innerHTML += `<p>Tournament data: ${result}</p>`;
  } catch (err) {
    console.error('couldnt get tournament data', err);
    infoBlock!.innerHTML += `<p>no tournament data</p>`;
  }

});
