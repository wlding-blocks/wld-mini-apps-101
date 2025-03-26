"use client";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import { useWallet } from "@/context/WalletContext";
import { User, Wallet, LogOut, Copy } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

export const WalletHeader = () => {
  const { user, loading, connect, disconnect } = useWallet();
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    if (user?.walletAddress) {
      navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="w-full bg-white py-3 px-4 border-b border-gray-100 shadow-sm flex items-center justify-between">
      <div className="flex items-center">
        <div className="text-lg font-bold text-gray-800 flex items-center">
          <span className="hidden sm:inline">World</span>
          <span className="text-blue-600 ml-1">App</span>
        </div>
      </div>
      
      <div>
        {!user ? (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={connect}
              disabled={loading}
              variant="secondary"
              size="sm"
              className="flex items-center gap-2"
            >
              <Wallet className="h-4 w-4" />
              {loading ? "Connecting..." : "Connect Wallet"}
            </Button>
          </motion.div>
        ) : (
          <div className="flex items-center gap-3">
            {/* Wallet Address Section */}
            <div className="hidden sm:flex items-center gap-2">
              <div className="bg-blue-50 py-1 px-3 rounded-lg flex items-center gap-2 relative">
                <Wallet className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-blue-600">
                  {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                </span>
                <button 
                  onClick={handleCopyAddress}
                  className="ml-2 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {copied ? (
                    <motion.span 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-green-600 text-xs"
                    >
                      Copied!
                    </motion.span>
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>
            
            {/* User Profile Section */}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-800">
                  {user.username || "User"}
                </div>
                <Button
                  onClick={disconnect}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-500 hover:text-gray-700 p-0 h-auto flex items-center gap-1"
                >
                  <LogOut className="h-3 w-3" /> Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};