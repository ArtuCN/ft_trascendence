// SPDX-License-Identifier: Ecosystem

pragma solidity 0.8.25;

import "./utils.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

	//get all the tournaments player was in //TODO
contract TournamentScores is ERC721URIStorage {

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


	//vars
	// tournament[]			public	tournament_registry;
	mapping(uint256 => tournament)	public tournament_registry;
	uint256							private _current_tournament; //when a turnament is played it will have this index	 

	mapping(uint256 => game) 		public game_registry;
	mapping(address => uint256[]) 	private _user_games;
	uint256							private _current_game;

	uint256							private	_nextTokenId;
	mapping(uint256 => address)		private	_tokenOwner;

	//constructor
	constructor()
	ERC721("Scores", "SCR")
	{}
	//functions

	// this will mint an NFT if a person has participated in a game with this id
	function mint(uint256 gameId) public payable {
		require(msg.value >= 0.000005 ether, "Not enough ETH!");
		if (gameId > _current_game)
			revert indexOutOfBounds("game id too big (doesn't exist). gameId passed: ", gameId);

		_nextTokenId++;
		uint256[] memory games = _user_games[msg.sender];
		for(uint256 i = 0; i < games.length; i++) {
			if (games[i] == gameId) {
				_safeMint(msg.sender, _nextTokenId);
				string memory uri = buildTokenURI(gameId);
				_setTokenURI(_nextTokenId, uri);
				_tokenOwner[_nextTokenId] = msg.sender;
				return ;
			}
		}
		revert indexOutOfBounds("user has not participated with his wallet in match id: ", gameId);
	}

	//creates a encoded URI from the correct game struct object
	function buildTokenURI(uint256 gameId) internal view returns (string memory) {

		game memory g = game_registry[gameId];

		// Compose metadata JSON
		string memory json = string(abi.encodePacked(
			'{"name":"Game #', Strings.toString(gameId),
			'","description":"Tournament game NFT","user_ids":"', utils.uintArrayToString(g.user_ids),
			'","user_scores":"', utils.uintArrayToString(g.user_scores),
			'","winner_ids":"', utils.uintArrayToString(g.winner_ids),
			'","game_id":"', Strings.toString(g.game_id), '"}'
		));

		// Return as data URI
		return string(abi.encodePacked("data:application/json;base64,", utils.base64Encode(bytes(json))));
	}

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

		uint256[8][8] memory placements = utils.tournamentPlacement(_user_scores, _user_ids);

		_current_game++;
		match_id = _current_game;
		game_registry[match_id] = game({
			user_ids: _user_ids,
			user_wallets: _user_wallets,
			user_scores: _user_scores,
			winner_ids: placements[0],
			game_id: match_id
		});
		for (uint256 i = 0; i < _user_wallets.length; i++) {
			address u = _user_wallets[i];
			if (u != address(0))
				_user_games[u].push(_current_game);
		}


		emit gameDataSaved("Game data saved successfully", match_id);
		return match_id;

	}

	// standalone saveTournament function - for working without the staking contract
	function standAloneSaveTournamentData(
		uint256				_NofPlayers,	
		uint256[8]	memory	_user_ids,
		uint256[8]	memory	_user_scores,
		string[8]	memory	_user_names,
		uint256				_tournament_id
	)	public {

		if (_NofPlayers > 8)
			revert numberToHigh("Too many players", _NofPlayers);

		tournament storage t = tournament_registry[_tournament_id];
		uint256[8][8] memory placements = utils.tournamentPlacement(
			_user_scores,
			_user_ids
		);
		string memory winner_names = utils.WinnerNamesToString(
			placements[0],
			_user_ids,
			_user_names
		);
		
		for (uint256 i = 0; i < _NofPlayers; i++) {
			t.user_ids[i] = _user_ids[i];
			t.user_scores[i] = _user_scores[i];
			t.winner_ids[i] = placements[0][i];
		}
		t.winner_names = winner_names;
		t.tournament_id = _tournament_id;
		_current_tournament++;
		emit tournamentDataSaved("all neccesarry data for a tournament has been saved. tournament id: ", _tournament_id);
	}
	
	//saves new entry for a completed tournament - works with staking contract
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
		if (game_id > _current_game)
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

	// get users games - ids of games user with specific address has participated
	function getUserGames(address userAddress) public view returns (uint256[] memory gameIds) {
		require(userAddress != address(0), "Not a valid Address!");
		uint256[] memory games = _user_games[userAddress];
		if (games.length == 0)
			revert indexOutOfBounds("this address has no games associated", 0);
		return games;
	}

}
