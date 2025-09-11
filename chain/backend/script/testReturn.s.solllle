// script/CallTestReturn.s.sol
pragma solidity 0.8.25;

import "forge-std/Script.sol";

interface IYourContract {
    function testReturn() external view returns (uint256, string memory, address);
	function hasAllPlayers(uint256 tour_id) external view returns(bool);
}

error indexOutOfBounds(string msg, uint256 passedIndex);

contract CallTestReturn is Script {
    function run() external {
        address contractAddress = vm.envAddress("CONTRACT_ADDRESS");
        IYourContract stakingContract = IYourContract(contractAddress);
        
        // Call testReturn first
        (uint256 currTour, string memory message, address ownerAddr) = stakingContract.testReturn();
        console.log("Current Tournament:", currTour);
        console.log("message: ", message);
        console.log("Owner Address:", ownerAddr);
        
        // Try to call hasAllPlayers with error handling
        try stakingContract.hasAllPlayers(1) returns (bool hasAll) {
            console.log("has all players: ", hasAll);
        } catch Error(string memory reason) {
            // This catches revert reasons like "require" statements
            console.log("Error:", reason);
        } catch (bytes memory lowLevelData) {
            // Check if it's our custom error
            if (lowLevelData.length >= 4) {
                bytes4 errorSelector = bytes4(lowLevelData);
                
                // Compare with the selector of our custom error
                if (errorSelector == indexOutOfBounds.selector) {
                    // Use abi.decode with the entire data - it will skip the selector
                    (, string memory errorMsg, uint256 passedIndex) = abi.decode(
                        lowLevelData,
                        (bytes4, string, uint256)
                    );
                    
                    console.log("Custom Error: indexOutOfBounds");
                    console.log("Message:", errorMsg);
                    console.log("Passed Index:", passedIndex);
                } else {
                    console.log("Unknown error selector:", vm.toString(errorSelector));
                    console.logBytes(lowLevelData);
                }
            } else {
                console.log("Unknown error with data:");
                console.logBytes(lowLevelData);
            }
        }
    }
}
