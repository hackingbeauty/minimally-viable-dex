const { ethers } = require("hardhat");

async function deployERC20Contracts(tokenContracts, deployer, liquidityProvider, router) {
    const deployedERC20Contracts = Promise.all(tokenContracts.map(async (item) => {
        const basicContract = await ethers.getContractFactory("ERC20Basic");
        const tokenContract = await basicContract.deploy(
            item.name,
            item.symbol,
            18,
            deployer.address
        );
        await tokenContract.deployed();

        /* Mint tokens for Liquidity Provider's account */
        const tx = await tokenContract.mint(
            liquidityProvider.address,
            ethers.utils.parseUnits('7000', 18)
        );
        await tx.wait();
        
        /* Liquidity Provider approves Router to transfer tokens */
        const tx2 =  await tokenContract.connect(liquidityProvider).approve(
            router.address,
            ethers.utils.parseUnits('7000', 18)
        );
        await tx2.wait();

        return Object.assign({},
            {
                "name": item.name,
                "symbol": item.symbol,
                "address": tokenContract.address,
                "contract": tokenContract
            }
        );
    }));

    return deployedERC20Contracts;
}

async function deployExchanges(factory, contracts, depositAmounts) {
    const deployedExchanges = [];

    for (let i = 0; i < contracts.length-1; i++) {
        deployedExchanges.push((async() => {
            const tokenA = contracts[i].address;
            const tokenASymbol = contracts[i].symbol
            const tokenB = contracts[i+1].address;
            const tokenBSymbol = contracts[i+1].symbol;
            const tradingPair = `${tokenASymbol}:${tokenBSymbol}`;

            const tx = await factory.createTradingPair(tokenA, tokenB);  
            await tx.wait(); 
 
            const depositAmount = depositAmounts.find((pair) => {
                return pair.tradingPair === tradingPair;
            });

            const {
                amountADesired,
                amountBDesired,
                amountAMin,
                amountBMin
            } = depositAmount;

            return Object.assign({},
                {
                    tradingPair,
                    tokenA,
                    tokenB,
                    amountADesired,
                    amountBDesired,
                    amountAMin,
                    amountBMin
                }
            );
        })());
    }
    return await Promise.all(deployedExchanges);
}
async function depositLiquidityIntoExchanges(config) {
    const { 
        deployedExchanges,
        router,
        liquidityProvider,
        deadline
    } = config;

    for (let i = 0; i < deployedExchanges.length; i++) {
        const {
            tokenA,
            tokenB,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin
        } = deployedExchanges[i];

        // console.log('----- deployedExchanges[i] ------', deployedExchanges[i]);

        const tx = await router.depositLiquidity(
            tokenA,
            tokenB,
            ethers.utils.parseUnits(`${amountADesired}`, 18),
            ethers.utils.parseUnits(`${amountBDesired}`, 18),
            ethers.utils.parseUnits(`${amountAMin}`, 18),
            ethers.utils.parseUnits(`${amountBMin}`, 18),
            liquidityProvider.address,
            deadline
        );
        await tx.wait();
    }
}

function getPath(deployedContracts) {
    return deployedContracts.map((contract) => {
        return contract.address;
    });
}

module.exports = { 
    deployERC20Contracts,
    deployExchanges,
    depositLiquidityIntoExchanges,
    getPath
}