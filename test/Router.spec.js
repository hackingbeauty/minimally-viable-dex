const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");

describe("Router contract", () => {
    async function deployRouterFixture() {
        const WETHERC20TokenContract = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
        const DAIERC20TokenContract ="0x6B175474E89094C44Da98b954EedeAC495271d0F";

        /* 1ETH = $1,000 USD, 1 DAI = $1 USD */
        const amountADesired = 1; //ETH
        const amountBDesired = 1000; //DAI

        const amountAMin = 1;
        const amountBMin = 1000;

        const [owner] = await ethers.getSigners();

        const FactoryContract = await ethers.getContractFactory("Factory", owner);
        const factory = await FactoryContract.deploy(owner.address);
        const factoryAddr = await factory.deployed();

        const RouterContract = await ethers.getContractFactory("Router", owner);
        const router = await RouterContract.deploy(factoryAddr.address);
        await router.deployed();

        return { 
            WETHERC20TokenContract,
            DAIERC20TokenContract,
            amountADesired,
            amountBDesired,
            amountAMin,
            amountBMin,
            factory,
            router
        };
    }

    describe("Deposit Liquidity", () => {
            it.only("should only allow a deposit of two tokens of equal value", async () =>{
                const { 
                    WETHERC20TokenContract,
                    DAIERC20TokenContract,
                    amountADesired,
                    amountBDesired,
                    amountAMin,
                    amountBMin,
                    router 
                } = await loadFixture(deployRouterFixture);

                const { amountA, amountB } = await router.depositLiquidity(
                    WETHERC20TokenContract,
                    DAIERC20TokenContract,
                    amountADesired,
                    amountBDesired,
                    amountAMin,
                    amountBMin
                );
    
                expect(true).to.eq(true);
            });

            it("should create a new liquidity pool if one doesn't already exist for a trading pair", async () => {

            });
        
            it("should set the amounts of the two tokens to the amounts desired if a liquidity pool doesn't exist", async() => {

            });

            it("should ensure that the amount of tokenB a Liquidity Provider wants to deposit is not excessive", async() => {

            });

            it("should ensure that the amount of tokenB to be deposited should be less than or equal to amountBMin", async() => {

            });
      
        });
        
        describe("Factory Contract", () => {
            it("", () => {

            });
        });

        describe("TradingPairExchange Contract", () => {
            it("", () => {

            });
        });


});