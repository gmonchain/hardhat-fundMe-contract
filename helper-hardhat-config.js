const networkConfig = {
  11155111: {
    name: "sepolia",
    ethUsdPriceFeed: "0x694AA1769357215DE4FAC081bf1f309aDC325306",
  },
  4: {
    name: "rinkby",
    ethUsdPriceFeed: "",
  },
  137: {
    name: "polygon",
    ethUsdPriceFeed: "",
  },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = { networkConfig, developmentChains, DECIMALS, INITIAL_ANSWER };
