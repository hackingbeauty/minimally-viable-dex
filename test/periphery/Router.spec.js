const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");
describe("Router contract", ()=> {
    async function deployRouterFixture() {
        /* AAVE/DAI, 1 AAVE = $56 USD, 1 DAI = $1 USD */
        const amountADesired = ethers.utils.parseUnits('1', 18); //AAVE
        const amountBDesired = ethers.utils.parseUnits('56', 18); //DAI
        const amountAMin = ethers.utils.parseUnits('.99', 18); //AAVE
        const amountBMin = ethers.utils.parseUnits('55.44', 18); //DAI

        const [deployer, liquidityProvider] = await ethers.getSigners();

        const FactoryContract = await ethers.getContractFactory("Factory");
        const factory = await FactoryContract.deploy(deployer.address);
        await factory.deployed();

        const RouterContract = await ethers.getContractFactory("Router");
        const deployedRouter = await RouterContract.deploy(factory.address);
        await deployedRouter.deployed();

        /* Connect router to signer */
        const router = await deployedRouter.connect(liquidityProvider);

        const AaveTokenContract = await ethers.getContractFactory("ERC20Basic");
        const aaveToken = await AaveTokenContract.deploy(
            "Aave Stablecoin",
            "AAVE",
            18,
            deployer.address
        );
        await aaveToken.deployed();

        const DaiTokenContract = await ethers.getContractFactory("ERC20Basic");
        const daiToken = await DaiTokenContract.deploy(
            "Dai Stablecoin",
            "DAI",
            18,
            deployer.address
        );
        await daiToken.deployed();

        /* Mint tokens for Liquidity Provider's account */
        await aaveToken.mint(
            liquidityProvider.address,
            ethers.utils.parseUnits('130', 18)
        );

        await daiToken.mint(
            liquidityProvider.address,
            ethers.utils.parseUnits('130', 18)
        );

        /* Liquidity Provider approves Router to transfer tokens */
        await aaveToken.connect(liquidityProvider).approve(
            router.address,
            ethers.utils.parseUnits('130', 18)
        );

        await daiToken.connect(liquidityProvider).approve(
            router.address,
            ethers.utils.parseUnits('130', 18)
        );

        /* Transaction deadline of 20 minutes */
        const currentTime = Math.floor(Date.now() / 1000); //divide by 1000 to get seconds
        const deadline = currentTime + (20 * 60); //deadline is current time + 20 minutes

        return {
            aaveToken,
            daiToken,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            router,
            liquidityProvider,
            deadline
        }
    }
    describe("Deposit liquidity", () => {
        describe("should only allow a deposit of two ERC20 tokens of equal value", () => {
            it("should deposit amountADesired and amountBDesired for a new liquidity pool", async() => {
                const { 
                    aaveToken,
                    daiToken,
                    amountADesired,
                    amountBDesired,
                    amountAMin,
                    amountBMin,
                    router,
                    liquidityProvider,
                    deadline
                } = await loadFixture(deployRouterFixture);
    
                const { amountA, amountB } = await router.callStatic.depositLiquidity(
                    aaveToken.address,
                    daiToken.address,
                    amountADesired,
                    amountBDesired,
                    amountAMin,
                    amountBMin,
                    liquidityProvider.address,
                    deadline
                );

                const formattedAmountA = ethers.utils.formatUnits(amountA);
                const formattedAmountB = ethers.utils.formatUnits(amountB);
                const formattedAmountADesired = ethers.utils.formatUnits(amountADesired);
                const formattedAmountBDesired = ethers.utils.formatUnits(amountBDesired);
    
                expect(formattedAmountA).to.equal(formattedAmountADesired);
                expect(formattedAmountB).to.equal(formattedAmountBDesired);
            });
            it.only("should deposit the optimal ratio of tokens for an existing pool", async() => {
                const { 
                    aaveToken,
                    daiToken,
                    amountADesired,
                    amountBDesired,
                    amountAMin,
                    amountBMin,
                    router,
                    liquidityProvider,
                    deadline
                } = await loadFixture(deployRouterFixture);

                await router.depositLiquidity(
                    aaveToken.address,
                    daiToken.address,
                    amountADesired,
                    amountBDesired,
                    amountAMin,
                    amountBMin,
                    liquidityProvider.address,
                    deadline
                );

                /* Simulate error desposit here! */
                const { amountA, amountB } = await router.callStatic.depositLiquidity(
                    aaveToken.address,
                    daiToken.address,
                    ethers.utils.parseUnits('10', 18), //AAVE simulate error deposit
                    ethers.utils.parseUnits('56', 18), //DAI simulate error deposit
                    amountAMin,
                    amountBMin,
                    liquidityProvider.address,
                    deadline
                );

                const formattedAmountA = ethers.utils.formatUnits(amountA);
                const formattedAmountB = ethers.utils.formatUnits(amountB);
                const formattedAmountADesired = ethers.utils.formatUnits(amountADesired);
                const formattedAmountBDesired = ethers.utils.formatUnits(amountBDesired);

                expect(formattedAmountA).to.equal(formattedAmountADesired);
                expect(formattedAmountB).to.equal(formattedAmountBDesired);
            });

        });
        
    });

});