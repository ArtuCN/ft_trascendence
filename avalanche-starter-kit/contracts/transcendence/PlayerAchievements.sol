// SPDX-License-Identifier: Ecosystem

pragma solidity 0.8.25;


contract PlayerAchievements {

	//events

	//errors

	//structs
	struct score {
		address winner;
		address looser;
		string	winner_name;
		string	looser_name;
	}


	//vars
	mapping(uint256 => address) private _scores; 

	//constructor

	//functions



}
