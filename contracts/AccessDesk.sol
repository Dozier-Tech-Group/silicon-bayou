// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Ownable2Step} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/// @title AccessDesk
/// @notice Commercial access payments for compiled mergedpublic.com data (census, etc.).
///         USDG in → operating cut to treasury, takeBps (20–40%) stays as a community pool.
/// @dev Not yield. The pool is not an entitlement of BAYOU holders. Owner grants are
///      discretionary. This contract must not snapshot NFTs or pay per tokenId.
///      Canonical USDG on Robinhood 4663: 0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168
contract AccessDesk is Ownable2Step, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    uint96 public constant BPS_DENOM = 10_000;
    uint96 public constant MIN_TAKE_BPS = 2_000; // 20%
    uint96 public constant MAX_TAKE_BPS = 4_000; // 40%

    IERC20 public immutable usdg;
    IERC20 public immutable credit;
    address public treasury;
    uint96 public takeBps;

    mapping(address => uint256) public paidUsdg;
    mapping(address => uint256) public paidCredit;

    event AccessPaid(
        address indexed payer,
        address indexed token,
        uint256 amount,
        uint256 community,
        uint256 operating
    );
    event CommunityGrant(address indexed to, uint256 amount);
    event TreasuryUpdated(address indexed treasury);
    event TakeBpsUpdated(uint96 takeBps);

    error AccessDeskZeroAddress();
    error AccessDeskZeroAmount();
    error AccessDeskTakeBpsOutOfRange(uint96 bps);
    error AccessDeskInsufficientPool();

    constructor(
        address usdg_,
        address credit_,
        address treasury_,
        uint96 takeBps_
    ) Ownable(msg.sender) {
        if (usdg_ == address(0) || credit_ == address(0) || treasury_ == address(0)) {
            revert AccessDeskZeroAddress();
        }
        if (takeBps_ < MIN_TAKE_BPS || takeBps_ > MAX_TAKE_BPS) {
            revert AccessDeskTakeBpsOutOfRange(takeBps_);
        }
        usdg = IERC20(usdg_);
        credit = IERC20(credit_);
        treasury = treasury_;
        takeBps = takeBps_;
        emit TreasuryUpdated(treasury_);
        emit TakeBpsUpdated(takeBps_);
    }

    /// @notice Pay canonical USDG for commercial access. `takeBps` stays in the
    ///         community pool; the rest goes to the operating treasury.
    function payUsdg(uint256 amount) external whenNotPaused nonReentrant {
        if (amount == 0) revert AccessDeskZeroAmount();
        usdg.safeTransferFrom(msg.sender, address(this), amount);
        uint256 community = (amount * uint256(takeBps)) / uint256(BPS_DENOM);
        uint256 operating = amount - community;
        if (operating > 0) {
            usdg.safeTransfer(treasury, operating);
        }
        paidUsdg[msg.sender] += amount;
        emit AccessPaid(msg.sender, address(usdg), amount, community, operating);
    }

    /// @notice Pay Merged Credits (the gator meter). Credits go to treasury in full;
    ///         they are not USD and are not pooled as cash.
    function payCredit(uint256 amount) external whenNotPaused nonReentrant {
        if (amount == 0) revert AccessDeskZeroAmount();
        credit.safeTransferFrom(msg.sender, address(this), amount);
        credit.safeTransfer(treasury, amount);
        paidCredit[msg.sender] += amount;
        emit AccessPaid(msg.sender, address(credit), amount, 0, amount);
    }

    /// @notice Discretionary USDG grant from the community pool. One recipient.
    ///         Not a holder snapshot. Not APY. Not an NFT entitlement.
    function grantFromPool(address to, uint256 amount) external onlyOwner nonReentrant {
        if (to == address(0)) revert AccessDeskZeroAddress();
        if (amount == 0) revert AccessDeskZeroAmount();
        if (usdg.balanceOf(address(this)) < amount) revert AccessDeskInsufficientPool();
        usdg.safeTransfer(to, amount);
        emit CommunityGrant(to, amount);
    }

    function communityPool() external view returns (uint256) {
        return usdg.balanceOf(address(this));
    }

    function setTreasury(address treasury_) external onlyOwner {
        if (treasury_ == address(0)) revert AccessDeskZeroAddress();
        treasury = treasury_;
        emit TreasuryUpdated(treasury_);
    }

    function setTakeBps(uint96 takeBps_) external onlyOwner {
        if (takeBps_ < MIN_TAKE_BPS || takeBps_ > MAX_TAKE_BPS) {
            revert AccessDeskTakeBpsOutOfRange(takeBps_);
        }
        takeBps = takeBps_;
        emit TakeBpsUpdated(takeBps_);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
