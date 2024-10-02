const { ethers } = require("hardhat");

async function deployERC20Contracts(tokenContracts, deployer, liquidityProvider, router) {

    const aaveToken = tokenContracts[0];
    const daiToken = tokenContracts[1];
    const usdcToken = tokenContracts[2];
    const thetaToken = tokenContracts[3];
    const balToken = tokenContracts[4];

    const baseContract = await ethers.getContractFactory("ERC20Basic");
    const deployedERC20Contracts = [];

    const aaveTokenContract = await baseContract.deploy(
        aaveToken.name,
        aaveToken.symbol,
        18,
        deployer.address
    );
    await aaveTokenContract.deployed();

    /* Mint tokens for Liquidity Provider's account */
    const aaveTokenTx1 = await aaveTokenContract.mint(
        liquidityProvider.address,
        ethers.utils.parseUnits('7000', 18)
    );
    await aaveTokenTx1.wait();
    
    /* Liquidity Provider approves Router to transfer tokens */
    const aaveTokenTx2 =  await aaveTokenContract.connect(liquidityProvider).approve(
        router.address,
        ethers.utils.parseUnits('7000', 18)
    );
    await aaveTokenTx2.wait();

    deployedERC20Contracts.push({
        "name": aaveToken.name,
        "symbol": aaveToken.symbol,
        "address": aaveTokenContract.address,
        "contract": aaveTokenContract
    });

    const daiTokenContract = await baseContract.deploy(
        daiToken.name,
        daiToken.symbol,
        18,
        deployer.address
    );
    await daiTokenContract.deployed();

    /* Mint tokens for Liquidity Provider's account */
    const daiTokenTx1 = await daiTokenContract.mint(
        liquidityProvider.address,
        ethers.utils.parseUnits('7000', 18)
    );
    await daiTokenTx1.wait();
    
    /* Liquidity Provider approves Router to transfer tokens */
    const daiTokenTx2 =  await daiTokenContract.connect(liquidityProvider).approve(
        router.address,
        ethers.utils.parseUnits('7000', 18)
    );
    await daiTokenTx2.wait();

    deployedERC20Contracts.push({
        "name": daiToken.name,
        "symbol": daiToken.symbol,
        "address": daiTokenContract.address,
        "contract": daiTokenContract
    });

    const usdcTokenContract = await baseContract.deploy(
        usdcToken.name,
        usdcToken.symbol,
        18,
        deployer.address
    );
    await usdcTokenContract.deployed();

    /* Mint tokens for Liquidity Provider's account */
    const usdcTokenTx1 = await usdcTokenContract.mint(
        liquidityProvider.address,
        ethers.utils.parseUnits('7000', 18)
    );
    await usdcTokenTx1.wait();
    
    /* Liquidity Provider approves Router to transfer tokens */
    const usdcTokenTx2 =  await usdcTokenContract.connect(liquidityProvider).approve(
        router.address,
        ethers.utils.parseUnits('7000', 18)
    );
    await usdcTokenTx2.wait();

    deployedERC20Contracts.push({
        "name": usdcToken.name,
        "symbol": usdcToken.symbol,
        "address": usdcTokenContract.address,
        "contract": usdcTokenContract
    });

    const thetaTokenContract = await baseContract.deploy(
        thetaToken.name,
        thetaToken.symbol,
        18,
        deployer.address
    );
    await thetaTokenContract.deployed();

    /* Mint tokens for Liquidity Provider's account */
    const thetaTokenTx1 = await thetaTokenContract.mint(
        liquidityProvider.address,
        ethers.utils.parseUnits('7000', 18)
    );
    await thetaTokenTx1.wait();
    
    /* Liquidity Provider approves Router to transfer tokens */
    const thetaTokenTx2 =  await thetaTokenContract.connect(liquidityProvider).approve(
        router.address,
        ethers.utils.parseUnits('7000', 18)
    );
    await thetaTokenTx2.wait();

    deployedERC20Contracts.push({
        "name": thetaToken.name,
        "symbol": thetaToken.symbol,
        "address": thetaTokenContract.address,
        "contract": thetaTokenContract
    });

    const balTokenContract = await baseContract.deploy(
        balToken.name,
        balToken.symbol,
        18,
        deployer.address
    );
    await balTokenContract.deployed();

    /* Mint tokens for Liquidity Provider's account */
    const balTokenTx1 = await balTokenContract.mint(
        liquidityProvider.address,
        ethers.utils.parseUnits('7000', 18)
    );
    await balTokenTx1.wait();
    
    /* Liquidity Provider approves Router to transfer tokens */
    const balTokenTx2 =  await balTokenContract.connect(liquidityProvider).approve(
        router.address,
        ethers.utils.parseUnits('7000', 18)
    );
    await balTokenTx2.wait();

    deployedERC20Contracts.push({
        "name": balToken.name,
        "symbol": balToken.symbol,
        "address": balTokenContract.address,
        "contract": balTokenContract
    });

    // const deployedERC20Contracts = tokenContracts.map(async (item, index) => {
    //     console.log('-------- tokenContracts[item] --------', tokenContracts[index]);
    //     const basicContract = await ethers.getContractFactory("ERC20Basic");
    //     const tokenContract = await basicContract.deploy(
    //         item.name,
    //         item.symbol,
    //         18,
    //         deployer.address
    //     );
    //     await tokenContract.deployed();

    //     console.log('-------- tokenContract.symbol --------', await tokenContract.symbol());
    //     console.log('-------- tokenContract.address --------', await tokenContract.address);

    //     /* Mint tokens for Liquidity Provider's account */
    //     const tx = await tokenContract.mint(
    //         liquidityProvider.address,
    //         ethers.utils.parseUnits('7000', 18)
    //     );
    //     await tx.wait();
        
    //     /* Liquidity Provider approves Router to transfer tokens */
    //     const tx2 =  await tokenContract.connect(liquidityProvider).approve(
    //         router.address,
    //         ethers.utils.parseUnits('7000', 18)
    //     );
    //     await tx2.wait();

    //     return Object.assign({},
    //         {
    //             "name": item.name,
    //             "symbol": item.symbol,
    //             "address": tokenContract.address,
    //             "contract": tokenContract
    //         }
    //     );
    // });

    // return await Promise.all(deployedERC20Contracts);
    return deployedERC20Contracts;

}

