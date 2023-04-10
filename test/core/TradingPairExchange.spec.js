const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers, network } = require("hardhat");
describe("TradingPairExchange contract", ()=> {
    async function deployExchangeFixture() {
        await network.provider.send("hardhat_reset");

        /* AAVE/DAI, 1 AAVE = $56 USD, 1 DAI = $1 USD */
        const amountADesired = ethers.utils.parseUnits('1', 18); //AAVE
        const amountBDesired = ethers.utils.parseUnits('56', 18); //DAI
        const amountAMin = ethers.utils.parseUnits('.99', 18); //AAVE
        const amountBMin = ethers.utils.parseUnits('55.44', 18); //DAI

        const [deployer, liquidityProvider, dexDeveloperAccount] = await ethers.getSigners();

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
            deployer.address,
            ethers.utils.parseUnits('130', 18)
        );

        await daiToken.connect(liquidityProvider).approve(
            deployer.address,
            ethers.utils.parseUnits('130', 18)
        );

        const FactoryContract = await ethers.getContractFactory("Factory");
        const factory = await FactoryContract.deploy(deployer.address);
        await factory.deployed();

        const tradingPairExchangeContract = await factory.createTradingPair(
            aaveToken.address,
            daiToken.address
        );    
        const receipt = await tradingPairExchangeContract.wait();
        const tradingPairExchangeAddr = receipt.events[0].args[2];

        const tradingPairExchange = await ethers.getContractAt(
            "TradingPairExchange",
            tradingPairExchangeAddr,
            deployer
        );

        return {
            aaveToken,
            daiToken,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            tradingPairExchange,
            liquidityProvider,
            factory,
            dexDeveloperAccount,
            deployer
        }
    }

    describe("Minting Liquidity Tokens", () => {
        it("should remit payment of the protocol fee to the exchange developer account", async() => {
            const { 
                aaveToken,
                daiToken,
                amountADesired,
                amountBDesired,
                tradingPairExchange,
                liquidityProvider,
                factory,
                dexDeveloperAccount
            } = await loadFixture(deployExchangeFixture);

            /* Set Protocol Fee recipient to DEX Developer account */
            await factory.setFeeTo(dexDeveloperAccount.address);

            /* Transfer tokens from Liquidity Provider account to AAVE/DAI pool */
            await aaveToken.transferFrom(
                liquidityProvider.address,
                tradingPairExchange.address,
                amountADesired
            );
            await daiToken.transferFrom(
                liquidityProvider.address,
                tradingPairExchange.address,
                amountBDesired
            );

            /* Mint Liquidity Tokens for the Liquidity Provider */
            await tradingPairExchange.mint(liquidityProvider.address);

            /* Transfer tokens from Liquidity Provider account to AAVE/DAI pool */
            await aaveToken.transferFrom(
                liquidityProvider.address,
                tradingPairExchange.address,
                ethers.utils.parseUnits('.25', 18)
            );
            await daiToken.transferFrom(
                liquidityProvider.address,
                tradingPairExchange.address,
                ethers.utils.parseUnits('14', 18)
            );

            /* Mint Liquidity Tokens for the Liquidity Provider */
            await tradingPairExchange.mint(liquidityProvider.address);

            /* Transfer tokens from Liquidity Provider account to AAVE/DAI pool */
            await aaveToken.transferFrom(
                liquidityProvider.address,
                tradingPairExchange.address,
                ethers.utils.parseUnits('.25', 18)
            );
            await daiToken.transferFrom(
                liquidityProvider.address,
                tradingPairExchange.address,
                ethers.utils.parseUnits('14', 18)
            );

            /* Mint Liquidity Tokens for the Liquidity Provider */
            await tradingPairExchange.mint(liquidityProvider.address);

            const dexDeveloperAccountBalance = await tradingPairExchange.balanceOf(dexDeveloperAccount.address);
            const formattedDexDeveloperAccountBalance = ethers.utils.formatUnits(dexDeveloperAccountBalance);
            expect(formattedDexDeveloperAccountBalance).to.equal("0.322556671273615636");
        });
        
        it("should update a Liquidity Provider's account after a deposit into a new pool", async() => {
            const { 
                aaveToken,
                daiToken,
                amountADesired,
                amountBDesired,
                tradingPairExchange,
                liquidityProvider
            } = await loadFixture(deployExchangeFixture);

            /* Transfer tokens from Liquidity Provider account to AAVE/DAI pool */
            await aaveToken.transferFrom(
                liquidityProvider.address,
                tradingPairExchange.address,
                amountADesired
            );
            await daiToken.transferFrom(
                liquidityProvider.address,
                tradingPairExchange.address,
                amountBDesired
            );

            /* Mint Liquidity Tokens for the Liquidity Provider */
            await tradingPairExchange.mint(liquidityProvider.address);

            const liquidityProviderAccountBalance = await tradingPairExchange.balanceOf(liquidityProvider.address);
            const formattedLiquidityProviderAccountBalance = ethers.utils.formatUnits(liquidityProviderAccountBalance);
            expect(formattedLiquidityProviderAccountBalance).to.equal("7.483314773547881771");
        });

        it("should update a Liquidity Provider's account after a deposit into an existing pool", async() => {
            const { 
                aaveToken,
                daiToken,
                amountADesired,
                amountBDesired,
                tradingPairExchange,
                liquidityProvider
            } = await loadFixture(deployExchangeFixture);

            /* Transfer tokens from Liquidity Provider account to AAVE/DAI pool */
            await aaveToken.transferFrom(
                liquidityProvider.address,
                tradingPairExchange.address,
                amountADesired
            );
            await daiToken.transferFrom(
                liquidityProvider.address,
                tradingPairExchange.address,
                amountBDesired
            );

            /* Mint Liquidity Tokens for the Liquidity Provider */
            await tradingPairExchange.mint(liquidityProvider.address);

            /* Transfer tokens from Liquidity Provider account to AAVE/DAI pool */
            await aaveToken.transferFrom(
                liquidityProvider.address,
                tradingPairExchange.address,
                ethers.utils.parseUnits('.25', 18)
            );
            await daiToken.transferFrom(
                liquidityProvider.address,
                tradingPairExchange.address,
                ethers.utils.parseUnits('14', 18)
            );

            /* Mint Liquidity Tokens for the Liquidity Provider */
            await tradingPairExchange.mint(liquidityProvider.address);

            const liquidityProviderAccountBalance = await tradingPairExchange.balanceOf(liquidityProvider.address);
            const formattedLiquidityProviderAccountBalance = ethers.utils.formatUnits(liquidityProviderAccountBalance);
            expect(formattedLiquidityProviderAccountBalance).to.equal("9.354143466934852463");
        });
    
    });

    describe("Burning Liquidity Tokens", () => {
        async function deploySecondaryExchangeFixture() {
            await network.provider.send("hardhat_reset");

            /* AAVE/DAI, 1 AAVE = $56 USD, 1 DAI = $1 USD */
            const amountADesired = ethers.utils.parseUnits('1', 18); //AAVE
            const amountBDesired = ethers.utils.parseUnits('56', 18); //DAI
            const amountAMin = ethers.utils.parseUnits('.99', 18); //AAVE
            const amountBMin = ethers.utils.parseUnits('55.44', 18); //DAI
    
            const [deployer, liquidityProvider, dexDeveloperAccount] = await ethers.getSigners();
    
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
                deployer.address,
                ethers.utils.parseUnits('130', 18)
            );
    
            await daiToken.connect(liquidityProvider).approve(
                deployer.address,
                ethers.utils.parseUnits('130', 18)
            );
    
            const FactoryContract = await ethers.getContractFactory("Factory");
            const factory = await FactoryContract.deploy(deployer.address);
            await factory.deployed();
    
            const tradingPairExchangeContract = await factory.createTradingPair(
                aaveToken.address,
                daiToken.address
            );    
            const receipt = await tradingPairExchangeContract.wait();
            const tradingPairExchangeAddr = receipt.events[0].args[2];
    
            const tradingPairExchange = await ethers.getContractAt(
                "TradingPairExchange",
                tradingPairExchangeAddr,
                deployer
            );

            /* First depositing of liquidity */
            await aaveToken.transferFrom(
                liquidityProvider.address,
                tradingPairExchange.address,
                amountADesired
            );
            
            await daiToken.transferFrom(
                liquidityProvider.address,
                tradingPairExchange.address,
                amountBDesired
            );

            await tradingPairExchange.mint(liquidityProvider.address);
 
            return {
                aaveToken,
                daiToken,
                amountADesired,
                amountBDesired,
                amountAMin,
                amountBMin,
                tradingPairExchange,
                liquidityProvider,
                factory,
                dexDeveloperAccount,
                deployer
            }
        }
        it("should debit a Liquidity Provider's account after burning Liquidity Tokens", async() => {
            const { 
                deployer,
                tradingPairExchange,
                liquidityProvider
            } = await loadFixture(deploySecondaryExchangeFixture);

            /* Liquidity Provider approve Deployer to transfer Liquidity Tokens */
            await tradingPairExchange.connect(liquidityProvider).approve(
                deployer.address,
                ethers.utils.parseUnits('5', 18)
            );

            /* Transfer Liquidity Tokens to TradingPairExchange */
            await tradingPairExchange.transferFrom(
                liquidityProvider.address,
                tradingPairExchange.address,
                ethers.utils.parseUnits('4', 18)
            );

            /* Burn Liquidity Tokens */
            await tradingPairExchange.burn(liquidityProvider.address);            

            /* Formatted Liquidity Token balance */
            const liquidityProviderBalance = await tradingPairExchange.balanceOf(liquidityProvider.address);
            const formattedLiquidityProviderBalance = ethers.utils.formatUnits(liquidityProviderBalance);

            /* expect Liquidity Provider to have a debitted amount of Liquidity Tokens */
            expect(formattedLiquidityProviderBalance).to.equal("3.483314773547881771");
        });

        it("should send Liquidity Provider ERC20 tokens proportional to amount of Liquidity Tokens burned", async() => {
            const { 
                aaveToken,
                daiToken,
                deployer,
                tradingPairExchange,
                liquidityProvider
            } = await loadFixture(deploySecondaryExchangeFixture);

            /* Liquidity Provider approve Deployer to transfer Liquidity Tokens */
            await tradingPairExchange.connect(liquidityProvider).approve(
                deployer.address,
                ethers.utils.parseUnits('5', 18)
            );

            /* Transfer Liquidity Tokens to TradingPairExchange */
            await tradingPairExchange.transferFrom(
                liquidityProvider.address,
                tradingPairExchange.address,
                ethers.utils.parseUnits('4', 18)
            );

            /* Burn Liquidity Tokens */
            await tradingPairExchange.burn(liquidityProvider.address);  

            /* Formatted ERC20 Token balance */
            const amountAReturned = await aaveToken.balanceOf(liquidityProvider.address);
            const amountBReturned = await daiToken.balanceOf(liquidityProvider.address);
            const formattedAaveTokensCredited = ethers.utils.formatUnits(amountAReturned);
            const formattedDaiTokensCredited = ethers.utils.formatUnits(amountBReturned);

            /* Expect Liquidity Provider to now have additional AAVE and DAI tokens in their accounts */
            expect(formattedAaveTokensCredited).to.equal("129.534522483824848769");
            expect(formattedDaiTokensCredited).to.equal("103.933259094191531085");
        });

        it("should remit payment of the protocol fee to the exchange developer account", async() => {
            const {
                aaveToken,
                daiToken,
                deployer,
                dexDeveloperAccount,
                factory,
                tradingPairExchange,
                liquidityProvider
            } = await loadFixture(deploySecondaryExchangeFixture);

            /* Set Protocol Fee recipient to DEX Developer account */
            await factory.setFeeTo(dexDeveloperAccount.address);

            /* Third deposit of liquidity into AAVE/DAI pool */
            await aaveToken.transferFrom(
                liquidityProvider.address,
                tradingPairExchange.address,
                ethers.utils.parseUnits('.25', 18)
            );

            await daiToken.transferFrom(
                liquidityProvider.address,
                tradingPairExchange.address,
                ethers.utils.parseUnits('14', 18)
            );

            /* Mint relevant amount of Liquidity Tokens */
            await tradingPairExchange.mint(liquidityProvider.address);

            /* Liquidity Provider approve Deployer to transfer Liquidity Tokens */
            await tradingPairExchange.connect(liquidityProvider).approve(
                deployer.address,
                ethers.utils.parseUnits('5', 18)
            );

            /* Transfer Liquidity Tokens to TradingPairExchange */
            await tradingPairExchange.transferFrom(
                liquidityProvider.address,
                tradingPairExchange.address,
                ethers.utils.parseUnits('4', 18)
            );

            /* Burn Liquidity Tokens */
            await tradingPairExchange.burn(liquidityProvider.address);  

            /* Expectation */
            const dexDeveloperBalance = await tradingPairExchange.balanceOf(dexDeveloperAccount.address);
            const formattedDexDeveloperBalance = ethers.utils.formatUnits(dexDeveloperBalance);
            expect(formattedDexDeveloperBalance).to.equal('0.322556671273615636');
        });

    });

});