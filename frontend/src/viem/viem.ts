import { createWalletClient, http, publicActions } from "viem";
import { buildBearChain, buildbearRpcUrl } from "./customChain";
import { mnemonicToAccount } from "viem/accounts";

export function initializeWalletClient(mnemonic: string) {
  const localAccount = mnemonicToAccount(mnemonic);

  return createWalletClient({
    account: localAccount,
    chain: buildBearChain,
    transport: http(buildbearRpcUrl),
  }).extend(publicActions);
}
