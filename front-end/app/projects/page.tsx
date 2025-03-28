"use client";
import { useEffect, useState } from "react";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import { getTokensPrices } from "../utils/getPriceData";
import { WalletHeader } from "@/components/WalletHeader";
import { ArrowUpRight, ExternalLink, Info, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

interface Project {
  id: string;
  name: string;
  description: string;
  tokenSymbol: string;
  tokenIcon: string;
  tokenPrice: number;
  tokenAmount: number;
  tokenAddress: string;
  projectUrl: string;
  imageUrl: string;
}

export default function Projects() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tokenPrices, setTokenPrices] = useState<{ [key: string]: any }>({});
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  // Load projects from JSON file
  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch("/data/projects.json");
        const projectsData = await response.json();
        setProjects(projectsData);
      } catch (error) {
        console.error("Error loading projects:", error);
      }
    }

    loadProjects();
  }, []);

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

    if (projects.length > 0) {
      fetchPrices();

      // Refresh prices every 30 seconds
      const interval = setInterval(fetchPrices, 30000);
      return () => clearInterval(interval);
    }
  }, [projects]);

  const toggleProject = (id: string) => {
    if (expandedProject === id) {
      setExpandedProject(null);
    } else {
      setExpandedProject(id);
    }
  };

  // If projects are still loading
  if (projects.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center justify-center p-8">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium text-gray-600">
            Loading projects...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
     
    </main>
  );
}
