const { ethers } = require("hardhat");

async function deployERC20Contracts(config) {
    const {
        tokenContracts,
        deployer,
        liquidityProvider,
        router,
        trader
    } = config;

    const aaveToken = tokenContracts[0];
    const daiToken = tokenContracts[1];
    const usdcToken = tokenContracts[2];

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

    console.log('--------------------------------------------------------------');

    /* Mint tokens for Liquidity Provider's account */
    const aaveTokenTx3 = await aaveTokenContract.mint(
        trader.address,
        ethers.utils.parseUnits('7000', 18)
    );
    await aaveTokenTx3.wait();
    
    /* Liquidity Provider approves Router to transfer tokens */
    const aaveTokenTx4 =  await aaveTokenContract.connect(trader).approve(
        router.address,
        ethers.utils.parseUnits('7000', 18)
    );
    await aaveTokenTx4.wait();

    console.log('--------------------------------------------------------------');



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
            const depositAmount = depositAmounts.find((pair) => { return pair.tradingPair === tradingPair; });

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

    const aaveDaiExchange = deployedExchanges[0];
    const daiUsdcExchange = deployedExchanges[1];

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