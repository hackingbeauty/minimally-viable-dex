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
        liquidity = ITradingPair(pair).mint(to);
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
        ITradingPair(pair).transferFrom(msg.sender, pair, liquidity); // send liquidity to pair
        (uint amountASent, uint amountBSent) = ITradingPair(pair).burn(to);
        (address token0,) = DEXLibrary.sortTokens(tokenA, tokenB);
        (amountA, amountB) = tokenA == token0 ? (amountASent, amountBSent) : (amountBSent, amountASent);
        require(amountA >= amountAMin, 'DEX: INSUFFICIENT_A_AMOUNT');
        require(amountB >= amountBMin, 'DEX: INSUFFICIENT_B_AMOUNT');
    }

    // ************ EXCHANGE ************
    function _swap(uint[] memory amounts, address[] memory path, address _to) internal virtual {
        for (uint i; i < path.length - 1; i++) {
            (address input, address output) = (path[i], path[i + 1]);
            (address token0,) = DEXLibrary.sortTokens(input, output);
            uint amountOut = amounts[i + 1];
            (uint amount0Out, uint amount1Out) = input == token0 ? (uint(0), amountOut) : (amountOut, uint(0));

            address to = i < path.length - 2 ? DEXLibrary.pairFor(factoryAddr, output, path[i + 2]) : _to;
            ITradingPair(DEXLibrary.pairFor(factoryAddr, input, output)).swap(
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
        require(amounts[amounts.length - 1] >= amountOutMin, 'DEX ROUTER: INSUFFICIENT_OUTPUT_AMOUNT');
        TransferHelper.safeTransferFrom(
            path[0], msg.sender, DEXLibrary.pairFor(factoryAddr, path[0], path[1]), amounts[0]
        );
        _swap(amounts, path, to);
    }

    function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) 
        external
        payable
        ensure(deadline) 
        returns (uint[] memory amounts)
    {
        require(path[0] == WETH, 'DEX: INVALID_PATH');
        amounts = DEXLibrary.getAmountsOut(factoryAddr, msg.value, path);   
        require(amounts[amounts.length - 1] >= amountOutMin, 'DEX: INSUFFICIENT_OUTPUT_AMOUNT');
        IWETH(WETH).deposit{value: amounts[0]}();
        assert(IWETH(WETH).transfer(DEXLibrary.pairFor(factoryAddr, path[0], path[1]), amounts[0]));
        _swap(amounts, path, to);
    }

}