// SPDX-License-Identifier: MIT
pragma solidity=0.8.28;

import './interfaces/IRouter.sol';
import '../core/interfaces/IFactory.sol';
import '../core/interfaces/ITradingPair.sol';
import './libraries/DEXLibrary.sol';
import './libraries/TransferHelper.sol';
import './interfaces/IWETH.sol';

contract Router is IRouter {
    address public immutable factoryAddr;
    address public immutable WETH;

    constructor(address _factoryAddr, address _WETH) {
        factoryAddr = _factoryAddr;
        WETH = _WETH;
    }

    receive() external payable {
        assert(msg.sender == WETH); // only accept ETH via fallback from the WETH contract
    }

    modifier ensure(uint deadline) {
        require(deadline >= block.timestamp, 'DEX: EXPIRED');
        _;
    }

    function _depositLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin
    ) internal returns (uint amountA, uint amountB){
        // Add resusable code for determining optimal liquidity deposit amounts here...
    }

    function depositLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external ensure(deadline) returns(uint amountA, uint amountB, uint liquidity){
        // Add code for depositing liquidity here..
    }

    function withdrawLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external ensure(deadline) returns (uint amountA, uint amountB) {
        // Add code for withdrawing liquidity here..
    }

    // ************ EXCHANGE ************
    function _swap(uint[] memory amounts, address[] memory path, address _to) internal virtual {
        // Add code for Routing here...
    }

    // Allows a trader to specify the exact amount of token "As" a trader is willing to input,
    // and the minimum amount of token "Bs" a trader is willing to receive in return.
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external ensure(deadline) returns (uint[] memory amounts) {         //the various amounts that will be swapped out        
        // Add code for <enter> here...
    }

    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) 
        external
        payable
        ensure(deadline) 
        returns (uint[] memory amounts)
    {
        // Add code for <enter> here...
    }

}