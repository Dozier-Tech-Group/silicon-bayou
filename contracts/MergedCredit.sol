// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title Merged Credits (MC)
/// @notice Integer credit token for paying verified work. Not yield, not a stake reward.
/// @dev decimals() is 0 so 1 token = 1 MC, matching the public merged-public ledger.
///      Ownable2Step — no instant god-key handoff. Pause stops transfers/mints.
contract MergedCredit is ERC20, Ownable2Step, Pausable {
    error MergedCreditZeroAddress();
    error MergedCreditZeroAmount();

    constructor() ERC20("Merged Credits", "MC") Ownable(msg.sender) {}

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    function mint(address to, uint256 amount) external onlyOwner whenNotPaused {
        if (to == address(0)) revert MergedCreditZeroAddress();
        if (amount == 0) revert MergedCreditZeroAmount();
        _mint(to, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        super._update(from, to, value);
    }
}
