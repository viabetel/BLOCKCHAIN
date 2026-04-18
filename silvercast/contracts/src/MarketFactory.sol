// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Market} from "./Market.sol";

/**
 * @title MarketFactory
 * @notice Deploys and indexes binary prediction markets.
 */
contract MarketFactory {
    address public immutable collateral; // zkLTC on LitVM testnet
    address public owner;

    address[] public allMarkets;

    event MarketCreated(
        address indexed market,
        address indexed creator,
        address indexed oracle,
        uint256 resolutionTime,
        string question
    );

    error NotOwner();

    constructor(address _collateral) {
        collateral = _collateral;
        owner = msg.sender;
    }

    function createMarket(
        address oracle,
        uint256 resolutionTime,
        string calldata question
    ) external returns (address market) {
        require(resolutionTime > block.timestamp, "resolution in past");
        require(oracle != address(0), "oracle zero");

        market = address(new Market(collateral, oracle, resolutionTime, question));
        allMarkets.push(market);

        emit MarketCreated(market, msg.sender, oracle, resolutionTime, question);
    }

    function marketsLength() external view returns (uint256) {
        return allMarkets.length;
    }

    function setOwner(address newOwner) external {
        if (msg.sender != owner) revert NotOwner();
        owner = newOwner;
    }
}
