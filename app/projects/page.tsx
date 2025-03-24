"use client";
import { useEffect, useState } from "react";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import Link from "next/link";
import { getTokensPrices } from "../utils/getPriceData";

// Project data with token addresses
const projects = [
  {
    id: 1,
    name: "DeFi Yield Optimizer",
    token: "YOP",
    tokenAddress: "0xae1eaae3f627aaca434127644371b67b18444051", // YOP token address
    amount: "10,000",
    link: "https://example.com/defi-yield",
  },
  {
    id: 2,
    name: "Decentralized Exchange",
    token: "DEX",
    tokenAddress: "0x147faf8de9d8d8daae129b187f0d02d819126750", // DEX token address
    amount: "5,000",
    link: "https://example.com/dex",
  },
  {
    id: 3,
    name: "NFT Marketplace",
    token: "NFT",
    tokenAddress: "0x8a0c542ba7bbbab7cf3551ffcc546cdc5362d2a1", // Sample NFT token
    amount: "2,000",
    link: "https://example.com/nft",
  },
  {
    id: 4,
    name: "Cross-Chain Bridge",
    token: "BRIDGE",
    tokenAddress: "0x8b3192f5eebd8579568a2ed41e6feb402f93f73f", // Sample Bridge token
    amount: "8,000",
    link: "https://example.com/bridge",
  },
  {
    id: 5,
    name: "DID Solution",
    token: "ID",
    tokenAddress: "0x70d2b7c19352bb76e4409858ff5746e500f2b67c", // Sample ID token
    amount: "15,000",
    link: "https://example.com/did",
  },
];

export default function Projects() {
  const [loading, setLoading] = useState(true);
  const [tokenPrices, setTokenPrices] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setLoading(true);
        const tokenAddresses = projects.map(project => project.tokenAddress);
        console.log("Fetching prices for:", tokenAddresses);
        const prices = await getTokensPrices(tokenAddresses);
        console.log("Prices", prices);
        setTokenPrices(prices);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching prices:", error);
        setLoading(false);
      }
    };

    fetchPrices();

    console.log("Started")

    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex min-h-screen flex-col p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-display font-semibold">Projects</h1>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => (window.location.href = "/missions")}
        >
          View Missions
        </Button>
      </div>

      <div className="space-y-4">
        {projects.map((project) => {
          const priceData = tokenPrices[project.tokenAddress];
          
          return (
            <div key={project.id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-medium">{project.name}</h2>
                    <div className="text-sm text-gray-500 mt-1">
                      Token: {project.token}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`ml-2 px-2 py-1 ${loading ? 'bg-gray-100' : priceData?.priceChange24h >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-sm rounded-md`}>
                      {loading ? (
                        'Loading...'
                      ) : (
                        <>
                          ${Number(priceData?.price || 0).toFixed(4)}
                          <span className="text-xs ml-1">
                            ({priceData?.priceChange24h > 0 ? '+' : ''}{Number(priceData?.priceChange24h || 0).toFixed(2)}%)
                          </span>
                        </>
                      )}
                    </div>
                    {!loading && priceData?.volume24h && (
                      <div className="text-xs text-gray-500 mt-1">
                        24h Vol: ${Number(priceData.volume24h).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-600">
                    <span className="font-medium">Available:</span>{" "}
                    {project.amount} {project.token}
                  </div>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View Project
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4 bg-white border-t">
        <Button
          variant="primary"
          className="w-full max-w-md"
          onClick={() => (window.location.href = "/")}
        >
          Back to Home
        </Button>
      </div>
    </main>
  );
}
