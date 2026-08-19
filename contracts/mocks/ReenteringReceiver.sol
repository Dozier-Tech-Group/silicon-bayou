// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

interface IMintTarget {
    function mint(address to) external returns (uint256);
    function mintBatch(address to, uint256 count) external;
    function acceptOwnership() external;
}

/// @dev Test-only reentrancy attacker — NEVER DEPLOY. Test double like MockUsdg.
///      Accepts ownership of the calling 721 so the re-entrant call clears
///      onlyOwner and hits the ReentrancyGuard, then attempts to re-enter
///      mint/mintBatch from onERC721Received during _safeMint.
contract ReenteringReceiver is IERC721Receiver {
    IMintTarget public immutable target;

    /// @dev 0 = benign (accept the token), 1 = re-enter mint, 2 = re-enter mintBatch.
    uint8 public mode;

    constructor(address target_) {
        target = IMintTarget(target_);
    }

    function setMode(uint8 mode_) external {
        mode = mode_;
    }

    /// @dev Completes the 721's Ownable2Step handoff to this contract.
    function acceptTargetOwnership() external {
        target.acceptOwnership();
    }

    function attackMint() external {
        target.mint(address(this));
    }

    function attackMintBatch(uint256 count) external {
        target.mintBatch(address(this), count);
    }

    function onERC721Received(address, address, uint256, bytes calldata)
        external
        override
        returns (bytes4)
    {
        if (mode == 1) {
            target.mint(address(this));
        } else if (mode == 2) {
            target.mintBatch(address(this), 1);
        }
        return IERC721Receiver.onERC721Received.selector;
    }
}
