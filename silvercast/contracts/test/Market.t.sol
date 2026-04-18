// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {Market} from "../src/Market.sol";
import {MarketFactory} from "../src/MarketFactory.sol";
import {MockZkLTC} from "../src/MockZkLTC.sol";

contract MarketTest is Test {
    MockZkLTC internal zkLTC;
    MarketFactory internal factory;
    Market internal market;

    address internal oracle = address(0xCAFE);
    address internal alice  = address(0xA11CE);
    address internal bob    = address(0xB0B);
    address internal lp     = address(0x11CE);

    uint256 internal resolutionTime;

    function setUp() public {
        zkLTC = new MockZkLTC();
        factory = new MarketFactory(address(zkLTC));
        resolutionTime = block.timestamp + 7 days;

        address m = factory.createMarket(
            oracle,
            resolutionTime,
            "LTC closes above $120 on 2026-12-31?"
        );
        market = Market(m);

        // Fund actors
        zkLTC.mint(lp, 1_000 ether);
        zkLTC.mint(alice, 100 ether);
        zkLTC.mint(bob, 100 ether);

        // LP seeds the market
        vm.startPrank(lp);
        zkLTC.approve(address(market), type(uint256).max);
        market.addLiquidity(1_000 ether);
        vm.stopPrank();
    }

    function test_InitialPriceIsFiftyFifty() public view {
        assertEq(market.yesPrice(), 0.5e18);
        assertEq(market.yesReserve(), 1_000 ether);
        assertEq(market.noReserve(),  1_000 ether);
    }

    uint256 internal constant YES = 1;
    uint256 internal constant NO  = 0;

    function test_BuyYesMovesPriceUp() public {
        vm.startPrank(alice);
        zkLTC.approve(address(market), type(uint256).max);
        uint256 out = market.buy(YES, 100 ether, 0);
        vm.stopPrank();

        assertGt(out, 100 ether, "should receive > 1:1 due to AMM");
        assertGt(market.yesPrice(), 0.5e18, "YES should be more expensive now");
    }

    function test_BuyAndSellRoundtripLosesToFees() public {
        vm.startPrank(alice);
        zkLTC.approve(address(market), type(uint256).max);

        uint256 balBefore = zkLTC.balanceOf(alice);
        uint256 yesOut = market.buy(YES, 50 ether, 0);
        uint256 collatBack = market.sell(YES, yesOut, 0);
        uint256 balAfter = zkLTC.balanceOf(alice);

        vm.stopPrank();

        assertLt(balAfter, balBefore, "roundtrip should lose to fees");
        assertGt(collatBack, 45 ether, "fees should be ~4% roundtrip, not catastrophic");
    }

    function test_ResolveYesAndRedeem() public {
        // Alice buys YES, Bob buys NO
        vm.startPrank(alice);
        zkLTC.approve(address(market), type(uint256).max);
        uint256 aliceYes = market.buy(YES, 50 ether, 0);
        vm.stopPrank();

        vm.startPrank(bob);
        zkLTC.approve(address(market), type(uint256).max);
        market.buy(NO, 50 ether, 0);
        vm.stopPrank();

        // Fast-forward and resolve YES wins
        vm.warp(resolutionTime + 1);
        vm.prank(oracle);
        market.resolve(YES);

        // Alice redeems her YES 1:1
        uint256 aliceBalBefore = zkLTC.balanceOf(alice);
        vm.prank(alice);
        market.redeem();
        uint256 aliceBalAfter = zkLTC.balanceOf(alice);

        assertEq(aliceBalAfter - aliceBalBefore, aliceYes);

        // Bob has NO tokens that are worthless now — redeem should revert
        vm.prank(bob);
        vm.expectRevert();
        market.redeem();
    }

    function test_OnlyOracleCanResolve() public {
        vm.warp(resolutionTime + 1);
        vm.prank(alice);
        vm.expectRevert(Market.NotOracle.selector);
        market.resolve(YES);
    }

    function test_CannotResolveEarly() public {
        vm.prank(oracle);
        vm.expectRevert(Market.ResolutionTooEarly.selector);
        market.resolve(YES);
    }
}
