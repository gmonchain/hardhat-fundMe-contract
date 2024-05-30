const { assert, expect } = require("chai");
const { deployments, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
      let fundMe;
      let deployer;
      const sendValue = ethers.parseEther("1");

      const getAddress = async (contractName) => {
        return (await deployments.get(contractName)).address;
      };

      beforeEach(async function () {
        deployer = await ethers.provider.getSigner();
        fundMe = await ethers.getContractAt(
          "FundMe",
          await getAddress("FundMe"),
          deployer
        );
      });

      it("allows people to fund and withdraw", async function () {
        await fundMe.fund({ value: sendValue });
        await fundMe.withdraw();
        const endingBalance = await ethers.provider.getBalance(
          await fundMe.getAddress()
        );
        assert.equal(endingBalance.toString(), "0");
      });
    });
