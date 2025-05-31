// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.21;

import {LexProofProver} from "./LexProofProver.sol";

import {Proof} from "vlayer-0.1.0/Proof.sol";
import {Verifier} from "vlayer-0.1.0/Verifier.sol";
import {ERC721} from "@openzeppelin-contracts-5.0.1/token/ERC721/ERC721.sol";

contract LexProofVerifier is Verifier, ERC721 {
    address public prover;

    uint256 public currentTokenId;

    mapping(bytes32 => bool) public takenEmailHashes;
    mapping(uint256 => string) public tokenIdToMetadataUri;

    constructor(address _prover) ERC721("EmailNFT", "EML") {
        prover = _prover;
    }

    function verify(Proof calldata, bytes32 _emailHash, string memory _emailFromDomain, address _sender)
        public
        onlyVerified(prover, LexProofProver.main.selector)
    {
        require(takenEmailHashes[_emailHash] == false, "Email already verified");
        takenEmailHashes[_emailHash] = true;
        uint256 tokenId = currentTokenId + 1;
        
        tokenIdToMetadataUri[tokenId] = string.concat("https://faucet.vlayer.xyz/api/xBadgeMeta?handle=", _emailFromDomain);
        currentTokenId = tokenId;

        _safeMint(_sender, tokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return tokenIdToMetadataUri[tokenId];
    }
}
