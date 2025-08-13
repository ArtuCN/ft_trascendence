// SPDX-License-Identifier: Ecosystem

pragma solidity 0.8.25;

import "./TournamentScores.sol";


contract Staking {


	//events ###
	event tournamentCreated(string msg1, uint256 id_tournament, string msg2, uint256 amount_staked);
	event StakeSuccess(string msg1, uint256 id_tournament, string msg2, uint256 amount_staked);
	event StakeGoalReached(string msg1, uint256 id_tournament, string msg2, uint256 amount_staked);
	event timeForStakePassed(string msg);
	event reimbursedStakes(string msg);

	//errors ###
	error numberToHigh(string msg, uint256 NofPlayers);
	error indexOutOfBounds(string msg, uint256 passedIndex);
	error insufficientAmount(string msg, uint256 amount);
	error tournamentAlreadyFinished(string msg, uint256 tournament_id);

	//structs ###
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
		uint256	created_at;
	} // created tournament info


	//vars ###
	payableTournament[]								private	_tournaments; //info about tournament and its players
	mapping(uint256 => user)						private _users;
	mapping(address => uint256[]) 					private	_ownersOfTournaments; //addresses of creators of tournaments
	mapping(uint256 => mapping(address => uint256)) private _tournamentBalances; //balance for each participant of the all the tournaments
	mapping(uint256 => uint256)						private _tournamentTotalStake; //total amount staked for each tournament
	uint256											private	_current_tournament; //index of last currently created tournament
	uint256											public	threshold = 1000000; //min amount that can be proposed as stake

	address 										public	tournamentScoresContract;
	TournamentScores								private tournamentScores;


	//constructor ###
	constructor(address _tournamentScoresContract) {
		if (_tournamentScoresContract == address(0))
			revert("no contract provided");

		tournamentScoresContract = _tournamentScoresContract;
		tournamentScores = TournamentScores(tournamentScoresContract);
	}

	//functions ###

	//create a tournament with specific staking -----------------------------------
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
		tournament.NofPlayers = _NofPlayers;
		tournament.created_at = block.timestamp;

		//create new user if not stored already
		if (_users[_user_id].user_id == 0) {
			_users[_user_id] = user({
				user_id: _user_id,
				username: _username,
				user_wallet: _user_wallet
			});
		}

		//save user id in tournament struct
		payableTournament storage tour = _tournaments[tournament_id];
		uint256 temp_idx = tour.user_ids.length;
		if (temp_idx >= tour.NofPlayers) 
			revert numberToHigh("Too many players already: ", tour.NofPlayers);
		tour.user_ids[temp_idx] = _user_id;

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
	function stake(uint256			tournament_id,
				   uint256			_user_id,
				   string	memory	_username,
				   address			_user_wallet
	) public payable {

		if (msg.value < threshold || msg.value < _tournaments[tournament_id].min_stake)
			revert insufficientAmount("insufficient funds allocated, min: ",
									 _tournaments[tournament_id].min_stake > threshold ?
										 	_tournaments[tournament_id].min_stake 
											: threshold);
		//update staked amounts
		_tournamentBalances[tournament_id][msg.sender] += msg.value;
		_tournamentTotalStake[tournament_id] += msg.value;

		//create new user if not stored already
		if (_users[_user_id].user_id == 0) {
			_users[_user_id] = user({
				user_id: _user_id,
				username: _username,
				user_wallet: _user_wallet
			});
		}

		//save new user data to tournament
		payableTournament storage tour = _tournaments[tournament_id];
		uint256 temp_idx = tour.user_ids.length;
		if (temp_idx >= tour.NofPlayers) 
			revert numberToHigh("Too many players already: ", tour.NofPlayers);
		tour.user_ids[temp_idx] = _user_id;

		emit StakeSuccess(" you have staked to tournament: ",
						  tournament_id,
						  " amount of: ",
						  msg.value);

		if (_tournamentTotalStake[tournament_id] >= tour.stake_goal)
			emit StakeGoalReached(" the tournament with id: ",
								  tournament_id,
								  " has reached the stake amount and is ready to begin, amount: ",
								  _tournamentTotalStake[tournament_id]);


	}

	//check if goal is reached --------------------------------------------------- 
	function	isGoalReached(uint256 tournament_id) public view returns(bool isReached) {

		if (_tournaments.length <= tournament_id)
			revert indexOutOfBounds("Tournament_id is to high, max id is: ", _tournaments.length -1);

		payableTournament memory tour = _tournaments[tournament_id];

		if (_tournamentTotalStake[tournament_id] >= tour.stake_goal)
			return (true);
		return (false);
	}

	//check if tournament is finished already ------------------------------------------
	function isTournamentFinished(uint256 tournament_id) public view returns(bool isFinished) {

		if (_tournaments.length <= tournament_id)
			revert indexOutOfBounds("Tournament_id is to high, max id is: ", _tournaments.length -1);

		payableTournament memory tour = _tournaments[tournament_id];

		if (tour.is_finished)
			return (true);
		return (false);
	}

	// check if we need to reimburse or continue with tournament ---------------------------
	function checkTournamentStatus(uint256 tournament_id) public returns(bool canStart) {

		if (_tournaments.length <= tournament_id)
			revert indexOutOfBounds("Tournament_id is to high, max id is: ", _tournaments.length -1);

		if (isTournamentFinished(tournament_id))
			return (false);

		payableTournament memory tour = _tournaments[tournament_id];
		mapping(address => uint256) storage balances = _tournamentBalances[tournament_id];

		//time check and reimbursement
		if (block.timestamp > tour.created_at + 10 minutes) {
			emit timeForStakePassed("time to gather funds for tournament has passed");
			for (uint64 i = 0; i < tour.NofPlayers; i++) {
				user memory curr_user = _users[tour.user_ids[i]];
				uint256 	balance = balances[curr_user.user_wallet];
				if (balance > 0) {
					payable(curr_user.user_wallet).transfer(balance);
					balances[curr_user.user_wallet] = 0;
				}
			}
			emit reimbursedStakes("the stakes have been reimbursed");
			return (false);
		}

		if (isGoalReached(tournament_id))
			return (true);

		return (false);
	}

	//check time remaining for staking (max 10min) ------------------------------
	function checkTime(uint256 tournament_id) public view returns(uint256 timeRemaining) {
		if (_tournaments.length <= tournament_id)
			revert indexOutOfBounds("Tournament_id is to high, max id is: ", _tournaments.length -1);
		uint256 elapsed_time = block.timestamp - _tournaments[tournament_id].created_at;

		return (elapsed_time < 10 minutes ?
					(10 minutes - elapsed_time) / 60
					: 58008);
	}


	//save tournament data ----------------------------------------------------
	function savetournamentResults(uint256[]	memory	user_scores,
								   uint256 				winner_id,
								   string		memory	winner_name,
								   uint256				tournament_id
	)	public {

		if (_tournaments.length <= tournament_id)
			revert indexOutOfBounds("Tournament_id is to high, max id is: ", _tournaments.length -1);
		payableTournament	memory tour = _tournaments[tournament_id];
		uint256[] 			memory	ownedTournaments = _ownersOfTournaments[msg.sender];
		bool						is_owner = false;
		for (uint256 i = 0; i < ownedTournaments.length; i++){
			if (ownedTournaments[i] == tournament_id) {
				is_owner = true;
				break;
			}
		}
		if (!is_owner)
			revert("Sender is not the owner of the tournament");
		//TODO SAVE DATA

	}


	//withdraw


}
