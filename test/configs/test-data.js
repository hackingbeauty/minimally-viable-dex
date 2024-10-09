
/* ERC20 token contracts constituting router "path" */
const tokenContracts = [
    { 
        name: "Aava token",
        symbol: "AAVE"
    },
    { 
        name: "Dai Stablecoin",
        symbol: "DAI"
    },
    { 
        name: "Balancer token",
        symbol: "BAL"
    }
];

/* Amounts to deposit into each Trading Pair's pool */
const depositAmounts = [
    {   
        tradingPair: "AAVE:DAI",
        amountADesired: "284",
        amountAMin: "184",
        amountBDesired: "2",
        amountBMin: "2"
    },
    {   
        tradingPair: "DAI:BAL",
        amountADesired: "2",
        amountAMin: "2",
        amountBDesired: "4",
        amountBMin: "4"
    }
];

module.exports = { 
    tokenContracts,
    depositAmounts
}
