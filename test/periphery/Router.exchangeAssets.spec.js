const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, network } = require("hardhat");
const { 
    deployERC20Contracts,
    deployExchanges,
    depositLiquidityIntoExchanges,
    getPath
} = require("../helpers/deployment-helpers.js");
const { tokenContracts, depositAmounts } = require("../configs/test-data.js");

describe("Router contract", ()=> {
    
    describe("Exchange assets", () => {  
        async function deployRouterFixture() {
            await network.provider.send("hardhat_reset");

            const [deployer, liquidityProvider, trader] = await ethers.getSigners();
            
            const FactoryContract = await ethers.getContractFactory("Factory");
            const factory = await FactoryContract.deploy(deployer.address);
            await factory.deployed();
    
            const RouterContract = await ethers.getContractFactory("Router");
            const deployedRouter = await RouterContract.deploy(factory.address);
            await deployedRouter.deployed();
    
            /* Connect router to signer */
            const router = await deployedRouter.connect(liquidityProvider);

            /* Step 1 - Deploy ERC20 token contracts */
            const deployedContracts = await deployERC20Contracts(
                tokenContracts,
                deployer,
                liquidityProvider,
                router
            );
            
            /* Step 2 - Deploy Trading Pair Exchanges */
            const deployedExchanges = await deployExchanges(
                factory,
                deployedContracts,
                depositAmounts
            );

            /* Step 3 - Calculate transaction deadline of 20 minutes */
            const currentTime = Math.floor(Date.now() / 1000); //divide by 1000 to get seconds
            const deadline = currentTime + (20 * 60); //deadline is current time + 20 minutes

            /* Step 4 - Deposit liquidity into Trading Pair Exchnages */
            const depositedLiquidity = await depositLiquidityIntoExchanges({
                deployedExchanges,
                router,
                deadline,
                liquidityProvider
            });

            /* Step 5 - Get array of token contracts to pass into Router */
            const path = getPath(deployedContracts); 
            const aaveToken = deployedContracts[0].contract;
            const balToken = deployedContracts[4].contract;

            return {
                path,
                aaveToken,
                balToken,
                liquidityProvider,
                trader,
                router,
                deadline
                // depositedLiquidity
            }
        }

        it.only("should swap an exact amount of AAVE tokens for a minimum amount of BAL tokens", async() => {
            // Arrange
            const { 
                path,
                aaveToken,
                balToken,
                liquidityProvider,
                trader,
                router,
                deadline,
                depositedLiquidity
            } = await loadFixture(deployRouterFixture);
       

            console.log('----- format 1660000000000000000000-----', ethers.utils.formatUnits('1660000000000000000000'));
            console.log('----- format 100000000000000000000 -----', ethers.utils.formatUnits('100000000000000000000'));
            console.log('----- format 100000000000000000000 -----', ethers.utils.formatUnits('100000000000000000000'));
            console.log('----- format 100000000000000000000 -----', ethers.utils.formatUnits('100000000000000000000'));
            console.log('----- format 1000000000000000000000 -----', ethers.utils.formatUnits('1000000000000000000000'));
            console.log('----- format 2000000000000000000000 -----', ethers.utils.formatUnits('2000000000000000000000'));
            console.log('----- format 1000000000000000000000 -----', ethers.utils.formatUnits('1000000000000000000000'));
            console.log('----- format 2000000000000000000000 -----', ethers.utils.formatUnits('2000000000000000000000'));


            console.log('--------------------------------------------------------------------------------');


            console.log('----- format 145000000000000000000 -----', ethers.utils.formatUnits('145000000000000000000'));
            console.log('----- format 8011071920379703695 -----', ethers.utils.formatUnits('8011071920379703695'));
            console.log('----- format 7396293851955551380 -----', ethers.utils.formatUnits('7396293851955551380'));
            console.log('----- format 14640251191718617288 -----', ethers.utils.formatUnits('14640251191718617288'));
            console.log('----- format 28772685254716384554 -----', ethers.utils.formatUnits('28772685254716384554'));
            console.log('----- format 145000000000000000000 -----', ethers.utils.formatUnits('145000000000000000000'));
            console.log('----- format 2000000000000000000 -----', ethers.utils.formatUnits('2000000000000000000'));


            console.log('--------------------------------------------------------------------------------');

            console.log('----- format 1805000000000000000000 -----', ethers.utils.formatUnits('1805000000000000000000'));
            console.log('----- format 1660000000000000000000 -----', ethers.utils.formatUnits('1660000000000000000000'));
            console.log('----- format 145000000000000000000 -----', ethers.utils.formatUnits('145000000000000000000'));
            console.log('----- format 91988928079620296305 -----', ethers.utils.formatUnits('91988928079620296305'));



            console.log('----- format 100000000000000000000 -----', ethers.utils.formatUnits('100000000000000000000'));
            console.log('----- format 8011071920379703695 -----', ethers.utils.formatUnits('8011071920379703695'));


            console.log('--------------------------------------------------------------------------------');

            console.log('----- format 166000000000000000001632325000000000000000000000 -----', ethers.utils.formatUnits('166000000000000000001632325000000000000000000000'));
            console.log('----- format 166000000000000000000000000000000000000000000000 -----', ethers.utils.formatUnits('166000000000000000000000000000000000000000000000'));

            console.log('--------------------------------------------------------------------------------');

            console.log('----- format 100614778068424152315 -----', ethers.utils.formatUnits('100614778068424152315'));
            console.log('----- format 100000000000000000000 -----', ethers.utils.formatUnits('100000000000000000000'));
            console.log('----- format 7396293851955551380 -----', ethers.utils.formatUnits('7396293851955551380'));
            console.log('----- format 8011071920379703695 -----', ethers.utils.formatUnits('8011071920379703695'));


            console.log('--------------------------------------------------------------------------------');

            console.log('----- format 100000000000000000000 -----', ethers.utils.formatUnits('100000000000000000000'));
            console.log('----- format 100000000000000000000 -----', ethers.utils.formatUnits('100000000000000000000'));

            console.log('--------------------------------------------------------------------------------');


            console.log('----- format 10059074485266301320391500000000000000000000000 -----', ethers.utils.formatUnits('10059074485266301320391500000000000000000000000'));
            console.log('----- format 10000000000000000000000000000000000000000000000 -----', ethers.utils.formatUnits('10000000000000000000000000000000000000000000000'));

            console.log('--------------------------------------------------------------------------------');

            console.log('----- format 1000000000000000000000 -----', ethers.utils.formatUnits('1000000000000000000000'));
            console.log('----- format 1000000000000000000000 -----', ethers.utils.formatUnits('1000000000000000000000'));


            console.log('--------------------------------------------------------------------------------');

            console.log('----- format 1985359748808281382712 -----', ethers.utils.formatUnits('1985359748808281382712'));
            console.log('----- format 2000000000000000000000 -----', ethers.utils.formatUnits('2000000000000000000000'));
            console.log('----- format 14640251191718617288 -----', ethers.utils.formatUnits('14640251191718617288'));

            console.log('--------------------------------------------------------------------------------');


            // Act
            const swapTx = await router.swapExactTokensForTokens(
                ethers.utils.parseUnits('145', 18), // amountIn - Aave token $145 - exact amount of tokens a trader wants to trade
                ethers.utils.parseUnits('2', 18),   // amountOutMin  - BAL token $2 - the minimum amount of the output token they're willing to receive
                path,
                liquidityProvider.address,
                deadline
            );
            await swapTx.wait();




            // // Assert
            // const aaveTokenBalanceAfterTrade = ethers.utils.formatUnits(await aaveToken.balanceOf(trader.address));
            // const balTokenBalanceAfterTrade = ethers.utils.formatUnits(await balToken.balanceOf(trader.address));

            // expect(aaveTokenBalanceAfterTrade).to.equal("0");
            // expect(balTokenBalanceAfterTrade).to.equal("0");
        });

    });

});

