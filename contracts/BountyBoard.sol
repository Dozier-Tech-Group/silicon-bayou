// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title BountyBoard
/// @notice Maps a GitHub issue to a Merged Credit reward. First settle wins;
///         owner or oracle calls settle(issueId, winner), then the winner pulls.
/// @dev Payment for work. No emissions, no staking, no passive yield.
///      Intended for Robinhood Chain (chain ID 4663). Not upgradeable.
contract BountyBoard is Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable credit;
    address public oracle;

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
    event OracleUpdated(address indexed oracle);

    error BountyBoardZeroAddress();
    error BountyBoardUnauthorized();
    error BountyBoardRewardZero();
    error BountyBoardAlreadyFunded();
    error BountyBoardUnfunded();
    error BountyBoardAlreadySettled();
    error BountyBoardNothingToWithdraw();

    constructor(address credit_) Ownable(msg.sender) {
        if (credit_ == address(0)) revert BountyBoardZeroAddress();
        credit = IERC20(credit_);
    }

    modifier onlyOwnerOrOracle() {
        if (msg.sender != owner() && msg.sender != oracle) {
            revert BountyBoardUnauthorized();
        }
        _;
    }

    function setOracle(address oracle_) external onlyOwner {
        oracle = oracle_;
        emit OracleUpdated(oracle_);
    }

    function fund(uint256 issueId, uint256 reward) external onlyOwner whenNotPaused nonReentrant {
        if (reward == 0) revert BountyBoardRewardZero();
        if (bounties[issueId].reward != 0) revert BountyBoardAlreadyFunded();
        bounties[issueId].reward = reward;
        credit.safeTransferFrom(msg.sender, address(this), reward);
        emit Funded(issueId, reward);
    }

    /// @notice First settle wins. Owner or designated oracle only.
    function settle(uint256 issueId, address winner) external onlyOwnerOrOracle whenNotPaused {
        if (winner == address(0)) revert BountyBoardZeroAddress();
        Bounty storage bounty = bounties[issueId];
        if (bounty.reward == 0) revert BountyBoardUnfunded();
        if (bounty.settled) revert BountyBoardAlreadySettled();
        bounty.winner = winner;
        bounty.settled = true;
        claimable[winner] += bounty.reward;
        emit Settled(issueId, winner, bounty.reward);
    }

    /// @notice Pull-over-push: winner withdraws their own credits. CEI + nonReentrant.
    function withdraw() external whenNotPaused nonReentrant {
        uint256 amount = claimable[msg.sender];
        if (amount == 0) revert BountyBoardNothingToWithdraw();
        claimable[msg.sender] = 0;
        credit.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
