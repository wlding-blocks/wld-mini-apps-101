"use client";
import { useEffect, useState } from "react";
import { Button } from "@worldcoin/mini-apps-ui-kit-react";
import Link from "next/link";

// Mock data for projects
const mockProjects = [
  {
    id: 1,
    name: "DeFi Yield Optimizer",
    token: "YOP",
    price: "$0.48",
    amount: "10,000",
    link: "https://example.com/defi-yield",
  },
  {
    id: 2,
    name: "Decentralized Exchange",
    token: "DEX",
    price: "$2.14",
    amount: "5,000",
    link: "https://example.com/dex",
  },
  {
    id: 3,
    name: "NFT Marketplace",
    token: "NFT",
    price: "$3.75",
    amount: "2,000",
    link: "https://example.com/nft",
  },
  {
    id: 4,
    name: "Cross-Chain Bridge",
    token: "BRIDGE",
    price: "$1.23",
    amount: "8,000",
    link: "https://example.com/bridge",
  },
  {
    id: 5,
    name: "DID Solution",
    token: "ID",
    price: "$0.95",
    amount: "15,000",
    link: "https://example.com/did",
  },
];

export default function Projects() {
  const [loading, setLoading] = useState(false);

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
        {mockProjects.map((project) => (
          <div key={project.id} className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-medium">{project.name}</h2>
                  <div className="text-sm text-gray-500 mt-1">
                    Token: {project.token}
                  </div>
                </div>
                <div className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-sm rounded-md">
                  {project.price}
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
        ))}
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
