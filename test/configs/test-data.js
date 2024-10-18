
/* ERC20 token contracts constituting router "path" */
const tokenContracts = [
    { 
        name: "Aave token",
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
        tradingPair: "BAL:AAVE",
        amountADesired: "28400",
        amountAMin: "18400",
        amountBDesired: "2000",
        amountBMin: "2000"
    },
    {   
        tradingPair: "AAVE:DAI",
        amountADesired: "20000",
        amountAMin: "20000",
        amountBDesired: "40000",
        amountBMin: "40000"
    }
];

module.exports = { 
    tokenContracts,
    depositAmounts
}
