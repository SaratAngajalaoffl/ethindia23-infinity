import { HardhatUserConfig, vars } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

import networks from "./config/networks.json";

const ETHERSCAN_API_KEY = vars.get("ETHERSCAN_API_KEY");

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks,
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
    enabled: true,
  },
};

export default config;
