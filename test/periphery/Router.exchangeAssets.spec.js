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

            const WrappedETHContract = await ethers.getContractFactory("WETH");
            const weth = await WrappedETHContract.deploy(deployer.address);
            await weth.deployed();

            const RouterContract = await ethers.getContractFactory("Router");
            const deployedRouter = await RouterContract.deploy(factory.address, weth.address);
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
            const balToken = deployedContracts[0].contract;
            const aaveToken = deployedContracts[1].contract;
            const daiToken = deployedContracts[2].contract;

            return {
                path,
                balToken,
                aaveToken,
                daiToken,
                liquidityProvider,
                trader,
                router,
                deadline
            }
        }

        it.only("should swap an exact amount of input tokens in exchange for a minimum amount of output tokens", async() => {
            // Arrange
            const { 
                path,
                balToken,
                aaveToken,
                daiToken,
                trader,
                router,
                deadline
            } = await loadFixture(deployRouterFixture);


            const amountInBal = ethers.utils.parseUnits('145', 18);
            const amountOutMinDai = ethers.utils.parseUnits('1', 18);

            // Act - Trader is exchanging AAVE tokens for BAL tokens
            const swapTx = await router.swapExactTokensForTokens(
                amountInBal, // amountIn - BAL token $145 - exact amount of tokens a trader wants to trade
                amountOutMinDai,   // amountOutMin - DAO token $2 - the minimum amount of the output token they're willing to receive
                path,
                trader.address,
                deadline
            );
            await swapTx.wait();


            // Assert 
            const daiTokenBalanceAfterTrade = ethers.utils.formatUnits(await daiToken.balanceOf(trader.address));
            expect(daiTokenBalanceAfterTrade).to.equal("7000000000020.187179575038471804"); // Trader receives 1.006685768646612797 BAL tokens after exchange
        });

        it("should swap a maximum number of input tokens in exchange for an exact amount of output tokens", async() => {
            // Arrange
            const { 
                path,
                aaveToken,
                daiToken,
                balToken,
                trader,
                router,
                deadline
            } = await loadFixture(deployRouterFixture);

            const amountOut = ethers.utils.parseUnits('2', 18);
            const amountInMax = ethers.utils.parseUnits('145', 18);

            // Act
            const swapTx = await router.swapTokensForExactTokens(
                amountOut,
                amountInMax,
                path,
                trader.address,
                deadline
            );
            await swapTx.wait();

            // Assert 
            const balTokenBalanceAfterTrade = ethers.utils.formatUnits(await balToken.balanceOf(trader.address));
            expect(balTokenBalanceAfterTrade).to.equal("888888888.999999999999");
        });

        it("should swap an exact amount of ETH in exchange for a minimum amount of a non-ETH output token", async() => {
            // swapExactETHForTokens
            // Arrange
            const { 
                path,
                aaveToken,
                daiToken,
                balToken,
                trader,
                router,
                deadline
            } = await loadFixture(deployRouterFixture);

            const amountOutMin= ethers.utils.parseUnits('145', 18);

            // Act
            const swapTx = await router.swapExactETHForTokens(
                amountOutMin, 
                path,
                trader.address,
                deadline
            );
            await swapTx.wait();

            // Assert 
            const balTokenBalanceAfterTrade = ethers.utils.formatUnits(await balToken.balanceOf(trader.address));
            expect(balTokenBalanceAfterTrade).to.equal("888888888.999999999999");
        });

        it("should swap a maximum amount of some non-ETH token in exchange for an exact amount of ETH", async() => {
            // swapTokensForExactETH
            // Arrange
            const { 
                path,
                aaveToken,
                daiToken,
                balToken,
                trader,
                router,
                deadline
            } = await loadFixture(deployRouterFixture);

            const amountOfExactEth = ethers.utils.parseUnits('1', 18);
            const amountInMax= ethers.utils.parseUnits('145', 18);

            // Act
            const swapTx = await router.swapTokensForExactETH(
                amountOfExactEth, 
                amountInMax, 
                path, 
                trader.address, 
                deadline
            );
            await swapTx.wait();

            // Assert
            const ethBalanceAfterTrade = ethers.utils.formatUnits(await balToken.balanceOf(trader.address));
            expect(ethBalanceAfterTrade).to.equal("1");
        });

    });

});