"use client";
import { useEffect, useState } from "react";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import { getTokensPrices } from "../utils/getPriceData";
import { WalletHeader } from "@/components/WalletHeader";
import { ArrowUpRight, ExternalLink, Info, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

// Project data with token addresses
const projects = [
  {
    id: 1,
    name: "DeFi Yield Optimizer",
    token: "YOP",
    tokenAddress: "0xae1eaae3f627aaca434127644371b67b18444051", // YOP token address
    amount: "10,000",
    link: "https://example.com/defi-yield",
    description: "Optimize your DeFi returns with automated yield strategies",
  },
  {
    id: 2,
    name: "Decentralized Exchange",
    token: "DEX",
    tokenAddress: "0x147faf8de9d8d8daae129b187f0d02d819126750", // DEX token address
    amount: "5,000",
    link: "https://example.com/dex",
    description: "Trade any token without intermediaries with low fees",
  },
  {
    id: 3,
    name: "NFT Marketplace",
    token: "NFT",
    tokenAddress: "0x8a0c542ba7bbbab7cf3551ffcc546cdc5362d2a1", // Sample NFT token
    amount: "2,000",
    link: "https://example.com/nft",
    description: "Buy, sell and mint unique digital collectibles",
  },
  {
    id: 4,
    name: "Cross-Chain Bridge",
    token: "BRIDGE",
    tokenAddress: "0x8b3192f5eebd8579568a2ed41e6feb402f93f73f", // Sample Bridge token
    amount: "8,000",
    link: "https://example.com/bridge",
    description: "Move assets seamlessly between different blockchains",
  },
  {
    id: 5,
    name: "DID Solution",
    token: "ID",
    tokenAddress: "0x70d2b7c19352bb76e4409858ff5746e500f2b67c", // Sample ID token
    amount: "15,000",
    link: "https://example.com/did",
    description: "Decentralized identity verification framework",
  },
];

export default function Projects() {
  const [loading, setLoading] = useState(true);
  const [tokenPrices, setTokenPrices] = useState<{ [key: string]: any }>({});
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

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

  const toggleProject = (id: number) => {
    if (expandedProject === id) {
      setExpandedProject(null);
    } else {
      setExpandedProject(id);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      <WalletHeader />
      
      <motion.div 
        className="max-w-md mx-auto w-full px-4 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-sm text-gray-600">Discover and explore projects</p>
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {projects.map((project, index) => {
            const priceData = tokenPrices[project.tokenAddress];
            const isExpanded = expandedProject === project.id;
            const priceChange = priceData?.priceChange24h || 0;
            const isPriceUp = priceChange >= 0;
            
            return (
              <motion.div 
                key={project.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                layout
              >
                {/* Project Header - Always visible */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleProject(project.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-400 flex items-center justify-center mr-3">
                        <span className="text-lg font-bold text-white">{project.token.substring(0, 1)}</span>
                      </div>
                      <div>
                        <h2 className="text-base font-bold">{project.name}</h2>
                        <div className="text-xs text-gray-500 mt-1">
                          {project.token} Token
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 ${loading ? 'bg-gray-100' : isPriceUp ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs rounded-full flex items-center`}>
                      {loading ? (
                        'Loading...'
                      ) : (
                        <>
                          ${Number(priceData?.price || 0).toFixed(4)}
                          <span className="ml-1">
                            {isPriceUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Price change and amount */}
                  <div className="mt-3 flex justify-between items-center">
                    {!loading && (
                      <div className="text-xs">
                        <span className={isPriceUp ? 'text-green-600' : 'text-red-600'}>
                          {priceChange > 0 ? '+' : ''}{Number(priceChange).toFixed(2)}%
                        </span>
                        <span className="text-gray-500 ml-1">24h</span>
                      </div>
                    )}
                    <div className="text-xs text-gray-600 ml-auto">
                      <span className="font-medium">Available:</span>{" "}
                      {project.amount} {project.token}
                    </div>
                  </div>
                </div>
                
                {/* Project Details - Only visible when expanded */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-t border-gray-100"
                  >
                    <div className="p-4">
                      <p className="text-sm text-gray-600 mb-4">{project.description}</p>
                      
                      {!loading && priceData?.volume24h && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-4">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-600">24h Volume:</span>
                            <span className="font-medium">${Number(priceData.volume24h).toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                      
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center text-sm font-medium transition-colors flex items-center justify-center"
                      >
                        <span>Visit Project</span>
                        <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </main>
  );
}
