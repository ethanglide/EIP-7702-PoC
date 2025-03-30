import { FormEvent, useEffect, useState } from "react";
import { useViem } from "../contexts/viem-context";
import Modal from "./modal";
import { formatEther } from "viem";

export default function ConnectWallet() {
  const { walletClient, setMnemonic } = useViem();
  const [newMnemonic, setNewMnemonic] = useState("");

  const modalId = "connect-wallet-modal";

  function handleConnectWallet(e: FormEvent) {
    e.preventDefault();
    setMnemonic(newMnemonic);
    setNewMnemonic("");
    const modal = document.getElementById(modalId) as HTMLDialogElement;
    modal?.close();
  }

  if (walletClient) {
    return <WalletInfo />;
  }

  return (
    <>
      <button
        className="btn btn-accent"
        onClick={() => {
          const modal = document.getElementById(modalId) as HTMLDialogElement;
          modal?.showModal();
        }}
      >
        Connect Wallet
      </button>
      <Modal id={modalId}>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold">Connect Wallet</h2>
          <p>Only local accounts (private key, mnemonic, etc.) and not JSON-RPC accounts (metamask, etc.) are supported for signing EIP-7702 Authorizations.</p>
          <a
            href="https://viem.sh/docs/eip7702/signAuthorization"
            target="_blank"
            className="link link-hover link-accent w-fit"
          >
            More information
          </a>
          <form
            onSubmit={handleConnectWallet}
            className="flex flex-col gap-4"
          >
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Mnemonic Phrase</legend>
              <input
                type="password"
                className="input w-full"
                value={newMnemonic}
                onChange={(e) => setNewMnemonic(e.target.value)}
                required
              />
            </fieldset>
            <button type="submit" className="btn btn-accent">
              Connect Wallet
            </button>
          </form>
        </div>
      </Modal>
    </>
  );
}

function WalletInfo() {
  const { walletClient, setMnemonic } = useViem();
  const [balance, setBalance] = useState<string>("");
  const address = walletClient!.account.address;
  const formattedAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  function disconnectWallet() {
    setMnemonic("");
  }

  async function getBalance() {
    const balance = await walletClient!.getBalance({ address });
    setBalance(formatEther(balance));
  }

  useEffect(() => {
    getBalance();
  }, [walletClient]);

  return (
    <div className="flex gap-4 items-center">
      <div className="tooltip tooltip-bottom" data-tip={address}>
        <code>{formattedAddress}</code>
      </div>
      <p className="font-bold">{balance} BBETH</p>
      <button
        onClick={disconnectWallet}
        className="btn btn-accent"
      >
        Disconnect
      </button>
    </div>
  );
}