// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import "forge-std/Script.sol";
import {LexProofProver} from "../src/LexProofProver.sol";
import {LexProofVerifier} from "../src/LexProofVerifier.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        LexProofProver prover = new LexProofProver();
        LexProofVerifier verifier = new LexProofVerifier(address(prover));

        console2.log("LexProofProver deployed at:", address(prover));
        console2.log("LexProofVerifier deployed at:", address(verifier));

        vm.stopBroadcast();
    }
}