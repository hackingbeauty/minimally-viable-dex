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

        let provider = ethers.getDefaultProvider();
        let code = await provider.getCode(tradingPairExchangeAddr);
        console.log(code);

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
        //before each goes here and sets up liquidity pools

        // /* Transfer tokens from Liquidity Provider account to AAVE/DAI pool */
        // await aaveToken.transferFrom(
        //     liquidityProvider.address,
        //     tradingPairExchange.address,
        //     amountADesired
        // );
        // await daiToken.transferFrom(
        //     liquidityProvider.address,
        //     tradingPairExchange.address,
        //     amountBDesired
        // );

        // /* Mint Liquidity Tokens for the Liquidity Provider */
        // await tradingPairExchange.burn(liquidityProvider.address);

        it("should debit a Liquidity Provider's account after burning Liquidity Tokens", async() => {


        });

        it("should send Liquidity Provider ERC20 tokens proportional to amount of Liquidity Tokens burned", async() => {


        });

        it("should remit payment of the protocol fee to the exchange developer account", async() => {


        });

    });


    // describe.skip("Preeventing Reentrancy Attacks", () => {

    //     it("should ensure the mint() function is locked throughout execution", async()=> {
    //         const { 
    //             aaveToken,
    //             daiToken,
    //             amountADesired,
    //             amountBDesired,
    //             tradingPairExchange,
    //             liquidityProvider,
    //             deployer
    //         } = await loadFixture(deployExchangeFixture);

    //         const reentrancyAttackContract = await ethers.getContractFactory("ReentrancyAttacker");
    //         const reentrancyAttacker = await reentrancyAttackContract.deploy(tradingPairExchange.address);
    //         await reentrancyAttacker.deployed();

    //         const reentracyAttackerSigner = reentrancyAttacker.provider.getSigner();


    //         /* Mint tokens for Liquidity Provider's account */
    //         await aaveToken.mint(
    //             reentrancyAttacker.address,
    //             ethers.utils.parseUnits('130', 18)
    //         );

    //         await daiToken.mint(
    //             reentrancyAttacker.address,
    //             ethers.utils.parseUnits('130', 18)
    //         );


    //         await reentrancyAttacker.approve(
    //             aaveToken.address,
    //             deployer.address,
    //             ethers.utils.parseUnits('130', 18)
    //         );
    //         await reentrancyAttacker.approve(
    //             daiToken.address,
    //             deployer.address,
    //             ethers.utils.parseUnits('130', 18)
    //         );


    //         // /* Transfer tokens from Liquidity Provider account to AAVE/DAI pool */
    //         await aaveToken.transferFrom(
    //             reentrancyAttacker.address,
    //             tradingPairExchange.address,
    //             amountADesired
    //         );
    //         await daiToken.transferFrom(
    //             reentrancyAttacker.address,
    //             tradingPairExchange.address,
    //             amountBDesired
    //         );

    //         console.log('---- reentrancyAttacker.address ----', reentrancyAttacker.address);
    //         console.log('---- tradingPairExchange.balanceOf(reentrancyAttack) ----', await tradingPairExchange.balanceOf(reentrancyAttacker.address));

    //         console.log('---- dai allowance -----', await daiToken.callStatic.allowance(reentrancyAttacker.address, deployer.address));
    //         console.log('---- aave allowance -----', await aaveToken.callStatic.allowance(reentrancyAttacker.address, deployer.address));

    //         // /* Mint Liquidity Tokens for the Reentrancy Attacker */
    //         await tradingPairExchange.mint(reentrancyAttacker.address);

    //         console.log('---- tradingPairExchange.balanceOf(reentrancyAttack) ----', await tradingPairExchange.balanceOf(reentrancyAttacker.address));

                

    //     });

    // });

});