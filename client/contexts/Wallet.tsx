"use client";

import { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

type WalletType = "solana" | "ethereum" | null;

type WalletContextType = {
  walletAddress: string;
  setWalletAddress: (address: string) => void;
  walletType: WalletType;
  setWalletType: (type: WalletType) => void;
  status: string;
  setStatus: (status: string) => void;
};

const WalletContext = createContext<WalletContextType>({} as WalletContextType);

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  // Retrieve wallet address from cookies (if it exists)
  const [walletAddress, setWalletAddress] = useState<string>(() => {
    return Cookies.get("walletAddress") || "";
  });

  const [walletType, setWalletType] = useState<WalletType>(null);
  const [status, setStatus] = useState("");

  // Update cookies whenever the wallet address changes
  useEffect(() => {
    if (walletAddress) {
      Cookies.set("walletAddress", walletAddress, { expires: 1 }); // 1 day
    } else {
      Cookies.remove("walletAddress"); // Remove cookie if wallet is empty
    }
  }, [walletAddress]);

  return (
    <WalletContext.Provider
      value={{
        walletAddress,
        setWalletAddress,
        walletType,
        setWalletType,
        status,
        setStatus,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
