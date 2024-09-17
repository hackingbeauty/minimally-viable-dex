const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, network } = require("hardhat");
const { 
    deployERC20Contracts,
    deployExchanges,
    depositLiquidityIntoExchanges,
    getPath
} = require("../helpers/deployment-helpers.js");
const {
    tokenContracts,
    depositAmounts
} = require("../configs/test-data.js");

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
            await depositLiquidityIntoExchanges({
                deployedExchanges,
                router,
                deadline,
                liquidityProvider
            });

            /* Step 5 - Get array of token contracts to pass into Router */
            const path = getPath(deployedContracts);
            
            // console.log('---- path ----', path);

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
            }
        }

        it.only("should exchange exact tokens for tokens", async() => {
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

            const amountIn = ethers.utils.parseUnits('0.0000000001', 18);
            const amountOutMin = ethers.utils.parseUnits('36', 18);
            
            // Act
            await router.swapExactTokensForTokens(
                amountIn,
                amountOutMin,
                path,
                liquidityProvider.address,
                deadline
            );

            // Format balances
            const traderAaveTokenBalance = await aaveToken.balanceOf(trader.address)
            const traderBalTokenBalance = await balToken.balanceOf(trader.address)
            const formattedTraderAaveTokenBalance = ethers.utils.formatUnits(traderAaveTokenBalance);
            const formattedTraderBalTokenBalance = ethers.utils.formatUnits(traderBalTokenBalance);

            // Assert
            expect(formattedTraderAaveTokenBalance).to.equal("0");
            expect(formattedTraderBalTokenBalance).to.equal("0");
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
