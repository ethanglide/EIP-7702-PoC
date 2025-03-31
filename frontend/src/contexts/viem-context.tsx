import {
  createContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction,
  useContext,
} from "react";
import { initializeWalletClient } from "../viem/viem";

interface ViemContextType {
  walletClient: ReturnType<typeof initializeWalletClient> | null;
  setMnemonic: Dispatch<SetStateAction<string>>;
}

const ViemContext = createContext<ViemContextType | null>(null);

export function ViemContextProvider({ children }: { children: ReactNode }) {
  const [mnemonic, setMnemonic] = useState("");
  let walletClient = null;

  if (mnemonic) {
    try {
      walletClient = initializeWalletClient(mnemonic);
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <ViemContext.Provider value={{ walletClient, setMnemonic }}>
      {children}
    </ViemContext.Provider>
  );
}

export function useViem() {
  const context = useContext(ViemContext);
  if (!context) {
    throw new Error("useViem must be used within a ViemContextProvider");
  }
  return context;
}
