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
            const deployedContracts = await deployERC20Contracts({
                tokenContracts,
                deployer,
                liquidityProvider,
                router,
                trader
            });

            /* Step 2 - Calculate transaction deadline of 20 minutes */
            const currentTime = Math.floor(Date.now() / 1000); //divide by 1000 to get seconds
            const deadline = currentTime + (20 * 60); //deadline is current time + 20 minutes
            
            /* Step 3 - Deploy Trading Pair Exchanges */
            await deployExchanges({
                factory,
                deployedContracts,
                depositAmounts,
                router,
                liquidityProvider,
                deadline
            });

            /* Step 3 - Get array of token contracts to pass into Router */
            const path = getPath(deployedContracts); 
            const aaveToken = deployedContracts[0].contract;
            const balToken = deployedContracts[1].contract;

            return {
                path,
                aaveToken,
                balToken,
                liquidityProvider,
                trader,
                router,
                deadline
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
                deadline
            } = await loadFixture(deployRouterFixture);
       
            // Act
            const swapTx = await router.swapExactTokensForTokens(
                ethers.utils.parseUnits('145', 18), // amountIn - Aave token $145 - exact amount of tokens a trader wants to trade
                ethers.utils.parseUnits('2', 18),   // amountOutMin - BAL token $2 - the minimum amount of the output token they're willing to receive
                path,
                liquidityProvider.address,
                deadline
            );
            await swapTx.wait();

            // Assert
            const aaveTokenBalanceAfterTrade = ethers.utils.formatUnits(await aaveToken.balanceOf(trader.address));
            const balTokenBalanceAfterTrade = ethers.utils.formatUnits(await balToken.balanceOf(trader.address));

            expect(aaveTokenBalanceAfterTrade).to.equal("0");
            expect(balTokenBalanceAfterTrade).to.equal("0");
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
