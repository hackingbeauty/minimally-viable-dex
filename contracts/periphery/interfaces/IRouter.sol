// SPDX-License-Identifier: MIT
pragma solidity=0.8.17;

interface IRouter {
    function depositLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin
    ) external returns (uint amountA, uint amountB);
}