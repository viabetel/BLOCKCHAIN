// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {MarketFactory} from "../src/MarketFactory.sol";
import {MockZkLTC} from "../src/MockZkLTC.sol";

/**
 * @notice Deploys MarketFactory and seeds a few example markets on LiteForge.
 *
 * Local anvil:
 *   forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
 *
 * LiteForge testnet:
 *   forge script script/Deploy.s.sol --rpc-url https://liteforge.rpc.caldera.xyz/http \
 *     --broadcast --private-key $PRIVATE_KEY
 *
 * Env vars:
 *   COLLATERAL     — address of zkLTC (leave unset to deploy a MockZkLTC)
 *   ORACLE         — resolver address (defaults to deployer)
 */
contract Deploy is Script {
    function run() external {
        uint256 pk = vm.envOr("PRIVATE_KEY", uint256(0));
        if (pk == 0) {
            // Default to the first anvil key for local runs
            pk = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        }
        address deployer = vm.addr(pk);

        vm.startBroadcast(pk);

        address collateral = vm.envOr("COLLATERAL", address(0));
        if (collateral == address(0)) {
            MockZkLTC mock = new MockZkLTC();
            mock.mint(deployer, 10_000 ether);
            collateral = address(mock);
            console2.log("Deployed MockZkLTC at", collateral);
        }

        MarketFactory factory = new MarketFactory(collateral);
        console2.log("MarketFactory:", address(factory));

        address oracle = vm.envOr("ORACLE", deployer);

        address m1 = factory.createMarket(
            oracle,
            block.timestamp + 30 days,
            "Will LTC close above $120 on 2026-12-31?"
        );
        address m2 = factory.createMarket(
            oracle,
            block.timestamp + 60 days,
            "Will $LITVM TGE happen before 2026-09-01?"
        );
        address m3 = factory.createMarket(
            oracle,
            block.timestamp + 45 days,
            "Will more than 200 teams join the LitVM Builders Program?"
        );

        console2.log("Market 1:", m1);
        console2.log("Market 2:", m2);
        console2.log("Market 3:", m3);

        vm.stopBroadcast();
    }
}
