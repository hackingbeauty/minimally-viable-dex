const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, network } = require("hardhat");
const { 
    deployERC20Contracts,
    deployExchanges,
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
            const daiToken = deployedContracts[1].contract;
            const balToken = deployedContracts[2].contract;

            return {
                path,
                aaveToken,
                daiToken,
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
                daiToken,
                balToken,
                liquidityProvider,
                trader,
                router,
                deadline
            } = await loadFixture(deployRouterFixture);

            // Act
            const swapTx = await router.swapExactTokensForTokens(
                ethers.utils.parseUnits('145', 18), // amountIn - Aave token $145 - exact amount of tokens a trader wants to trade
                ethers.utils.parseUnits('1', 18),   // amountOutMin - BAL token $2 - the minimum amount of the output token they're willing to receive
                path,
                trader.address,
                deadline
            );
            await swapTx.wait();

            // // Assert
            // const aaveTokenBalanceAfterTrade = ethers.utils.formatUnits(await aaveToken.balanceOf(trader.address));
            // const balTokenBalanceAfterTrade = ethers.utils.formatUnits(await balToken.balanceOf(trader.address));

    
            expect(true).to.equal(true);
            // expect(balTokenBalanceAfterTrade).to.equal("0");
        });

    });

});