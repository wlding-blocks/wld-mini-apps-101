"use client";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import { useWallet } from "@/context/WalletContext";
import { User, Wallet } from "lucide-react";

export const WalletHeader = () => {
  const { user, loading, connect, disconnect } = useWallet();

  return (
    <div className="w-full bg-white py-3 px-4 border-b border-gray-100 shadow-sm flex items-center justify-between">
      <div className="text-lg font-medium text-gray-700">
        <span className="hidden sm:inline">World</span> App
      </div>
      
      <div>
        {!user ? (
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
        ) : (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-blue-50 py-1 px-3 rounded-lg">
              <Wallet className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-blue-600">
                {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden sm:block">
                <div className="text-sm font-medium">{user.username || "User"}</div>
                <Button
                  onClick={disconnect}
                  variant="ghost"
                  size="xs"
                  className="text-xs text-gray-500 hover:text-gray-700 p-0 h-auto"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 