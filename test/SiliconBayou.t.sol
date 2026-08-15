// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

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

    function test_nonOwnerCannotMint() public {
        vm.prank(stranger);
        vm.expectRevert();
        nft.mint(stranger);
    }
}
