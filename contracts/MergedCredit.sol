// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title Merged Credits (MC)
/// @notice Integer credit token for paying verified work. Not yield, not a stake reward.
/// @dev decimals() is 0 so 1 token = 1 MC, matching the public merged-public ledger.
contract MergedCredit is ERC20, Ownable {
    constructor() ERC20("Merged Credits", "MC") Ownable(msg.sender) {}

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
