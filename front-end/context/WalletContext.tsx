"use client";
import { MiniKit, WalletAuthInput } from "@worldcoin/minikit-js";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the User type
type User = {
  walletAddress: string;
  username: string | null;
  profilePictureUrl: string | null;
};

// Define the context value type
interface WalletContextType {
  user: User | null;
  loading: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

// Create the wallet context with default values
const WalletContext = createContext<WalletContextType>({
  user: null,
  loading: false,
  connect: async () => {},
  disconnect: () => {},
});

// Create a hook to use the wallet context
export const useWallet = () => useContext(WalletContext);

// Wallet Auth Input configuration
const walletAuthInput = (nonce: string): WalletAuthInput => {
  return {
    nonce,
    requestId: "0",
    expirationTime: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    notBefore: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
    statement: "Connect your wallet to World App",
  };
};

// Provider component for the wallet context
export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Check if there's a connected wallet on startup
  useEffect(() => {
    // Check if MiniKit is available
    if (typeof window !== "undefined" && MiniKit.isInstalled()) {
      // Check if user wallet address is available
      if (MiniKit.walletAddress) {
        setUser({
          walletAddress: MiniKit.walletAddress,
          username: MiniKit.user?.username || null,
          profilePictureUrl: MiniKit.user?.profilePictureUrl || null,
        });
      }
    }
  }, []);

  // Connect wallet function
  const connect = async () => {
    try {
      setLoading(true);

      if (!MiniKit.isInstalled()) {
        console.warn("MiniKit is not installed.");
        setLoading(false);
        return;
      }

      // For development, we'll use mock data to avoid 404 errors
      // In production, use the commented code below
      
      /*
      const res = await fetch(`/api/nonce`);
      const { nonce } = await res.json();

      const { finalPayload } = await MiniKit.commandsAsync.walletAuth(walletAuthInput(nonce));

      if (finalPayload.status === 'error') {
        setLoading(false);
        return;
      }

      // Verify the response server-side
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: finalPayload,
          nonce,
        }),
      });

      if (response.status === 200) {
        setUser({
          walletAddress: MiniKit.walletAddress,
          username: MiniKit.user?.username || null,
          profilePictureUrl: MiniKit.user?.profilePictureUrl || null,
        });
      }
      */

      // Mock login for development
      setTimeout(() => {
        setUser({
          walletAddress: "0x123abc456def789ghi",
          username: "WorldUser",
          profilePictureUrl: null,
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setLoading(false);
    }
  };

  // Disconnect wallet function
  const disconnect = () => {
    setUser(null);
  };

  return (
    <WalletContext.Provider
      value={{
        user,
        loading,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}; 