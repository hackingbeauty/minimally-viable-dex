// SPDX-License-Identifier: MIT
pragma solidity=0.8.17;

interface IFactory {
    event TradingPairCreated(address indexed tokenA, address indexed tokenB);
    function getTradingPair(address tokenA, address tokenB) external view returns(address pair);
    function createTradingPair(address tokenA, address tokenB) external returns(address pair);
    function allTradingPairs(uint) external view returns (address pair);
}