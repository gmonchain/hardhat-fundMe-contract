const { ethers, deployments } = require("hardhat");

const getAddress = async (contractName) => {
  return (await deployments.get(contractName)).address;
};

async function main() {
  const deployer = await ethers.provider.getSigner();
  const fundMe = await ethers.getContractAt(
    "FundMe",
    await getAddress("FundMe"),
    deployer
  );
  console.log("Funding Contract...");
  // Fund with an amount between MINIMUM_FUND_AMOUNT (0.01 ether) and MAXIMUM_FUND_AMOUNT (10 ether)
  const transactionResponse = await fundMe.fund({
    value: ethers.parseEther("0.5"), // Changed from 0.1 to 0.5 for demonstration
  });
  await transactionResponse.wait(1);
  console.log("Funded!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
