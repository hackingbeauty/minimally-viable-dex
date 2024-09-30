// SPDX-License-Identifier: MIT
pragma solidity=0.8.17;

import './interfaces/IRouter.sol';
import '../core/interfaces/IFactory.sol';
import '../core/interfaces/ITradingPairExchange.sol';
import './libraries/DEXLibrary.sol';
import './libraries/TransferHelper.sol';

contract Router is IRouter {
    address public immutable factoryAddr;

    constructor(address _factoryAddr) {
        factoryAddr = _factoryAddr;
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
        if(IFactory(factoryAddr).getTradingPair(tokenA, tokenB) == address(0)){
            IFactory(factoryAddr).createTradingPair(tokenA, tokenB);
        }
        (uint reserveA, uint reserveB) = DEXLibrary.getReserves(factoryAddr, tokenA, tokenB);

        if(reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint amountBOptimal = DEXLibrary.quote(amountADesired, reserveA, reserveB);
            if(amountBOptimal <= amountBDesired) { //tokenB is worth MORE than LP thinks, so a smaller amount is required
                require(amountBOptimal >= amountBMin, 'DEXLibrary: INSUFFICIENT_B_AMOUNT');
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else { //tokenB is worth LESS than LP thinks, so a higher amount is required
                uint amountAOptimal = DEXLibrary.quote(amountBDesired, reserveB, reserveA);
                assert(amountAOptimal <= amountADesired);
                require(amountAOptimal >= amountAMin, 'DEXLibrary: INSUFFICIENT_A_AMOUNT');
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
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
        (amountA, amountB) = _depositLiquidity(
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        );
        address pair = DEXLibrary.pairFor(factoryAddr, tokenA, tokenB);
        TransferHelper.safeTransferFrom(tokenA, msg.sender, pair, amountA);
        TransferHelper.safeTransferFrom(tokenB, msg.sender, pair, amountB);
        console.log('--------------- DEPOSIT LIQUIDITY ---------------');
        console.log('---- pair ----', pair);
        console.log('---- tokenA ----', tokenA);
        console.log('---- tokenB ----', tokenB);
        console.log('---- amountA ----', amountA);
        console.log('---- amountB ----', amountB);

        liquidity = ITradingPairExchange(pair).mint(to);

        (uint reservesA, uint reservesB,) = ITradingPairExchange(pair).getReserves();
        console.log('---- reservesA ----', reservesA);
        console.log('---- reservesB ----', reservesB);
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
        address pair = DEXLibrary.pairFor(factoryAddr, tokenA, tokenB); 
        ITradingPairExchange(pair).transferFrom(msg.sender, pair, liquidity); // send liquidity to pair
        (uint amountASent, uint amountBSent) = ITradingPairExchange(pair).burn(to);
        (address token0,) = DEXLibrary.sortTokens(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0 ? (amountASent, amountBSent) : (amountBSent, amountASent);
        require(amountA >= amountAMin, 'DEX: INSUFFICIENT_A_AMOUNT');
        require(amountB >= amountBMin, 'DEX: INSUFFICIENT_B_AMOUNT');
    }

    // ************ EXCHANGE ************
    function _swap(uint[] memory amounts, address[] memory path, address _to) internal virtual {
        console.log('----------------------- path[0] is -----------------------', path[0]);
        console.log('----------------------- path[0] is -----------------------', path[1]);
        console.log('----------------------- path[0] is -----------------------', path[2]);
        console.log('----------------------- path[0] is -----------------------', path[3]);
        console.log('----------------------- path[0] is -----------------------', path[4]);

        for (uint i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = DEXLibrary.sortTokens(input, output);
            uint amountOut = amounts[i + 1];
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));
            address to = i < path.length - 2 ? DEXLibrary.pairFor(factoryAddr, output, path[i + 2]) : _to;
            ITradingPairExchange(DEXLibrary.pairFor(factoryAddr, input, output)).swap(
                amount0Out,
                amount1Out,
                to,
                new bytes(0)
            );
        }
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
        amounts = DEXLibrary.getAmountsOut(factoryAddr, amountIn, path);  //from each exchange along the path

        console.log('----------------------------------------');
        console.log('---- amounts[0] ----', amounts[0]);
        console.log('---- amounts[1] ----', amounts[1]);
        console.log('---- amounts[2] ----', amounts[2]);
        console.log('---- amounts[3] ----', amounts[3]);
        console.log('---- amounts[4] ----', amounts[4]);
        console.log('---- amountOut ----', amountOutMin);

        require(amounts[amounts.length - 1] >= amountOutMin, 'DEX ROUTER: INSUFFICIENT_OUTPUT_AMOUNT');
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, DEXLibrary.pairFor(factoryAddr, path[0], path[1]), amounts[0]
        );
        _swap(amounts, path, to);
    }

    // Pass in maximum amount of token As a Trader is willing to pay
    // in exchange for an exact number of tokenBs (output tokens)
    function swapTokensForExactTokens(
        uint amountOut,
        uint amountInMax,
        address[] calldata path,
        address to,
        uint deadline
    ) external ensure(deadline) returns (uint[] memory amounts) {
        amounts = DEXLibrary.getAmountsIn(factoryAddr, amountOut, path);
        require(amounts[0] <= amountInMax, 'DEXLibrary: EXCESSIVE_INPUT_AMOUNT');
        TransferHelper.safeTransferFrom(
            path[0],
            msg.sender,
            DEXLibrary.pairFor(factoryAddr, path[0],
            path[1]),
            amounts[0]
        );
        _swap(amounts, path, to);
    }

}