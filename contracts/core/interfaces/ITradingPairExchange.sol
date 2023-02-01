// SPDX-License-Identifier: MIT
pragma solidity=0.8.17;

interface ITradingPairExchange {
    function initialize(address, address) external;
    function getReserves() external view returns(uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast);
    function mint(address to) external returns (uint liquidity);
}