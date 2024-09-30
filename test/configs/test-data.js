
/* ERC20 token contracts constituting router "path" */
const tokenContracts = [
    { 
        name: "Aave",
        symbol: "AAVE"
    },
    { 
        name: "Dai Stablecoin",
        symbol: "DAI"
    },
    { 
        name: "USDC Stablecoin",
        symbol: "USDC"
    },
    { 
        name: "Theta",
        symbol: "THETA"
    },
    { 
        name: "Balancer",
        symbol: "BAL"
    }
];

/* Amounts to deposit into each Trading Pair's pool */
const depositAmounts = [
    {   
        tradingPair: "AAVE:DAI",
        amountADesired: "1660",
        amountAMin: "1659",
        amountBDesired: "100",
        amountBMin: "99"
    },
    {   
        tradingPair: "DAI:USDC",
        amountADesired: "1000",
        amountAMin: "999",
        amountBDesired: "200",
        amountBMin: "99"
    },
    {   
        tradingPair: "USDC:THETA",
        amountADesired: "2000",
        amountAMin: "999",
        amountBDesired: "300",
        amountBMin: "999"
    },
    {   
        tradingPair: "THETA:BAL",
        amountADesired: "4000",
        amountAMin: "999",
        amountBDesired: "500",
        amountBMin: "1999"
    }
];

module.exports = { 
    tokenContracts,
    depositAmounts
}