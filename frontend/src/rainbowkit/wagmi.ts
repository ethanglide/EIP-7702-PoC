import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { buildBearChain } from "./customChain";

export const wagmi = getDefaultConfig({
  appName: "EIP-7702 PoC",
  projectId: "eip-7702-poc",
  chains: [buildBearChain],
});
