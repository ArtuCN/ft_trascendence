# saving game/tournament data to chain

## update

### created a new function for saving tournament data without the need for staking
**Details:**
* args:
    + _NofPlayers: how many players participated in the tournament
    + _user_ids: a fixed size  uint256 array `[8]` with user ids (if less than 8 players rest needs to be zeroed)
    + _user_scores: same as above, but for storing the scores (_user_ids`[0]` is the id that had the score of _user_scores`[0]` and so on. they need to map exactly)
    + _user_names: same as above but instead of uint256 its string`[8]` (still need to map exactly as the above examples)
    + _tournament_id: pass the id that is created in the applications backend for this specific tournament


* **frontend**:
    + stays the same as other functions in how it works.
    + function name to call: /src/Contracts.ts: saveTournamentData
    + function getUserTournaments to get all the tournaments user participated(only works with addresses)

<br>
    **important note**: remember to zero the rest of the arrays that are not used so for example a tournament of 4 would have _user_ids sth like this (`[345, 456, 23, 2345, 0, 0 ,0 ,0]`)

**structs in backend**:<br>

```solidity
	//structs
	struct tournament {
		uint256[8]	user_ids;
		address[8]	user_wallets;
		uint256[8] 	user_scores;
		uint256[8]	winner_ids;
		string		winner_names;
		uint256		tournament_id;
	}

	struct game {
		uint256[8]	user_ids;
		address[8]	user_wallets;
		uint256[8]	user_scores;
		uint256[8]	winner_ids;
		uint256		game_id;
	}
```



--------------------------------------------------------------------------<br>
<br>
## backend
smartContracts and config for chain (mostly you can let it be since everything is already on chain and functioning - hopefully)<br>
- contracts/transcendece  - here you find the contracts
- scripts - use deploy script if you change something in the contract to redeploy it. you will need to `export $PRIVATE_KEY`<br>
- if you redeploy its good to also rebuild the abi so steps are: <br>
    + forge deploy
    + use `jq` to preetty up the abi code. sth like this: `jq '.abi' out/Staking.sol/Staking.json > abi/Staking1.abi.json`
- redeployment command looks sth like this: `forge script script/Deploy.s.sol:Deploy --rpc-url fuji-c --broadcast`

<br><br>

## frontend

### content
* .env - you will need to put the contract addresses in the env, example:<br>
    VITE_CONTRACT_ADDRESS=0x3298....
    VITE_SCORES_ADDRESS=0xAd432....
* src dir:
    + abi/ - here you put the abi that was created in backend/
    + App.ts - a simple implementation to test the functions in browser
    + Wallet.ts - functions for connecting the wallet
    + Contract.ts - all the logic for executing functions of the contract
    + chains.ts - config for the avalanche fuji-c testnet chain
<br><br>
### usage
configure your .env. Run `npm i` and `npm run dev` to see the test example.<br>

**Contract.ts:**<br>
Here you have all the functions you need to implement UI.
+ getTournamentData - you will probably not need that one
+ getGameData - you pass the index of the game that was saved on chain to get the saved data for the game:
    * game_id
    * user_ids (fixed array,`bigInt[8]` so if there are only 2 players the rest of the indexes have 0 value)
    * user_wallets (same fixed array with same logic)
    * user_scores (same as the other two above)
    * winner_ids (fixed array of size 8- as the rest;<br> it shows all the user_ids who had the highest score of the game)
+ getUserGames - you pass the user address (can be the same as connected also)<br>
return is a dynamic array: number with the game_ids that the user participated in
+ saveGameData - this saves the game data to chain it returns the **game_id**
    * args to pass:
        - _user_ids (fixed array of size 8, number[])
        - _user_wallets (size 8, type Address[])
        - _user_scores (size 8 , number[])
+ mint - this mints a nft of a game if user participated in it; arg: (gameId: number)

the rest of the functions are not neccesary for minimal implementation<br><br>

**Wallet.ts**<br>
connecting the wallet:<br>
+ connectWallet - this will save the wallet and address temporarerly to be used with contract functions
+ getStoredWalletClient - you call this always when you need the walle client (writing to chain)
+ getStoredAccount - to get the account address<br><br>


**App.ts**<br>
Here you can quickly check how to call the functions. check the implementaion of buttons:<br>
* connectBtn - connectWallet function
* gameBtn - saveGameData function
* loadGameBtn - getGameData function
* userGamesBtn - getUserGames function
* mintGameBtn - mint function

