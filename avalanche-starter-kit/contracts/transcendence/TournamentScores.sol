// SPDX-License-Identifier: Ecosystem

pragma solidity 0.8.25;


contract TournamentScores {

	//events

	//errors
	error numberToHigh(string msg, uint256 NofPlayers);
	error indexOutOfBounds(string msg, uint256 passedIndex);

	//structs
	struct tournament {
		uint256[8]	user_ids;
		string[8]	usernames;
		address[8]	user_wallets;
		uint256[8] 	user_scores;
		uint256		winner_id;
		string		winner_name;
		uint256		match_id;
		uint256		tournament_id;
	}


	//vars
	tournament[]			public	tournament_registry;
	uint256					private _current_tournament; //when a turnament is played it will have this index	 

	//constructor

	//functions

	//saves new entry for a completed tournament
	function saveTournamentData(
		uint256				_NofPlayers,	
		uint256[8]	memory	_user_ids,
		string[8]	memory	_usernames,
		uint256[8]	memory	_user_scores,
		address[8]	memory	_user_wallets,
		uint256				_winner_id,
		string		memory	_winner_name,
		uint256				_match_id,
		uint256				_tournament_id
	)	public {

		if (_NofPlayers > 8)
			revert numberToHigh("Too many players", _NofPlayers);

		tournament_registry.push();
		tournament storage t = tournament_registry[_current_tournament];
		
		for (uint256 i = 0; i < _NofPlayers; i++) {
			t.user_ids[i] = _user_ids[i];
			t.usernames[i] = _usernames[i];
			t.user_scores[i] = _user_scores[i];
			t.user_wallets[i] = _user_wallets[i];
		}
		t.winner_id = _winner_id;
		t.winner_name = _winner_name;
		t.match_id = _match_id;
		t.tournament_id = _tournament_id;
		_current_tournament++;
	}

	//returns a tournament with specified idx as a tuple (can be parsed as JSON in frontend)
	function getTournamentData(uint256 tournamentIndex) public view returns (
		uint256[8] memory,
		string[8] memory,
		address[8] memory,
		uint256[8] memory,
		uint256,
		string memory,
		uint256,
		uint256
	) {

		if (tournamentIndex >= _current_tournament)
			revert indexOutOfBounds("index of turnament is out of bounds. Max index: ", _current_tournament);

		tournament memory t = tournament_registry[tournamentIndex];
		return (
			t.user_ids,
			t.usernames,
			t.user_wallets,
			t.user_scores,
			t.winner_id,
			t.winner_name,
			t.match_id,
			t.tournament_id
		);
	}


	//get all the tournaments player was in


}
