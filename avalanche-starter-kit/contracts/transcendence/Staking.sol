// SPDX-License-Identifier: Ecosystem

pragma solidity 0.8.25;

import "./TournamentScores.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


//TODO: malicious owner of tournament could potentially steal peoples money (need a fix for this), some ecdsa between backend server and contract
// the server could have a special signature for hashing certain parts
//TODO: add a way if something went wrong in tournament and couldn't finish to reimburse money

contract Staking is TournamentScores {


	//events ######################
	event tournamentCreated(string msg1, uint256 id_tournament, string msg2, uint256 amount_staked);
	event StakeSuccess(string msg1, uint256 id_tournament, string msg2, uint256 amount_staked);
	event StakeGoalReached(string msg1, uint256 id_tournament, string msg2, uint256 amount_staked);
	event timeForStakePassed(string msg);
	event reimbursedStakes(string msg);
	event restTransferToOwner(string msg);
	event tournamentStarted(string msg, uint256 tour_id);

	//errors ######################
	// error numberToHigh(string msg, uint256 NofPlayers);
	// error indexOutOfBounds(string msg, uint256 passedIndex);
	error insufficientAmount(string msg, uint256 amount);
	error tournamentAlreadyFinished(string msg, uint256 tournament_id);
	error wrongUsersPassed(string msg, uint256[8] user_ids);
	error wrongUser(string msg, uint256 user_id);
	error timePassed(string msg, uint256 tour_id);
	error tournamentInProgress(string msg, uint256 tournament_id);

	//structs ######################
	struct user {
		uint256	user_id;
		string	username;
		address user_wallet;
	} //player info

	struct	payableTournament {
		uint256	NofPlayers;
		uint256[8]	user_ids;
		uint256	min_stake;
		uint256	stake_goal;
		bool	is_finished;
		bool	has_started;
		bool	is_reimbursed;
		uint256	created_at;
	} // created tournament info

	struct Pair {
			uint256 user_score;
			uint256	user_id;
	} // for placement ordering


	//vars ######################
	payableTournament[]								private	_tournaments; //info about tournament and its players
	mapping(uint256 => user)						private _users;
	mapping(address => uint256[]) 					private	_ownersOfTournaments; //addresses of creators of tournaments
	mapping(uint256 => mapping(address => uint256)) private _tournamentBalances; //balance for each participant of the all the tournaments
	mapping(uint256 => uint256)						private _tournamentTotalStake; //total amount staked for each tournament
	uint256											private	_current_tournament; //index of last currently created tournament
	uint256											public	threshold = 1000000; //min amount that can be proposed as stake

	address											public	owner;
	// address 										public	tournamentScoresContract;
	// TournamentScores								private tournamentScores;


	//constructor ######################
	constructor(address _owner) {
		require(_owner != address(0), "owner cannot be zero address!");
		// if (_tournamentScoresContract == address(0))
		// 	revert("no contract provided");

		// tournamentScoresContract = _tournamentScoresContract;
		// tournamentScores = TournamentScores(tournamentScoresContract);
	}






	//functions ######################



	// -------------- PUBLIC (MODIFY STATE) --------------

	//create a tournament with specific staking -----------------------------------
	/*
		one player decides to create a tournament.
		this tournament is not yet complete until enough players join (stake).
		function RETURNS the id of tournament,
		which can be then used for other players to find it
		struct for saving data is payableTournament
		and it is stored in an array of structs called _tournaments (private)
		- might make it public;
		there is another public tournament array for finished tournaments.	
	*/
	function startPayableTournament(
		uint256			_NofPlayers,	
		uint256			_user_id,
		string	memory	_username,
		address			_user_wallet,
		uint256			_min_stake
	) public payable returns(uint256 tournament_id) {

		if (_NofPlayers > 8)
			revert numberToHigh("Too many players", _NofPlayers);
		if (msg.value < threshold || msg.value < _min_stake)
			revert insufficientAmount("insufficient funds allocated, min: ",
									 _min_stake > threshold ? _min_stake : threshold);

		payableTournament memory tournament;

		tournament.min_stake = _min_stake;
		tournament.stake_goal = _min_stake * _NofPlayers; //stake goal should be sum of minimum stakes from all participants
		tournament.is_finished = false;
		tournament.has_started = false;
		tournament.is_reimbursed = false;
		tournament.NofPlayers = _NofPlayers;
		tournament.created_at = block.timestamp;
		tournament.user_ids[0] = _user_id;

		//create new user if not stored already
		if (_users[_user_id].user_id == 0) {
			_users[_user_id] = user({
				user_id: _user_id,
				username: _username,
				user_wallet: _user_wallet
			});
		}

		////save user id in tournament struct
		//payableTournament storage tour = _tournaments[tournament_id];

		//uint256 temp_idx;
		//for (temp_idx = 0; temp_idx < tour.NofPlayers; temp_idx++) {
		//	if (tour.user_ids[temp_idx] == 0)
		//		break;
		//}
		//if (temp_idx >= tour.NofPlayers) 
		//	revert numberToHigh("Too many players already: ", tour.NofPlayers);
		//tour.user_ids[temp_idx] = _user_id;

		_tournaments.push(tournament);
		_ownersOfTournaments[msg.sender].push(_current_tournament + 1);
		_tournamentBalances[_current_tournament][msg.sender] = msg.value;
		_current_tournament++;

		emit tournamentCreated("You have successfully created tournament with id: ",
							   _current_tournament -1,
							   " and staked an amount of: " ,
							   msg.value);
		return(_current_tournament -1);
	}

	//stake ------------------------------------------------------
	/*
		after tournament is created by the "owner" 
		other participants can apply to the tournament by staking the min amount.
		not everyone needs to stake if the stake goal is reached 
		(1 player can stake for the whole tournament if he so desires)
		if in 10 min stake goal is not reached,
		the stakes are returned to player wallets (func. checkTournamentStatus)

		new users are saved on chain for better storage management (private)

		function RETURNS the index of the last user who staked,
		if tournament is already full, returns 0
	*/
	function stake(uint256			tournament_id,
				   uint256			_user_id,
				   string	memory	_username,
				   address			_user_wallet
	) public payable  returns(uint256 currPlayerIdx) {

		if (msg.value < threshold || msg.value < _tournaments[tournament_id].min_stake)
			revert insufficientAmount("insufficient funds allocated, min: ",
									 _tournaments[tournament_id].min_stake > threshold ?
										 	_tournaments[tournament_id].min_stake 
											: threshold);

		if (checkTime(tournament_id) == 58008)
			revert timePassed("time too stake has passed for tournament: ", tournament_id);

		//save new user data to tournament
		payableTournament storage tour = _tournaments[tournament_id];
		uint256 temp_idx;
		for (temp_idx = 0; temp_idx < tour.NofPlayers; temp_idx++) {
			if (tour.user_ids[temp_idx] == 0)
				break;
		}
		if (temp_idx < tour.NofPlayers || !tour.has_started)
			tour.user_ids[temp_idx] = _user_id;
		if (checkTournamentStatus(tournament_id)) {
			tour.has_started = true;
			emit tournamentStarted("tournament has enough players and can start, id: ",
								   tournament_id);
								   return (0);
		}

		//update staked amounts
		uint256 newTotalStake = _tournamentTotalStake[tournament_id] + msg.value;
		uint256 refund = newTotalStake > tour.stake_goal ?
			newTotalStake - tour.stake_goal : 0;
		if (refund > 0 && refund <= msg.value)
			payable(msg.sender).transfer(refund);
		_tournamentBalances[tournament_id][msg.sender] += msg.value - refund;
		_tournamentTotalStake[tournament_id] += msg.value - refund;

		//create new user if not stored already
		if (_users[_user_id].user_id == 0) {
			_users[_user_id] = user({
				user_id: _user_id,
				username: _username,
				user_wallet: _user_wallet
			});
		}


		emit StakeSuccess(" you have staked to tournament: ",
						  tournament_id,
						  " amount of: ",
						  msg.value);

		if (_tournamentTotalStake[tournament_id] >= tour.stake_goal)
			emit StakeGoalReached(" the tournament with id: ",
								  tournament_id,
								  " has reached the stake amount and is ready to begin, amount: ",
								  _tournamentTotalStake[tournament_id]);

		if (tour.user_ids.length == tour.NofPlayers){
			tour.has_started = true;
			emit tournamentStarted("tournament has enough players and can start, id: ",
								  tournament_id);
		return (temp_idx);
		}


	}

	// reimbursement of player who stops before tournament begins -----------------------------------
	/*
		it check if user is part of the tournament, if msg.sender is actually this user
		and then transfers back his stake, only if tournament has not started yet
	*/
	function	reimbursePlayer(uint256 tournament_id, uint256 user_id) public {

		payableTournament	memory tour = _tournaments[tournament_id];
		if (tour.has_started == true)
			revert tournamentInProgress("can't execute because tournament already started, id: ", tournament_id);
		mapping(address => uint256) storage balances = _tournamentBalances[tournament_id];
		address	user_wallet = address(0);

		for (uint256 i  = 0; i < tour.NofPlayers; i++) {
			if (tour.user_ids[i] == user_id) {
				user_wallet = _users[user_id].user_wallet;
				break ;
			}
		}
		if (user_wallet == address(0) || user_wallet != msg.sender)
			revert wrongUser("this user is not a part of the tournament: ", user_id);

		uint256 refundAmount = balances[user_wallet];
		payable(user_wallet).transfer(refundAmount);
		balances[user_wallet] -= refundAmount;
		deletePlayer(tournament_id, user_id);

	}

	// reimburse if tournament didn't start -----------------------------------------------
	/*
		any participant can run this function if they are participating in the tournament
		it reimburses all the tournament participants, only if tournament could't start
	*/
	function reimburseIfFailedStart(uint256 tournament_id, uint256 user_id) public {

		payableTournament memory tour = _tournaments[tournament_id];
		uint256 i;
		for(i = 0; i < tour.NofPlayers; i++) {
			user memory u = _users[user_id];
			if (tour.user_ids[i] == user_id && u.user_wallet == msg.sender)
				break ;
		}
		uint256 time_passed = checkTime(tournament_id);
		if (i != tour.NofPlayers)
			revert wrongUser("user can't execute this process, user id: ", user_id);
		if (tour.has_started)
			revert tournamentInProgress("tournament is already in progress, id: ", tournament_id);
		if (!tour.is_finished && !tour.is_reimbursed && time_passed == 58008)
			reimburseAll(tournament_id, "tournament could't start, reimbursing all stakes");
	}

	//save tournament data and distribute prizes ----------------------------------------------
	/*
		we do it after we know the tournament is finished, 
		only the one who created the tournament can post data to blockchain, 
		to protect against spoofing, and duplicate transactions
		logic for storing finished tournament data is inherited from TournamentScores contract

		the balances are rearanged based on tournament placement and redistributed (90%)
		9% goes to contract owner, 1% goes to tournament owner for gas fees

	*/
	function saveResultsAndTransferToken(uint256[8]	memory	user_scores,
						 uint256[8]	memory	user_ids,
						 uint256				tournament_id
	)	public {

		if (_tournaments.length <= tournament_id)
			revert indexOutOfBounds("Tournament_id is to high, max id is: ", _tournaments.length -1);
		payableTournament	memory tour = _tournaments[tournament_id];
		uint256[] 			memory	ownedTournaments = _ownersOfTournaments[msg.sender];
		bool						is_owner = false;
		if (tour.is_finished || tour.is_reimbursed)
			revert tournamentAlreadyFinished(
				"Tournament is still in progress or was already reimbursed, tournament id: ",
				tournament_id
			);

		for (uint256 i = 0; i < ownedTournaments.length; i++){
			if (ownedTournaments[i] == tournament_id) {
				is_owner = true;
				break;
			}
		}
		if (!is_owner)
			revert wrongUser("Sender is not the owner of the tournament: ", tournament_id);

		//organize user_ids and scores if not same as saved on chain
		uint256[8] memory reorder_scores;
		for (uint256 i = 0; i < tour.NofPlayers; i++) {
			for (uint256 j = 0; j < tour.NofPlayers; j++) {
				if (tour.user_ids[i] == user_ids[j]) {
					reorder_scores[i] = user_scores[j];
					break;
				}
			}
		}
		if (reorder_scores.length != user_scores.length)
			revert wrongUsersPassed("the users passed, are not the same as saved on chain. user_ids on chain: ", tour.user_ids);

		//concat winning_names into one string
		uint256[8][8] memory placements = tournamentPlacement(reorder_scores, tour.user_ids);
		string memory winning_names;
		for (uint256 i = 0; i < placements[0].length - 1; i++) {
			user memory u = _users[tour.user_ids[i]];
            winning_names = string(abi.encodePacked(winning_names, u.username, ";"));
		}
		user memory usr = _users[tour.user_ids[user_ids.length -1]];
		winning_names = string(abi.encodePacked(winning_names, usr.username));

		//save the correct data to TournamentScores contract
		saveTournamentData(tour.NofPlayers,
							tour.user_ids,
							reorder_scores,
							placements[0],
							winning_names,
							tournament_id);

		//TRANSFERS
		//only change tournament balances
		distributePrizes(tournament_id, placements);
		//transfer 1% to tournament owner - reimburse gasfees
		payable(msg.sender).transfer(tour.stake_goal / 100);
		//transfer the new balances back to players
		reimburseAll(tournament_id, 
					 "Tournament finished, all players have received their winnings");
		//transfer rest
		transferRestToOwner(tournament_id, tour);
		
	}

	



	// -----------------PUBLIC VIEW ONLY --------------------------

	//check if goal is reached --------------------------------------------------- 
	/*
		a view only function that RETURNS true if the stake goal is reached
	*/
	function	isGoalReached(uint256 tournament_id) public view returns(bool isReached) {

		if (_tournaments.length <= tournament_id)
			revert indexOutOfBounds("Tournament_id is to high, max id is: ", _tournaments.length -1);

		payableTournament memory tour = _tournaments[tournament_id];

		if (_tournamentTotalStake[tournament_id] >= tour.stake_goal)
			return (true);
		return (false);
	}

	//check if tournament is finished already ------------------------------------------
	/*
		returns true if the tournament already concluded
	*/
	function isTournamentFinished(uint256 tournament_id) public view returns(bool isFinished) {

		if (_tournaments.length <= tournament_id)
			revert indexOutOfBounds("Tournament_id is to high, max id is: ", _tournaments.length -1);

		payableTournament memory tour = _tournaments[tournament_id];

		if (tour.is_finished)
			return (true);
		return (false);
	}

	//check if all players have applied ---------------------------------------------------
	/*
		returns true if all players have signed up for the tournament
	*/
	function hasAllPlayers(uint256 tournament_id) public view returns(bool hasAll) {
		
		if (_tournaments.length <= tournament_id)
			revert indexOutOfBounds("Tournament_id is to high, max id is: ", _tournaments.length -1);

		payableTournament memory tour = _tournaments[tournament_id];

		uint256 i = 0;
		for (i = 0; i < tour.NofPlayers; i++) {
			if (tour.user_ids[i] == 0)
				return (false);
		}
		if (i != tour.NofPlayers)
			return (false);
		return (true);
	}

	// check if we need to reimburse or continue with tournament ---------------------------
	/*
		returns true if the tournament can start (enough players,
		stake goal reached, if it was already played).
		puts a timelimit of 10min for the staking of tournament to conclude,
		otherwise reimburses automatically
	*/
	function checkTournamentStatus(uint256 tournament_id) public view returns(bool canStart) {

		if (_tournaments.length <= tournament_id)
			revert indexOutOfBounds("Tournament_id is to high, max id is: ", _tournaments.length -1);
		
		if (isTournamentFinished(tournament_id))
			return (false);

		payableTournament memory tour = _tournaments[tournament_id];
		bool start = false;

		//time check and reimbursement
		if (block.timestamp > tour.created_at + 10 minutes) {
			// emit timeForStakePassed("time to gather funds for tournament has passed");
			// reimburseAll(tournament_id, "the stakes have been reimbursed, tournament didn't start");
			return (false);
		}

		if (isGoalReached(tournament_id))
			start = true;
		if (!hasAllPlayers(tournament_id))
			start = false;

		return (start);
	}

	//check time remaining for staking (max 10min) ------------------------------
	/*
		returns how much time is still remaining,
		otherwise returns 58008 if time for staking has passed
	*/
	function checkTime(uint256 tournament_id) public view returns(uint256 timeRemaining) {
		if (_tournaments.length <= tournament_id)
			revert indexOutOfBounds("Tournament_id is to high, max id is: ", _tournaments.length -1);
		uint256 elapsed_time = block.timestamp - _tournaments[tournament_id].created_at;

		return (elapsed_time < 10 minutes ?
					(10 minutes - elapsed_time) / 60
					: 58008);
	}





	// -----------------------PRIVATE --------------------------------


	// ---------money transfers ----------------------

	// reimburse all players of the tournament ---------------------------------
	function reimburseAll(uint256 tournament_id, string memory msg) private {

		payableTournament memory tour = _tournaments[tournament_id];
		mapping(address => uint256) storage balances = _tournamentBalances[tournament_id];

		for (uint64 i = 0; i < tour.NofPlayers; i++) {
			user memory curr_user = _users[tour.user_ids[i]];
			uint256 	balance = balances[curr_user.user_wallet];
			if (balance > 0) {
				payable(curr_user.user_wallet).transfer(balance);
				balances[curr_user.user_wallet] = 0;
			}
		}
		tour.is_reimbursed = true;
		tour.is_finished = true;
		_tournamentTotalStake[tournament_id] = 0;
		emit reimbursedStakes(msg);
	}

	function transferRestToOwner(uint256 tournament_id, payableTournament memory tour) private {

		mapping(address => uint256) storage balances = _tournamentBalances[tournament_id];
		uint256[8] memory ids = tour.user_ids;
		uint256			  ownerShare = (tour.stake_goal * 9) / 100;

		payable(owner).transfer(ownerShare);
		for (uint256 i = 0; i < ids.length; i++) {
			address currAddress = _users[ids[i]].user_wallet;
			if (balances[currAddress] > 0)
				payable(owner).transfer(balances[currAddress]);
			balances[currAddress] = 0;
		}
		 
		emit restTransferToOwner(
			"the rest of the tournament stake has been transferred to contract owner"
		);

	}

	// ---------------------other helper functions ---------------------


	// distribute prizes ------------------------------------------------
	/*
		distribute prizes based on tournament score
		total prize pool 90% of stake 10% to the house
		1st place 50% (of prize pool, not total staked amount)
		2nd 30%
		3rd 15%
		4th 5%
		if more players have the same ranking this also gets calculated fairly
		ex: 2 first places (50% + 30%) = 80%, so each get 40%,
		the first on second place then gets 15%
		note: this just changes the balances of players, no transfer yet
	*/
	function distributePrizes(uint256 tournament_id, uint256[8][8] memory placements) private {

		payableTournament memory tour = _tournaments[tournament_id];
		mapping(address => uint256) storage balances = _tournamentBalances[tournament_id];
		uint256	prizePool = (tour.stake_goal * 9) / 10;
        uint256[] memory percentages = new uint256[](4);
        percentages[0] = 50;
        percentages[1] = 30;
        percentages[2] = 15;
        percentages[3] = 5;

		uint256 percentIdx = 0;
		uint256 totalPercentage = 0;
		uint256 personalPercentage = 0;
		uint256 currId = 0;
		uint256	sharedPlacementUsers = 0;
		for (uint256 i = 0; i < placements.length; i++) {
			for (uint256 j = 0; j < placements[i].length; j++) {
				if (placements[i][j] == 0)
					break ;
				else if (percentIdx < percentages.length) {
					totalPercentage += percentages[percentIdx++];	
				}
				sharedPlacementUsers++;
			}
			personalPercentage = totalPercentage > 0 && sharedPlacementUsers > 0 ?
					totalPercentage / sharedPlacementUsers 
					: 0;
			for (uint256 k = 0; k < sharedPlacementUsers; k++) {
				currId = placements[i][k];
				user	storage currUser = _users[currId];
				balances[currUser.user_wallet] = (prizePool * personalPercentage) / 100;
			}
			totalPercentage = 0;
			personalPercentage = 0;
			sharedPlacementUsers = 0;
			if (percentIdx >= percentages.length)
				break;
		}
	}


 
	//placement in tournament (first to last) -----------------------------------
	/*
		used for distributing prizes fairly and for saving  tournament results to blockchain
		returns a 2d array of fixed size 8x8 where arr[0] is all who placed first (if same score),
		arr[1] are who placed 2nd, and so on ....
	*/
	function tournamentPlacement(uint256[8]	memory	user_scores,
								 uint256[8]	memory	user_ids
	)	private pure returns(uint256[8][8] memory placements) {

		//populate
		Pair[8] memory	pairs;
		for (uint64	i = 0; i < user_scores.length; i++) {
			pairs[i] = Pair(user_scores[i], user_ids[i]);
		}

		//sort
		for (uint256 i = 0; i < pairs.length; i++) {
			Pair memory curr = pairs[i];
			uint256 j = i;
			while (j > 0 && pairs[j - 1].user_score < curr.user_score) {
				pairs[j] = pairs[j-1];
				j--;
			}
			pairs[j] = curr;
		}

		//put in correct placement
		uint256 placement = 0;
		uint256 idx = 0;
		for (uint256 i = 0; i < pairs.length; i++) {
			if (i == 0 || pairs[i].user_score == pairs[i -1].user_score) {
				placements[placement][idx++] = pairs[i].user_id;
			}
			else {
				idx = 0;
				placement++;
				placements[placement][idx++] = pairs[i].user_id;
			}
		}
		return (placements);
	}


	// delete player from tournament -------------------------------
	/*
		used when a player decides to step out of tournament before it starts.
		it resets the number of players pushing all of them one place to the start
		from user_id index in the array
	*/
	function deletePlayer(uint256 tournament_id, uint256 user_id) private {

		payableTournament storage tour = _tournaments[tournament_id];

		for (uint256 i = 0; i < tour.NofPlayers; i++) {
			if (tour.user_ids[i] == user_id) {
				for (uint256 j = i + 1; j < tour.NofPlayers; j++) {
					tour.user_ids[j - 1] = tour.user_ids[j];
				}
				break;
			}
			if (tour.user_ids[i] == 0)
				break ;
		}
	}
	
	
	//withdraw -- might not do the withdraw function - 
	// so only after tournaments can owner get his share, and not just take what he wants


}
