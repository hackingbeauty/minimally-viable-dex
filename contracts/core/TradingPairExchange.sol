// SPDX-License-Identifier: MIT
pragma solidity=0.8.17;

import './interfaces/ITradingPairExchange.sol';
import './interfaces/IERC20.sol';
import './interfaces/IFactory.sol';
import './LiquidityTokenERC20.sol';
import './libraries/Math.sol';

import 'hardhat/console.sol';

contract TradingPairExchange is ITradingPairExchange, LiquidityTokenERC20 {
    uint public constant MINIMUM_LIQUIDITY = 10**3;

    address public factoryAddr;
    address public tokenA;
    address public tokenB;

    uint112 private reserve0;
    uint112 private reserve1;
    uint32 private blockTimestampLast;
    uint public kLast; // reserve0 * reserve1, as of immediately after the most recent liquidity event
    uint private unlocked = 1;
    
    event Mint(address indexed sender, uint amount0, uint amount1);

    modifier lock() {
        require(unlocked == 1, 'DEX: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }

    constructor() {
        factoryAddr = msg.sender;
    }
    
    function initialize(address _tokenA, address _tokenB) external {
        require(msg.sender == factoryAddr, 'DEX: FORBIDDEN');
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) {
        _reserve0 = reserve0;
        _reserve1 = reserve1;
        _blockTimestampLast = blockTimestampLast;
    }

    function _update(uint balance0, uint balance1) private {
        require(balance0 <= type(uint112).max && balance1 <= type(uint112).max, 'DEX: Overflow');
        reserve0 = uint112(balance0);
        reserve1 = uint112(balance1);
        uint32 blockTimestamp = uint32(block.timestamp % 2**32);
        blockTimestampLast = blockTimestamp;
    }

        // if fee is on, mint liquidity equivalent to 1/6th of the growth in sqrt(k)
    function _mintFee(uint112 _reserve0, uint112 _reserve1) private returns (bool feeOn) {
        address feeTo = IFactory(factoryAddr).feeTo();

        feeOn = feeTo != address(0);
        uint _kLast = kLast; // gas savings
       
        if (feeOn) {
            if (_kLast != 0) {
                uint rootK = Math.sqrt(Math.mul(_reserve0, _reserve1));
                uint rootKLast = Math.sqrt(_kLast);

                if (rootK > rootKLast) {
                    uint numerator = totalSupply * (rootK - rootKLast);
                    uint denominator = (rootK * 5) + rootKLast;
                    uint liquidity = numerator / denominator;
                    if (liquidity > 0) _mint(feeTo, liquidity);
                }
            }
        } else if (_kLast != 0) {
            kLast = 0;
        }
    }

    function mint(address to) external lock returns (uint liquidity) {
        (uint112 _reserve0, uint112 _reserve1,) = getReserves();
        uint balance0 = IERC20(tokenA).balanceOf(address(this));
        uint balance1 = IERC20(tokenB).balanceOf(address(this));

        uint amount0 = balance0 - _reserve0;
        uint amount1 = balance1 - _reserve1;
        
        bool feeOn = _mintFee(_reserve0, _reserve1);
        console.log('--- to addrress is ---', to);
        uint _totalSupply = totalSupply; // gas savings
        if (_totalSupply == 0) {
            liquidity = Math.sqrt(amount0 * amount1) - (MINIMUM_LIQUIDITY);
           _mint(address(0), MINIMUM_LIQUIDITY); // permanently lock the first MINIMUM_LIQUIDITY tokens
        } else {    
            liquidity = Math.min((amount0 * _totalSupply) / _reserve0, (amount1 * _totalSupply) / _reserve1);
        }
        require(liquidity > 0, 'DEX: INSUFFICIENT_LIQUIDITY_MINTED');

        _mint(to, liquidity);
        _update(balance0, balance1);

        if (feeOn) { 
            kLast = Math.mul(_reserve0, _reserve1);
        } // reserve0 and reserve1 are up-to-date
        emit Mint(msg.sender, amount0, amount1);
    }
}