// SPDX-License-Identifier: MIT
pragma solidity=0.8.17;

interface IUniswapV2Pair {
    function mint(address to) external returns (uint liquidity);
}