// it("should exchange tokens for exact tokens", async() => {
//     // Arrange
//     const { 
//         path,
//         liquidityProvider,
//         deadline,
//         trader
//     } = await loadFixture(deployRouterFixture);

//     const amountIn = 0;
//     const amountOutMin = 0;

//     // Act
//     const { amountA, amountB } = await router.callStatic.exchangeTokensForExactTokens(
//         amountIn,
//         amountOutMin,
//         path,
//         liquidityProvider.address,
//         deadline
//     );

//     // Format balances
//     const updatedTraderTokenABalance = await aaveToken.balanceOf(trader.address)
//     const updatedTraderTokenBBalance = await daiToken.balanceOf(trader.address)
//     const formattedUpdatedTraderTokenABalance = ethers.utils.formatUnits(updatedTraderTokenABalance);
//     const formattedUpdatedTraderTokenBBalance = ethers.utils.formatUnits(updatedTraderTokenBBalance);

//     // Assert
//     // expect(trader) to have X amount of tokenA
//     // expect(trader) to have Y amount of tokenB
//     expect(formattedUpdatedTraderTokenABalance).to.equal("0");
//     expect(formattedUpdatedTraderTokenBBalance).to.equal("0");
// });

// it("should swapExactETHForTokens", async() => {
//     // allows a trader to swap a precise amount of ETH
//     // for a minimum amount of another token in return
// });

// it("should swapTokensForExactETH", async() => {
//     // trader inputs a maximum of some other token in exchange
//     // for an exact amount of ETH that they want
// });

// it("should swapExactTokensForETH", async() => {
//     // swaps an exact number of some non-ETH token in exchange
//     // for a minimum amount of ETH the trader is willing to accept
// });

// it("should swapETHForExactTokens", async() => {
//     // swaps an amount of ETH for an EXACT
//     // amount of some non-ETH token
// }); 
