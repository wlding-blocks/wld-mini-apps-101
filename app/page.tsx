"use client";
import { useEffect, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { VerifyBlock } from "@/components/Verify";
import { PayBlock } from "@/components/Pay";
import { WalletAuth } from "@/components/WalletAuth";
import { Login } from "@/components/Login";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMiniKit = async () => {
      const isInstalled = MiniKit.isInstalled();
      if (isInstalled) {
        setIsLoading(false);
      } else {
        setTimeout(checkMiniKit, 500);
      }
    };

    checkMiniKit();
  }, []);

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8 lg:p-12 bg-gray-50">
        <div className="flex flex-col items-center justify-center text-center">
          <svg className="animate-spin h-10 w-10 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-900">Loading MiniKit...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-8 lg:p-12 bg-gray-50">
      <div className="w-full max-w-md mx-auto space-y-8 py-8">
        <h1 className="text-2xl font-bold text-center mb-8">WLD 101</h1>

        <section className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Login</h2>
          <Login />
        </section>

        <section className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Wallet Auth</h2>
          <WalletAuth />
        </section>

        <section className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Incognito Action</h2>
          <VerifyBlock />
        </section>

        <section className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Payment</h2>
          <PayBlock />
        </section>
      </div>
    </main>
  );
}
