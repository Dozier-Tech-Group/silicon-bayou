// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title BountyBoard
/// @notice Maps a GitHub issue to a Merged Credit reward. First merged PR wins;
///         an owner/oracle calls settle(issueId, winner), then the winner withdraws.
/// @dev Payment for work. No emissions, no staking, no passive yield.
contract BountyBoard is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable credit;

    struct Bounty {
        uint256 reward;
        address winner;
        bool settled;
    }

    mapping(uint256 => Bounty) public bounties;
    mapping(address => uint256) public claimable;

    event Funded(uint256 indexed issueId, uint256 reward);
    event Settled(uint256 indexed issueId, address indexed winner, uint256 reward);
    event Withdrawn(address indexed account, uint256 amount);

    constructor(address credit_) Ownable(msg.sender) {
        require(credit_ != address(0), "BountyBoard: credit is zero");
        credit = IERC20(credit_);
    }

    function fund(uint256 issueId, uint256 reward) external onlyOwner {
        require(reward > 0, "BountyBoard: reward is zero");
        require(bounties[issueId].reward == 0, "BountyBoard: already funded");
        bounties[issueId].reward = reward;
        credit.safeTransferFrom(msg.sender, address(this), reward);
        emit Funded(issueId, reward);
    }

    function settle(uint256 issueId, address winner) external onlyOwner {
        require(winner != address(0), "BountyBoard: winner is zero");
        Bounty storage bounty = bounties[issueId];
        require(bounty.reward > 0, "BountyBoard: unfunded");
        require(!bounty.settled, "BountyBoard: already settled");
        bounty.winner = winner;
        bounty.settled = true;
        claimable[winner] += bounty.reward;
        emit Settled(issueId, winner, bounty.reward);
    }

    function withdraw() external {
        uint256 amount = claimable[msg.sender];
        require(amount > 0, "BountyBoard: nothing to withdraw");
        claimable[msg.sender] = 0;
        credit.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }
}
