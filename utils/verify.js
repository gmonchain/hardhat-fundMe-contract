const { run } = require("hardhat");

async function verify(contractAddress, args) {
  console.log("verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
    console.log("Verification Successful!");
  } catch (error) {
    if (error.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.log("Verification Error:", error);
    }
  }
}

module.exports = { verify };
