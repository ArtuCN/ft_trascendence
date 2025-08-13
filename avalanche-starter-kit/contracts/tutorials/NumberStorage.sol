// SPDX-License-Identifier: Ecosystem
pragma solidity 0.8.25;

contract NumberStorage {

	uint256 private _num;

	function setNum(uint256 num) public {
		_num = num;
	}

	function getNum() public view returns(uint256) {
		return _num;
	}

}
