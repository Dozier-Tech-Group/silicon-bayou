// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Test} from "forge-std/Test.sol";
import {SiliconBayou} from "../contracts/SiliconBayou.sol";

contract SiliconBayouTest is Test {
    SiliconBayou internal nft;
    address internal owner = address(this);
    address internal stranger = address(0xB0B);

    function setUp() public {
        nft = new SiliconBayou("ipfs://CID/");
    }

    function test_mintBatch_setsOpenSeaTokenURIs() public {
        nft.mintBatch(owner, 4);
        assertEq(nft.name(), "Silicon Bayou");
        assertEq(nft.symbol(), "BAYOU");
        assertEq(nft.ownerOf(1), owner);
        assertEq(nft.ownerOf(4), owner);
        assertEq(nft.nextTokenId(), 5);
        assertEq(nft.tokenURI(1), "ipfs://CID/1.json");
        assertEq(nft.tokenURI(4), "ipfs://CID/4.json");
    }

    function test_ownerCanMintOneThroughFour() public {
        for (uint256 i = 1; i <= 4; i++) {
            uint256 tokenId = nft.mint(owner);
            assertEq(tokenId, i);
            assertEq(nft.ownerOf(i), owner);
            assertEq(nft.tokenURI(i), string.concat("ipfs://CID/", vm.toString(i), ".json"));
        }
        assertEq(nft.nextTokenId(), 5);
    }

    function test_nonOwnerCannotMint() public {
        vm.prank(stranger);
        vm.expectRevert();
        nft.mint(stranger);
    }

    function test_pauseBlocksMint() public {
        nft.pause();
        vm.expectRevert();
        nft.mint(owner);
    }

    function test_twoStepOwnership() public {
        nft.transferOwnership(stranger);
        assertEq(nft.owner(), owner);
        vm.prank(stranger);
        nft.acceptOwnership();
        assertEq(nft.owner(), stranger);
    }

    function test_freezeURIThenSetBaseURIReverts() public {
        nft.freezeURI();
        vm.expectRevert(SiliconBayou.SiliconBayouUriFrozen.selector);
        nft.setBaseURI("ipfs://MUTATE/");
    }

    function test_royaltyBpsCap() public {
        vm.expectRevert(abi.encodeWithSelector(SiliconBayou.SiliconBayouRoyaltyTooHigh.selector, uint96(1001)));
        nft.setDefaultRoyalty(owner, 1001);
        nft.setDefaultRoyalty(owner, 1000);
        (address receiver, uint256 amount) = nft.royaltyInfo(1, 10_000);
        assertEq(receiver, owner);
        assertEq(amount, 1000);
    }

    function testFuzz_royaltyAboveCapReverts(uint96 bps) public {
        bps = uint96(bound(bps, uint256(nft.MAX_ROYALTY_BPS()) + 1, type(uint96).max));
        vm.expectRevert(abi.encodeWithSelector(SiliconBayou.SiliconBayouRoyaltyTooHigh.selector, bps));
        nft.setDefaultRoyalty(owner, bps);
    }

    function testFuzz_mintBatchCap(uint256 count) public {
        count = bound(count, nft.MAX_BATCH() + 1, nft.MAX_BATCH() + 200);
        vm.expectRevert(abi.encodeWithSelector(SiliconBayou.SiliconBayouBatchTooLarge.selector, count));
        nft.mintBatch(owner, count);
    }
}