async function deployExchanges(factory, contracts, depositAmounts) {
    const deployedExchanges = contracts.map(async (contract, index) => {
        const tokenA = contracts[index].address;
        const tokenASymbol = contracts[index].symbol;
        let tokenB, tokenBSymbol, tradingPair;

        if(index < contracts.length-1) {
            tokenB = contracts[index+1].address;
            tokenBSymbol = contracts[index+1].symbol;
            tradingPair = `${tokenASymbol}:${tokenBSymbol}`;

            const address = await factory.callStatic.createTradingPair(tokenA, tokenB); 

            // wait for tx here?

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
                    address,
                    tradingPair,
                    tokenA,
                    tokenB,
                    amountADesired,
                    amountBDesired,
                    amountAMin,
                    amountBMin
                }
            );
        }
    });
    
    return await Promise.all(deployedExchanges);
}
async function depositLiquidityIntoExchanges(config) {
    const { 
        deployedExchanges,
        router,
        liquidityProvider,
        deadline
    } = config;


    // {   
    //     tradingPair: "AAVE:DAI",
    //     amountADesired: "1660",
    //     amountAMin: "1659",
    //     amountBDesired: "100",
    //     amountBMin: "99"
    // },
    // {   
    //     tradingPair: "DAI:USDC",
    //     amountADesired: "1000",
    //     amountAMin: "999",
    //     amountBDesired: "100",
    //     amountBMin: "99"
    // },
    // {   
    //     tradingPair: "USDC:THETA",
    //     amountADesired: "1000",
    //     amountAMin: "999",
    //     amountBDesired: "1000",
    //     amountBMin: "999"
    // },
    // {   
    //     tradingPair: "THETA:BAL",
    //     amountADesired: "1000",
    //     amountAMin: "999",
    //     amountBDesired: "2000",
    //     amountBMin: "1999"
    // }

    const aaveDaiExchange = deployedExchanges[0];
    const daiUsdcExchange = deployedExchanges[1];
    const usdcThetaExchange = deployedExchanges[2];
    const thetaBalExchange = deployedExchanges[3];

    const tx1 = await router.depositLiquidity(
        aaveDaiExchange.tokenA,
        aaveDaiExchange.tokenB,
        ethers.utils.parseUnits(`${aaveDaiExchange.amountADesired}`, 18),
        ethers.utils.parseUnits(`${aaveDaiExchange.amountBDesired}`, 18),
        ethers.utils.parseUnits(`${aaveDaiExchange.amountAMin}`, 18),
        ethers.utils.parseUnits(`${aaveDaiExchange.amountBMin}`, 18),
        liquidityProvider.address,
        deadline    
    );
    await tx1.wait();

    const tx2 = await router.depositLiquidity(
        daiUsdcExchange.tokenA,
        daiUsdcExchange.tokenB,
        ethers.utils.parseUnits(`${daiUsdcExchange.amountADesired}`, 18),
        ethers.utils.parseUnits(`${daiUsdcExchange.amountBDesired}`, 18),
        ethers.utils.parseUnits(`${daiUsdcExchange.amountAMin}`, 18),
        ethers.utils.parseUnits(`${daiUsdcExchange.amountBMin}`, 18),
        liquidityProvider.address,
        deadline    
    );
    await tx2.wait();

    const tx3 = await router.depositLiquidity(
        usdcThetaExchange.tokenA,
        usdcThetaExchange.tokenB,
        ethers.utils.parseUnits(`${usdcThetaExchange.amountADesired}`, 18),
        ethers.utils.parseUnits(`${usdcThetaExchange.amountBDesired}`, 18),
        ethers.utils.parseUnits(`${usdcThetaExchange.amountAMin}`, 18),
        ethers.utils.parseUnits(`${usdcThetaExchange.amountBMin}`, 18),
        liquidityProvider.address,
        deadline    
    );
    await tx3.wait();

    const tx4 = await router.depositLiquidity(
        thetaBalExchange.tokenA,
        thetaBalExchange.tokenB,
        ethers.utils.parseUnits(`${thetaBalExchange.amountADesired}`, 18),
        ethers.utils.parseUnits(`${thetaBalExchange.amountBDesired}`, 18),
        ethers.utils.parseUnits(`${thetaBalExchange.amountAMin}`, 18),
        ethers.utils.parseUnits(`${thetaBalExchange.amountBMin}`, 18),
        liquidityProvider.address,
        deadline    
    );
    await tx4.wait();

    // const tx5 = await router.depositLiquidity(
    //     aaveDaiExchange.tokenA,
    //     aaveDaiExchange.tokenB,
    //     ethers.utils.parseUnits(`${aaveDaiExchange.amountADesired}`, 18),
    //     ethers.utils.parseUnits(`${aaveDaiExchange.amountBDesired}`, 18),
    //     ethers.utils.parseUnits(`${aaveDaiExchange.amountAMin}`, 18),
    //     ethers.utils.parseUnits(`${aaveDaiExchange.amountBMin}`, 18),
    //     liquidityProvider.address,
    //     deadline    
    // );
    // await tx5.wait();

    // const tx6 = await router.depositLiquidity(
    //     daiUsdcExchange.tokenA,
    //     daiUsdcExchange.tokenB,
    //     ethers.utils.parseUnits(`${daiUsdcExchange.amountADesired}`, 18),
    //     ethers.utils.parseUnits(`${daiUsdcExchange.amountBDesired}`, 18),
    //     ethers.utils.parseUnits(`${daiUsdcExchange.amountAMin}`, 18),
    //     ethers.utils.parseUnits(`${daiUsdcExchange.amountBMin}`, 18),
    //     liquidityProvider.address,
    //     deadline    
    // );
    // await tx6.wait();

    // const tx7 = await router.depositLiquidity(
    //     usdcThetaExchange.tokenA,
    //     usdcThetaExchange.tokenB,
    //     ethers.utils.parseUnits(`${usdcThetaExchange.amountADesired}`, 18),
    //     ethers.utils.parseUnits(`${usdcThetaExchange.amountBDesired}`, 18),
    //     ethers.utils.parseUnits(`${usdcThetaExchange.amountAMin}`, 18),
    //     ethers.utils.parseUnits(`${usdcThetaExchange.amountBMin}`, 18),
    //     liquidityProvider.address,
    //     deadline    
    // );
    // await tx7.wait();

    // const tx8 = await router.depositLiquidity(
    //     thetaBalExchange.tokenA,
    //     thetaBalExchange.tokenB,
    //     ethers.utils.parseUnits(`${thetaBalExchange.amountADesired}`, 18),
    //     ethers.utils.parseUnits(`${thetaBalExchange.amountBDesired}`, 18),
    //     ethers.utils.parseUnits(`${thetaBalExchange.amountAMin}`, 18),
    //     ethers.utils.parseUnits(`${thetaBalExchange.amountBMin}`, 18),
    //     liquidityProvider.address,
    //     deadline    
    // );
    // await tx8.wait();

    // const {
    //     tokenA,
    //     tokenB,
    //     amountADesired,
    //     amountBDesired,
    //     amountAMin,
    //     amountBMin
    // } = deployedExchanges[0];

    // const deployedLiquidity = deployedExchanges.map(async(exchange, index) => {
    //     if(index<deployedExchanges.length-1) {
    //         console.log('---- exchange is ----', exchange);

    //         const {
    //             tokenA,
    //             tokenB,
    //             amountADesired,
    //             amountBDesired,
    //             amountAMin,
    //             amountBMin
    //         } = deployedExchanges[index];
    
    //         const tx = await router.depositLiquidity(
    //             tokenA,
    //             tokenB,
    //             ethers.utils.parseUnits(`${amountADesired}`, 18),
    //             ethers.utils.parseUnits(`${amountBDesired}`, 18),
    //             ethers.utils.parseUnits(`${amountAMin}`, 18),
    //             ethers.utils.parseUnits(`${amountBMin}`, 18),
    //             liquidityProvider.address,
    //             deadline    
    //         );
    //         await tx.wait();

    //         return Object.assign({},
    //             {
    //                 tokenA,
    //                 tokenB,
    //                 amountADesired: ethers.utils.parseUnits(`${amountADesired}`, 18),
    //                 amountBDesired: ethers.utils.parseUnits(`${amountBDesired}`, 18),
    //                 amountAMin: ethers.utils.parseUnits(`${amountAMin}`, 18),
    //                 amountBMin: ethers.utils.parseUnits(`${amountBMin}`, 18),
    //                 liquidityProvider: liquidityProvider.address,
    //                 deadline
    //             }
    //         );
    //     }
    // });

    // return await Promise.all(deployedLiquidity);
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