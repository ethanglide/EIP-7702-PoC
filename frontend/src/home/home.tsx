import { encodeFunctionData } from "viem";
import { TCOINAbi, TCOINAddress } from "../viem/contractData";
import { useState } from "react";
import { initializeWalletClient } from "../viem/viem";

export default function Home() {
  const [mnemonic, setMnemonic] = useState("");

  async function try7702Transaction() {
    const walletClient = initializeWalletClient(mnemonic);
    const account = walletClient.account;

    // Set EOA code to the contract address
    const authorization = await walletClient.signAuthorization({
      account,
      contractAddress: TCOINAddress,
    });

    // Call the contract function
    const hash = await walletClient.sendTransaction({
      authorizationList: [authorization],
      to: account.address,
      data: encodeFunctionData({
        abi: TCOINAbi,
        functionName: "decimals", // Can be anything
        args: [],
      }),
    });
    console.log(hash);
  }

  return (
    <div className="flex flex-col gap-4">
      Home Page
      <fieldset className="fieldset">
        <legend className="fieldset-legend">Mnemonic Phrase</legend>
        <input
          type="password"
          className="input w-full"
          value={mnemonic}
          onChange={(e) => setMnemonic(e.target.value)}
        />
      </fieldset>
      <button
        className="btn btn-primary"
        onClick={try7702Transaction}
      >
        Try 7702 Transaction
      </button>
    </div>
  );
}
