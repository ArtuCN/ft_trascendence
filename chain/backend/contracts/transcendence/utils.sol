// SPDX-License-Identifier: Ecosystem

pragma solidity 0.8.25;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

library utils {

	struct Pair {
			uint256 user_score;
			uint256	user_id;
	} // for placement ordering

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

	function WinnerNamesToString(
		uint256[8] winners,
		uint256[8] user_ids,
		string[8] user_names
	) internal pure returns (string memory) {

		string memory winning_names;
		for (uint256 i = 0; winners[i] != 0; i++) {
			for (uint256 j = 0; user_ids[j] != 0; j++) {
				if (user_ids[j] == winners[i])
					winning_names = string(abi.encodePacked(winning_names, user_names[j] , ";"));
			}
		}
		return (winning_names);
	}


	// transform array into a string delimited by ,
    function uintArrayToString(uint256[8] memory arr) internal pure returns (string memory) {
        bytes memory str;
        for (uint256 i = 0; i < arr.length; i++) {
            str = abi.encodePacked(str, Strings.toString(arr[i]));
            if (i < arr.length - 1) {
                str = abi.encodePacked(str, ",");
            }
        }
        return string(str);
    }


	// simple helper for binary to string
    function base64Encode(bytes memory data) internal pure returns (string memory) {
        return Base64.encode(data);
    }
}
