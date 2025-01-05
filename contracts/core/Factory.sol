//SPDX-License-Identifier: MIT
pragma solidity=0.8.28;

import './interfaces/IFactory.sol';
import './interfaces/ITradingPair.sol';
import './TradingPair.sol';

contract Factory is IFactory {
    address public feeTo;
    address public feeToSetter;

    mapping(address => mapping(address => address)) public getTradingPair;
    address[] public allTradingPairs;

    event PairCreated(address indexed token0, address indexed token1, address pair, uint);
    
    constructor(address _feeToSetter) {
        feeToSetter = _feeToSetter;
    }

    function createTradingPair(address tokenA, address tokenB) external returns (address pair) {
        require(tokenA != tokenB, 'FACTORY: IDENTICAL_ADDRESSES');
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(token0 != address(0), 'FACTORY: ZERO_ADDRESS');
        require(getTradingPair[token0][token1] == address(0), 'FACTORY: PAIR_EXISTS');

        bytes32 salt = keccak256(abi.encode(token0, token1));
        TradingPair tpe = new TradingPair{salt: salt}();
        pair = address(tpe);
        ITradingPair(pair).initialize(tokenA, tokenB);
        getTradingPair[tokenA][tokenB] = pair;
        getTradingPair[tokenB][tokenA] = pair;
        allTradingPairs.push(pair);
        emit PairCreated(token0, token1, pair, allTradingPairs.length);
    }

    function setFeeTo(address _feeTo) external {
        require(msg.sender == feeToSetter, 'UniswapV2: FORBIDDEN');
        feeTo = _feeTo;
    }

    function setFeeToSetter(address _feeToSetter) external {
        require(msg.sender == feeToSetter, 'UniswapV2: FORBIDDEN');
        feeToSetter = _feeToSetter;
    }
}