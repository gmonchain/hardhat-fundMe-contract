const { assert, expect } = require("chai");
const { deployments, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", function () {
      let fundMe;
      let deployer;
      let mockV3Aggregator;
      const sendValue = ethers.parseEther("1");

      const getAddress = async (contractName) => {
        return (await deployments.get(contractName)).address;
      };

      beforeEach(async function () {
        deployer = await ethers.provider.getSigner();
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContractAt(
          "FundMe",
          await getAddress("FundMe"),
          deployer
        );
        mockV3Aggregator = await ethers.getContractAt(
          "MockV3Aggregator",
          await getAddress("MockV3Aggregator"),
          deployer
        );
      });

      describe("constructor", function () {
        it("sets the aggregator addresses correctly", async function () {
          const response = await fundMe.getPriceFeed();
          assert.equal(response, await mockV3Aggregator.getAddress());
        });
      });

      describe("fund", async function () {
        it("should fail if you don't send enough ETH", async function () {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          );
        });
        it("updates the amount funded data structure", async function () {
          await fundMe.fund({ value: sendValue });
          const response = await fundMe.getAddressToAmountFunded(
            deployer.address
          );
          assert.equal(response.toString(), sendValue.toString());
        });
        it("Adds funder to array of funders", async function () {
          await fundMe.fund({ value: sendValue });
          const funder = await fundMe.getFunder(0);
          assert.equal(funder, deployer.address);
        });
      });

      describe("withdraw", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue });
        });

        it("withdraws ETH from a single funder", async function () {
          // Arange
          const startingFundMeBalance = await ethers.provider.getBalance(
            await fundMe.getAddress()
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer.address
          );
          // Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReciept = await transactionResponse.wait(1);
          const gasCost =
            transactionReciept.gasUsed * transactionReciept.gasPrice;

          const endingFundMeBalance = await ethers.provider.getBalance(
            await fundMe.getAddress()
          );
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer.address
          );
          //   // Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance + startingDeployerBalance,
            endingDeployerBalance + gasCost
          );
        });

        it("allows us to withdraw with multiple funders", async function () {
          // Arrange
          const accounts = await ethers.getSigners();
          for (let i = 1; i < accounts.length; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i]);
            await fundMeConnectedContract.fund({ value: sendValue });
          }
          const startingFundMeBalance = await ethers.provider.getBalance(
            await fundMe.getAddress()
          );
          const startingDeployerBalance = await ethers.provider.getBalance(
            deployer.address
          );

          // Act
          const transactionResponse = await fundMe.withdraw();
          const transactionReciept = await transactionResponse.wait(1);
          const gasCost =
            transactionReciept.gasUsed * transactionReciept.gasPrice;
          const endingFundMeBalance = await ethers.provider.getBalance(
            await fundMe.getAddress()
          );
          const endingDeployerBalance = await ethers.provider.getBalance(
            deployer.address
          );

          // Assert
          assert.equal(endingFundMeBalance, 0);
          assert.equal(
            startingFundMeBalance + startingDeployerBalance,
            endingDeployerBalance + gasCost
          );

          // Make sure funders array is reset properly
          await expect(fundMe.getFunder(0)).to.be.reverted;
          for (let i = 1; i < accounts.length; i++) {
            assert.equal(
              await fundMe.getAddressToAmountFunded(accounts[i].address),
              0
            );
          }
        });

        it("only allows the owner to withdraw", async function () {
          const accounts = await ethers.getSigners();
          const attacker = accounts[1];
          const attackerConnectedContract = await fundMe.connect(attacker);
          //   await attackerConnectedContract.withdraw();
          await expect(
            attackerConnectedContract.withdraw()
          ).to.be.revertedWithCustomError(
            attackerConnectedContract,
            "FundMe__NotOwner"
          );
        });
      });
    });
