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
  console.log("withdrawing funds...");
  const transactionResponse = await fundMe.withdraw();
  await transactionResponse.wait(1);
  console.log("Got it back!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
