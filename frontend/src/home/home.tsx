import { TCOINAbi, TCOINAddress } from "../viem/contractData";
import { useViem } from "../contexts/viem-context";
import { Link } from "react-router";
import Batching from "../batching/batching";

export default function Home() {
  const { walletClient } = useViem();

  async function try7702Transaction() {
    if (!walletClient) {
      return;
    }
    // Set EOA code to the contract address
    const authorization = await walletClient.signAuthorization({
      // account: walletClient.account,
      executor: "self",
      contractAddress: TCOINAddress,
    });

    // Call the contract function
    await walletClient.writeContract({
      authorizationList: [authorization],
      address: walletClient.account.address,
      abi: TCOINAbi,
      functionName: "approve",
      args: [TCOINAddress, 200n],
    });
    console.log("Approvals done");

    const data = await walletClient.readContract({
      address: TCOINAddress,
      abi: TCOINAbi,
      functionName: "allowance",
      args: [walletClient.account.address, TCOINAddress],
    });
    console.log(data);
  }

  return (
    <div>
      <Batching />
    </div>
  );
}
