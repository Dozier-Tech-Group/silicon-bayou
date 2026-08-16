// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/// @title Silicon Bayou
/// @notice Owner-mint ERC-721 capability PFPs on Robinhood Chain (chain ID 4663).
/// @dev Immutable implementation — not upgradeable. No public sale, staking, yield, or rewards.
///      msg.sender is the only authorization surface (never tx.origin).
contract SiliconBayou is ERC721, ERC2981, Ownable2Step, Pausable, ReentrancyGuard {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 4;
    uint256 public constant MAX_BATCH = 4;
    uint96 public constant MAX_ROYALTY_BPS = 1000; // 10% of 10_000
    uint96 public constant DEFAULT_ROYALTY_BPS = 500; // 5%

    uint256 public nextTokenId = 1;
    string private _baseTokenURI;
    bool public uriFrozen;

    event Minted(address indexed to, uint256 indexed tokenId);
    event BatchMinted(address indexed to, uint256 indexed fromId, uint256 count);
    event BaseURISet(string uri);
    event URIFrozen(string uri);
    event RoyaltyUpdated(address indexed receiver, uint96 feeBps);

    error SiliconBayouZeroAddress();
    error SiliconBayouZeroCount();
    error SiliconBayouBatchTooLarge(uint256 count);
    error SiliconBayouUriFrozen();
    error SiliconBayouAlreadyFrozen();
    error SiliconBayouUriNotFrozen();
    error SiliconBayouSoldOut();
    error SiliconBayouExceedsSupply(uint256 count);
    error SiliconBayouRoyaltyTooHigh(uint96 bps);

    /// @param baseURI_ Metadata root with trailing slash. tokenURI(1) => {baseURI_}1.json
    constructor(string memory baseURI_) ERC721("Silicon Bayou", "BAYOU") Ownable(msg.sender) {
        _baseTokenURI = baseURI_;
        _setDefaultRoyalty(msg.sender, DEFAULT_ROYALTY_BPS);
        emit BaseURISet(baseURI_);
        emit RoyaltyUpdated(msg.sender, DEFAULT_ROYALTY_BPS);
    }

    function mint(address to) external onlyOwner whenNotPaused nonReentrant returns (uint256 tokenId) {
        if (to == address(0)) revert SiliconBayouZeroAddress();
        tokenId = nextTokenId;
        if (tokenId > MAX_SUPPLY) revert SiliconBayouSoldOut();
        unchecked {
            nextTokenId = tokenId + 1;
        }
        _safeMint(to, tokenId);
        emit Minted(to, tokenId);
    }

    function mintBatch(address to, uint256 count) external onlyOwner whenNotPaused nonReentrant {
        if (to == address(0)) revert SiliconBayouZeroAddress();
        if (count == 0) revert SiliconBayouZeroCount();
        if (count > MAX_BATCH) revert SiliconBayouBatchTooLarge(count);

        uint256 start = nextTokenId;
        uint256 end = start + count;
        if (end - 1 > MAX_SUPPLY) revert SiliconBayouExceedsSupply(count);
        nextTokenId = end;

        for (uint256 tokenId = start; tokenId < end; ) {
            _safeMint(to, tokenId);
            emit Minted(to, tokenId);
            unchecked {
                ++tokenId;
            }
        }
        emit BatchMinted(to, start, count);
    }

    function setBaseURI(string calldata uri) external onlyOwner {
        if (uriFrozen) revert SiliconBayouUriFrozen();
        _baseTokenURI = uri;
        emit BaseURISet(uri);
    }

    /// @notice Permanently lock metadata. Irreversible — no silent mutation after freeze.
    function freezeURI() external onlyOwner {
        if (uriFrozen) revert SiliconBayouAlreadyFrozen();
        uriFrozen = true;
        emit URIFrozen(_baseTokenURI);
    }

    function setDefaultRoyalty(address receiver, uint96 feeBps) external onlyOwner {
        if (receiver == address(0)) revert SiliconBayouZeroAddress();
        if (feeBps > MAX_ROYALTY_BPS) revert SiliconBayouRoyaltyTooHigh(feeBps);
        _setDefaultRoyalty(receiver, feeBps);
        emit RoyaltyUpdated(receiver, feeBps);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Refuse to renounce until metadata is frozen so URI cannot be bricked mid-launch.
    function renounceOwnership() public override onlyOwner {
        if (!uriFrozen) revert SiliconBayouUriNotFrozen();
        super.renounceOwnership();
    }

    function baseURI() external view returns (string memory) {
        return _baseTokenURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat(_baseURI(), tokenId.toString(), ".json");
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        whenNotPaused
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
