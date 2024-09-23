
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
        amountADesired: "5600",
        amountAMin: "5599",
        amountBDesired: "100",
        amountBMin: "99"
    },
    {   
        tradingPair: "DAI:USDC",
        amountADesired: "100",
        amountAMin: "99",
        amountBDesired: "100",
        amountBMin: "99"
    },
    {   
        tradingPair: "USDC:THETA",
        amountADesired: "100",
        amountAMin: "99",
        amountBDesired: "900",
        amountBMin: "899"
    },
    {   
        tradingPair: "THETA:BAL",
        amountADesired: "900",
        amountAMin: "899",
        amountBDesired: "600",
        amountBMin: "599"
    }
];

module.exports = { 
    tokenContracts,
    depositAmounts
}