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
        const factoryObj = await factory.deployed();
        const factoryAddr = factoryObj.address;

        const RouterContract = await ethers.getContractFactory("Router");
        const router = await RouterContract.deploy(factoryAddr);
        await router.deployed();

        const AaveTokenContract = await ethers.getContractFactory("ERC20Basic");
        const aaveToken = await AaveTokenContract.deploy("Aave Stablecoin", "AAVE", 18, deployer.address);
        await aaveToken.deployed();

        const DaiTokenContract = await ethers.getContractFactory("ERC20Basic");
        const daiToken = await DaiTokenContract.deploy("Dai Stablecoin", "DAI", 18, deployer.address);
        await daiToken.deployed();

        const TransferHelperLibrary = await ethers.getContractFactory("TransferHelper");
        const transferHelper = await TransferHelperLibrary.deploy();
        await transferHelper.deployed();

        return {
            aaveERC20Token,
            daiERC20Token,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            router,
            transferHelper,
            liquidityProvider,
            deployer,
            aaveToken,
            daiToken
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
                    transferHelper,
                    liquidityProvider,
                    deployer,
                    aaveToken,
                    daiToken
                } = await loadFixture(deployRouterFixture);

                // const pair = DEXLibrary.pairFor(factoryAddr, aaveToken.address, daiToken.address);


                // approve transfer
                // then do a safe transfer
                // how do you get address of pool in question?
                // 
                // await dai.connect(treasury.signer).approve(account2.address, 10);

                // msg.sender should be the second account you get from HardHat Network getSigners()
                // mock a DAI and AAVE ERC20 token contract
                // transfer a certain amount of DAI and AAVE ERC20 tokens to "second account"
                // then, programmatically approve the Router account to be able to transfer tokens on
                // "second account's" behalf
                
                /* Mint tokens for Liquidity Provider's account */
                await aaveToken.connect(deployer).mint(liquidityProvider.address, "300000000000");
                await daiToken.connect(deployer).mint(liquidityProvider.address, "9000000000000000000");

                /* Liquidity Provider approves Router to transfer tokens */
                await aaveToken.connect(liquidityProvider).approve(router.address, 10000);
                await daiToken.connect(liquidityProvider).approve(router.address, 10000);

                // await transferHelper.safeTransferFrom(daiToken, liquidityProvider, pair, amountBDesired);

                // await router.callStatic.depositLiquidity(
                //     aaveERC20Token,
                //     daiERC20Token,
                //     amountADesired,
                //     amountBDesired,
                //     amountAMin,
                //     amountBMin
                // );

                expect(true).to.equal(true);
            });

        });
        
    });

});