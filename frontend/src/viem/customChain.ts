import { defineChain } from "viem";

export const buildbearRpcUrl = "https://rpc.buildbear.io/novel-vision-8fd2617a";
const buildbearExplorerUrl =
  "https://explorer.buildbear.io/novel-vision-8fd2617a";

export const buildBearChain = defineChain({
  id: 25141,
  name: "BuildBear Sandbox Network",
  nativeCurrency: {
    name: "BBETH",
    decimals: 18,
    symbol: "BBETH",
  },
  rpcUrls: {
    default: {
      http: [buildbearRpcUrl],
    },
  },
  blockExplorers: {
    default: {
      name: "BuildBear Explorer",
      url: buildbearExplorerUrl,
    },
  },
});
