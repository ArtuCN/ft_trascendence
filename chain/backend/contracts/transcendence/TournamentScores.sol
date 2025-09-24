// SPDX-License-Identifier: Ecosystem

pragma solidity 0.8.25;

	//get all the tournaments player was in //TODO
contract TournamentScores {

	//events
	event tournamentDataSaved(string msg, uint256 tournament_id);
	event gameDataSaved(string msg, uint256 match_id);

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

	struct game {
		uint256[8]	user_ids;
		address[8]	user_wallets;
		uint256[8]	user_scores;
		uint256[8]	winner_ids;
		uint256		game_id;
	}

	struct Pair {
			uint256 user_score;
			uint256	user_id;
	} // for placement ordering


	//vars
	// tournament[]			public	tournament_registry;
	mapping(uint256 => tournament) public tournament_registry;
	uint256					private _current_tournament; //when a turnament is played it will have this index	 
	mapping(uint256 => game) public game_registry;
	mapping(uint256 => uint256[]) private user_games;
	uint256					private _current_game;

	//constructor

	//functions

	// saves new entry for a match/game
	function saveGameData(
		uint256[8]	memory	_user_ids,
		address[8]	memory	_user_wallets,
		uint256[8]	memory	_user_scores
	)	public returns(uint256 match_id) {
		if (_user_ids.length > 8)
			revert numberToHigh("Too many players", _user_ids.length);
		if (_user_wallets.length != _user_ids.length ||
			_user_scores.length != _user_ids.length)
			revert indexOutOfBounds("Array length mismatch", _user_ids.length);

		uint256[8][8] memory placements = tournamentPlacement(_user_scores, _user_ids);

		match_id = _current_game;
		game_registry[match_id] = game({
			user_ids: _user_ids,
			user_wallets: _user_wallets,
			user_scores: _user_scores,
			winner_ids: placements[0],
			game_id: match_id
		});
		for (uint256 i = 0; i < _user_ids.length; i++) {
			uint256 u = _user_ids[i];
			if (u == 0)
				break ;
			user_games[u].push(_current_game);
		}
		_current_game++;


		emit gameDataSaved("Game data saved successfully", match_id);
		return match_id;

	}

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


	/// ------------ VIEW only --------------------

	// returns game data as a struct
	function getGameData(uint256 game_id) public view returns (game memory g) {
		if (game_id >= _current_game)
			revert indexOutOfBounds("index of game/match is out of bounds. Max index: ", _current_game);
		if (game_registry[game_id].game_id != 0)
			return (game_registry[game_id]);
		else
			revert indexOutOfBounds("Game data does not exist for this id", game_id);
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

	//placement in tournament (first to last) -----------------------------------
	/*
		used for distributing prizes fairly and for saving  tournament results to blockchain
		returns a 2d array of fixed size 8x8 where arr[0] is all who placed first (if same score),
		arr[1] are who placed 2nd, and so on ....
	*/
	function tournamentPlacement(uint256[8]	memory	user_scores,
								 uint256[8]	memory	user_ids
	)	internal pure returns(uint256[8][8] memory placements) {

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

}
