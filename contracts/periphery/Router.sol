// SPDX-License-Identifier: MIT
pragma solidity=0.8.17;

import './interfaces/IRouter.sol';
import '../core/interfaces/IFactory.sol';
import './libraries/DEXLibrary.sol';

import 'hardhat/console.sol';

contract Router is IRouter {
    address public immutable factoryAddr;

    constructor(address _factoryAddr) {
        factoryAddr = _factoryAddr;
    }

    function _depositLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin
    ) internal returns (uint amountA, uint amountB){
        if(IFactory(factoryAddr).getTradingPair(tokenA, tokenB) == address(0)){
            IFactory(factoryAddr).createTradingPair(tokenA, tokenB);
        }
        (uint reserveA, uint reserveB) = DEXLibrary.getReserves(factoryAddr, tokenA, tokenB);
        if(reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint amountBOptimal = DEXLibrary.quote(amountADesired, reserveA, reserveB);
            console.log('------- amountBOptimal is -------', amountBOptimal);
            if(amountBOptimal <= amountBDesired) {
                require(amountBOptimal >= amountBMin, 'DEXLibrary: INSUFFICIENT_B_AMOUNT');
            } else {

            }
        }
        console.log('------- reserveA is -------', reserveA);
        console.log('------- reserveB is -------', reserveB);

        console.log('------- amountA is -------', amountA);
        console.log('------- amountB is -------', amountB);

        console.log('------- amountADesired is -------', amountADesired);
        console.log('------- amountBDesired is -------', amountBDesired);

        /* 
        
        */
    }

    function depositLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin
    ) external returns(uint amountA, uint amountB){
        (amountA, amountB) = _depositLiquidity(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        );
    }
}