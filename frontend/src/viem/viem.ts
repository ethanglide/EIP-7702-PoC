import { createWalletClient, http } from "viem";
import { buildBearChain } from "./customChain";
import { mnemonicToAccount } from "viem/accounts";

// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum?: any;
  }
}

export function initializeWalletClient(mnemonic: string) {
  const localAccount = mnemonicToAccount(mnemonic);

  return createWalletClient({
    account: localAccount,
    chain: buildBearChain,
    transport: http(),
  });
}
