import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet } from "wagmi/chains";

export const wagmi = getDefaultConfig({
  appName: "EIP-7702 PoC",
  projectId: "eip-7702-poc",
  chains: [mainnet],
});
