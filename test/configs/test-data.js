
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
        amountADesired: "4000",
        amountAMin: "3999",
        amountBDesired: "4000",
        amountBMin: "3999"
    },
    // {   
    //     tradingPair: "USDC:THETA",
    //     amountADesired: "2000",
    //     amountAMin: "1999",
    //     amountBDesired: "3000",
    //     amountBMin: "2999"
    // },
    // {   
    //     tradingPair: "THETA:BAL",
    //     amountADesired: "1000",
    //     amountAMin: "999",
    //     amountBDesired: "2000",
    //     amountBMin: "1999"
    // }
];

module.exports = { 
    tokenContracts,
    depositAmounts
}
