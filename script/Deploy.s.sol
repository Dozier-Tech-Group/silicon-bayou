// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {SiliconBayou} from "../contracts/SiliconBayou.sol";

/// @notice Deploys SiliconBayou and mints tokens 1-4 to the deployer (or MINT_TO).
contract Deploy is Script {
    function run() external {
        string memory baseURI = vm.envOr("BASE_URI", string("https://raw.githubusercontent.com/Dozier-Tech-Group/silicon-bayou/master/metadata/"));
        address recipient = vm.envOr("MINT_TO", msg.sender);

        vm.startBroadcast();
        SiliconBayou nft = new SiliconBayou(baseURI);
        nft.mintBatch(recipient, 4);
        vm.stopBroadcast();

        console.log("SiliconBayou", address(nft));
        console.log("Minted 1-4 to", recipient);
        console.log("tokenURI(1)", nft.tokenURI(1));
    }
}
