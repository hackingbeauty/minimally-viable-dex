// SPDX-License-Identifier: MIT
pragma solidity=0.8.17;

import './interfaces/IUniswapV2Pair.sol';
import './UniswapV2ERC20.sol';

contract UniswapV2Pair is IUniswapV2Pair, UniswapV2ERC20 {
    uint private unlocked = 1;
    
    modifier lock() {
        require(unlocked == 1, 'UniswapV2: LOCKED');
        unlocked = 0;
        _;
        unlocked = 1;
    }
    
    function mint(address to) external lock returns (uint liquidity) {
    }
}