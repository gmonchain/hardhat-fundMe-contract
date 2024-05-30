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
  const transactionResponse = await fundMe.fund({
    value: ethers.parseEther("0.1"),
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
