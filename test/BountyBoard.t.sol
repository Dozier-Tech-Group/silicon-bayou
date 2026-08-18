// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {MergedCredit} from "../contracts/MergedCredit.sol";
import {BountyBoard} from "../contracts/BountyBoard.sol";
import {SiliconBayou} from "../contracts/SiliconBayou.sol";

contract BountyBoardTest is Test {
    MergedCredit internal credit;
    SiliconBayou internal bayou;
    BountyBoard internal board;
    address internal winner = address(0xA11CE);

    function setUp() public {
        credit = new MergedCredit();
        bayou = new SiliconBayou("https://example.invalid/");
        board = new BountyBoard(address(credit), address(bayou));
        credit.mint(address(this), 1_000);
        credit.approve(address(board), type(uint256).max);
        bayou.mint(winner);
    }

    function test_settleThenWithdraw() public {
        board.fund(42, 200);
        board.settle(42, winner);

        vm.prank(winner);
        board.withdraw();

        assertEq(credit.balanceOf(winner), 200);
        assertEq(board.claimable(winner), 0);
    }

    function test_cannotSettleTwice() public {
        board.fund(7, 50);
        board.settle(7, winner);
        vm.expectRevert(BountyBoard.BountyBoardAlreadySettled.selector);
        board.settle(7, winner);
    }

    function test_withdrawTwiceReverts() public {
        board.fund(8, 10);
        board.settle(8, winner);
        vm.startPrank(winner);
        board.withdraw();
        vm.expectRevert(BountyBoard.BountyBoardNothingToWithdraw.selector);
        board.withdraw();
        vm.stopPrank();
    }

    function test_settleWithoutGatorReverts() public {
        address stranger = address(0xB0B);
        board.fund(3, 10);
        vm.expectRevert(BountyBoard.BountyBoardNeedGator.selector);
        board.settle(3, stranger);
    }

    function testFuzz_fundAndSettle(uint256 reward) public {
        reward = bound(reward, 1, 500);
        board.fund(99, reward);
        board.settle(99, winner);
        assertEq(board.claimable(winner), reward);
    }
}
