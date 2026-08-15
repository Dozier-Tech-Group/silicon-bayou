// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title Silicon Bayou
/// @notice Minimal owner-mint ERC-721 for Silicon Bayou capability PFPs on Robinhood Chain.
/// @dev MVP only. No public sale, staking, recipes, yield, or rewards.
contract SiliconBayou is ERC721, Ownable {
    using Strings for uint256;

    uint256 public nextTokenId = 1;
    string private _baseTokenURI;

    constructor(string memory baseURI_) ERC721("Silicon Bayou", "BAYOU") Ownable(msg.sender) {
        _baseTokenURI = baseURI_;
    }

    function mint(address to) external onlyOwner returns (uint256 tokenId) {
        tokenId = nextTokenId;
        unchecked {
            nextTokenId = tokenId + 1;
        }
        _safeMint(to, tokenId);
    }

    function mintBatch(address to, uint256 count) external onlyOwner {
        require(count > 0, "SiliconBayou: count is zero");
        uint256 tokenId = nextTokenId;
        for (uint256 i = 0; i < count; ) {
            _safeMint(to, tokenId);
            unchecked {
                ++tokenId;
                ++i;
            }
        }
        nextTokenId = tokenId;
    }

    function setBaseURI(string calldata uri) external onlyOwner {
        _baseTokenURI = uri;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat(_baseURI(), tokenId.toString(), ".json");
    }
}
