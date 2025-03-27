import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    buildbear: {
      url: "https://rpc.buildbear.io/novel-vision-8fd2617a",
    },
  },
};

export default config;
