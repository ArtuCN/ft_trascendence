// SPDX-License-Identifier: Ecosystem

pragma solidity 0.8.25;

	//get all the tournaments player was in //TODO
contract TournamentScores {

	//events
	event tournamentDataSaved(string msg, uint256 tournament_id);

	//errors
	error numberToHigh(string msg, uint256 NofPlayers);
	error indexOutOfBounds(string msg, uint256 passedIndex);

	//structs
	struct tournament {
		uint256[8]	user_ids;
		address[8]	user_wallets;
		uint256[8] 	user_scores;
		uint256[8]	winner_ids;
		string		winner_names;
		uint256		tournament_id;
	}


	//vars
	// tournament[]			public	tournament_registry;
	mapping(uint256 => tournament) public tournament_registry;
	uint256					private _current_tournament; //when a turnament is played it will have this index	 

	//constructor

	//functions

	//saves new entry for a completed tournament
	function saveTournamentData(
		uint256				_NofPlayers,	
		uint256[8]	memory	_user_ids,
		uint256[8]	memory	_user_scores,
		uint256[8]	memory	_winner_ids,
		string		memory	_winner_names,
		uint256				_tournament_id
	)	public {

		if (_NofPlayers > 8)
			revert numberToHigh("Too many players", _NofPlayers);

		tournament storage t = tournament_registry[_tournament_id];
		
		for (uint256 i = 0; i < _NofPlayers; i++) {
			t.user_ids[i] = _user_ids[i];
			t.user_scores[i] = _user_scores[i];
		}
		t.winner_ids = _winner_ids;
		t.winner_names = _winner_names;
		t.tournament_id = _tournament_id;
		_current_tournament++;
		emit tournamentDataSaved("all neccesarry data for a tournament has been saved. tournament id: ", _tournament_id);
	}

	//returns a tournament with specified idx as a tuple (can be parsed as JSON in frontend)
	function getTournamentData(uint256 tournamentIndex) public view returns (
		uint256[8] memory,
		uint256[8] memory,
		uint256[8] memory,
		string memory,
		uint256
	) {

		if (tournamentIndex >= _current_tournament)
			revert indexOutOfBounds("index of turnament is out of bounds. Max index: ", _current_tournament);

		tournament memory t = tournament_registry[tournamentIndex];
		return (
			t.user_ids,
			t.user_scores,
			t.winner_ids,
			t.winner_names,
			t.tournament_id
		);
	}

	//get all the tournaments player was in //TODO


}
