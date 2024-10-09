
/* ERC20 token contracts constituting router "path" */
const tokenContracts = [
    { 
        name: "USDC Stablecoin",
        symbol: "USDC"
    },
    { 
        name: "Dai Stablecoin",
        symbol: "DAI"
    },
    { 
        name: "Balancer",
        symbol: "BAL"
    }
    // { 
    //     name: "Aave",
    //     symbol: "AAVE"
    // },
    // { 
    //     name: "Shib Stablecoin",
    //     symbol: "SHIB"
    // },

];

/* Amounts to deposit into each Trading Pair's pool */
const depositAmounts = [
    {   
        tradingPair: "USDC:DAI",
        amountADesired: "2000",
        amountAMin: "1999",
        amountBDesired: "3000",
        amountBMin: "2999"
    },
    {   
        tradingPair: "DAI:BAL",
        amountADesired: "1660",
        amountAMin: "1659",
        amountBDesired: "100",
        amountBMin: "99"
    },
    // {   
    //     tradingPair: "AAVE:SHIB",
    //     amountADesired: "4000",
    //     amountAMin: "3999",
    //     amountBDesired: "4000",
    //     amountBMin: "3999"
    // },
    // {   
    //     tradingPair: "SHIB:BAL",
    //     amountADesired: "9900",
    //     amountAMin: "2899",
    //     amountBDesired: "4128",
    //     amountBMin: "3999"
    // }
];

module.exports = { 
    tokenContracts,
    depositAmounts
}
