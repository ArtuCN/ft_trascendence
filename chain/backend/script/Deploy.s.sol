// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol"; 
import "forge-std/Test.sol";

import "../contracts/transcendence/TournamentScores.sol";
import "../contracts/transcendence/Staking.sol";

contract Deploy is Script {
    function run() public {
        // read private key from env variable PRIVATE_KEY (or set it in your shell)
        uint256 deployerKey = vm.envUint("PK");

        // start broadcasting transactions from that key
        vm.startBroadcast(deployerKey);

        // 1) deploy TournamentScores
        TournamentScores tournament = new TournamentScores();

        // 2) deploy Staking with tournament address
        Staking staking = new Staking(address(tournament));

        vm.stopBroadcast();

        // print addresses
        console.log("TournamentScores deployed at:", address(tournament));
        console.log("Staking deployed at:", address(staking));
    }
}

