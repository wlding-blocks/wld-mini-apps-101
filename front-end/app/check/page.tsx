"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CheckPage() {
  const [txHash, setTxHash] = useState("0xd13cddfa361b0ca0085e84e1cbc5848ea4a286e77f44d059a94520f01c955acb");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function querySubgraph(query: string) {
    try {
      const response = await fetch('http://localhost:8000/subgraphs/name/oro-token-claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });
      return await response.json();
    } catch (err) {
      console.error("Error querying subgraph:", err);
      throw err;
    }
  }

  async function checkTransaction() {
    setLoading(true);
    setError(null);
    try {
      const query = `{
        tokenClaims(where: {transactionHash: "${txHash}"}) {
          id
          claimant {
            id
            address
            totalClaims
          }
          amount
          timestamp
          transactionHash
        }
      }`;
      
      const data = await querySubgraph(query);
      setResult(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function checkStats() {
    setLoading(true);
    setError(null);
    try {
      const query = `{
        _meta {
          block {
            number
          }
        }
        tokenStats(id: "oro_token_stats") {
          totalClaims
          uniqueClaimants
          totalAmountClaimed
        }
        users {
          id
          address
          totalClaims
          uniqueDays
        }
      }`;
      
      const data = await querySubgraph(query);
      setResult(data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Subgraph Transaction Checker</h1>
      
      <div className="mb-6">
        <Link href="/missions" className="text-blue-500 hover:underline">
          Back to Missions
        </Link>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Transaction Hash:</label>
        <input 
          type="text" 
          value={txHash} 
          onChange={(e) => setTxHash(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded text-black"
        />
      </div>

      <div className="flex space-x-4 mb-6">
        <button 
          onClick={checkTransaction}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Checking..." : "Check Transaction"}
        </button>
        <button 
          onClick={checkStats}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Check Subgraph Stats"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-2">Result:</h2>
          <pre className="bg-gray-800 text-white p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 