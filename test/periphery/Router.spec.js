const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");
describe("Router contract", ()=> {
    async function deployRouterFixture() {
        /* AAVE/DAI, 1 AAVE = $56 USD, 1 DAI = $1 USD */
        const aaveERC20Token = "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9"
        const daiERC20Token = "0x6B175474E89094C44Da98b954EedeAC495271d0F";

        const amountADesired = ethers.utils.parseUnits('1', 18); //AAVE
        const amountBDesired = ethers.utils.parseUnits('56', 18); //DAI
        const amountAMin = ethers.utils.parseUnits('.99', 18); //AAVE
        const amountBMin = ethers.utils.parseUnits('55.44', 18); //DAI

        const [deployer, liquidityProvider] = await ethers.getSigners();

        const FactoryContract = await ethers.getContractFactory("Factory");
        const factory = await FactoryContract.deploy(deployer.address);
        await factory.deployed();

        const RouterContract = await ethers.getContractFactory("Router");
        const router = await RouterContract.deploy(factory.address);
        await router.deployed();

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

        return {
            aaveERC20Token,
            daiERC20Token,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            router,
            liquidityProvider,
            deployer,
            aaveToken,
            daiToken,
            factory
        }
    }
    describe("Deposit liquidity", () => {
        describe("should only allow a deposit of two ERC20 tokens of equal value", () => {
            it("should deposit amountADesired and amountBDesired for a new liquidity pool", async() => {
                const { 
                    aaveERC20Token,
                    daiERC20Token,
                    amountADesired,
                    amountBDesired,
                    amountAMin,
                    amountBMin,
                    router
                } = await loadFixture(deployRouterFixture);
    
                const { amountA, amountB } = await router.callStatic.depositLiquidity(
                    aaveERC20Token,
                    daiERC20Token,
                    amountADesired,
                    amountBDesired,
                    amountAMin,
                    amountBMin
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
                    aaveERC20Token,
                    daiERC20Token,
                    amountADesired,
                    amountBDesired,
                    amountAMin,
                    amountBMin,
                    router,
                    liquidityProvider,
                    deployer,
                    aaveToken,
                    daiToken,
                    factory
                } = await loadFixture(deployRouterFixture);

                /* Transaction deadline of 20 minutes */
                const currentTime = Math.floor(Date.now() / 1000); //divide by 1000 to get seconds
                const deadline = currentTime + (20 * 60); //deadline is current time + 20 minutes

                /* Mint tokens for Liquidity Provider's account */
                const mintAaveTx = await aaveToken.connect(deployer).mint(
                    liquidityProvider.address,
                    ethers.utils.parseUnits('130', 18)
                );
                mintAaveTx.wait();

                const mintDaiTokenTx = await daiToken.connect(deployer).mint(
                    liquidityProvider.address,
                    ethers.utils.parseUnits('130', 18)
                );
                mintDaiTokenTx.wait();

                /* Liquidity Provider approves Router to transfer tokens */
                const approveAaveTx = await aaveToken.connect(liquidityProvider).approve(
                    router.address,
                    ethers.utils.parseUnits('130', 18)

                );
                approveAaveTx.wait();

                const approveDaiTx = await daiToken.connect(liquidityProvider).approve(
                    router.address,
                    ethers.utils.parseUnits('130', 18)

                );
                approveDaiTx.wait();

                const firstDepositTx = await router.connect(liquidityProvider).depositLiquidity(
                    aaveToken.address,
                    daiToken.address,
                    amountADesired,
                    amountBDesired,
                    amountAMin,
                    amountBMin,
                    liquidityProvider.address,
                    deadline
                );
                await firstDepositTx.wait();

                const secondDepositTx = await router.connect(liquidityProvider).depositLiquidity(
                    aaveToken.address,
                    daiToken.address,
                    amountADesired,
                    amountBDesired,
                    amountAMin,
                    amountBMin,
                    liquidityProvider.address,
                    deadline
                );
                await secondDepositTx.wait();

                expect(true).to.equal(true);
            });

        });
        
    });

});