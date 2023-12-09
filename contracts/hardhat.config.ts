import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import networks from "./config/networks.json";

const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks,
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
      "scroll-sepolia": "ZFWGKW1QXU1YEUU9SV4JY8UZ1DCSW1TVSN",
      "arbitrum-sepolia": ETHERSCAN_API_KEY,
      baseGoerli: ETHERSCAN_API_KEY,
    },
    enabled: true,
    customChains: [
      {
        chainId: 534351,
        network: "scroll-sepolia",
        urls: {
          apiURL: "https://api-sepolia.scrollscan.com/api",
          browserURL: "https://sepolia.scrollscan.com",
        },
      },
      {
        chainId: 421614,
        network: "arbitrum-sepolia",
        urls: {
          apiURL: "https://api-sepolia.scrollscan.com/api",
          browserURL: "https://sepolia.scrollscan.com",
        },
      },
    ],
  },
};

export default config;
