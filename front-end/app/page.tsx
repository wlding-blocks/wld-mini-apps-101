"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { ExternalLink, Sparkles, TrendingUp } from "lucide-react"
import { getTokensPrices } from "./utils/getPriceData"

// Define project type
interface Project {
  id: string
  name: string
  description: string
  tokenSymbol: string
  tokenIcon: string
  tokenPrice: number
  tokenAmount: number
  tokenAddress: string
  projectUrl: string
}

// Define top gainer type
interface TopGainer {
  symbol: string
  change: number
  price: number
}

// Helper function to format price with appropriate decimal places
const formatPrice = (price: number): string => {
  if (price === 0) return "0"
  if (price < 0.001) return price.toFixed(6) // Use 6 decimal places for very small numbers
  if (price < 0.01) return price.toFixed(5)
  if (price < 1) return price.toFixed(4)
  if (price < 10) return price.toFixed(3)
  if (price < 1000) return price.toFixed(2)
  return price.toLocaleString()
}

// Helper function to format total values with more precision
const formatTotalValue = (value: number): string => {
  if (value === 0) return "0"
  if (value < 0.00000001) return value.toExponential(4)
  if (value < 1) return value.toFixed(8)
  if (value < 1000) return value.toFixed(2)
  return value.toLocaleString()
}

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<Project[]>([])
  const [tokenPrices, setTokenPrices] = useState<{ [key: string]: any }>({})
  const [topGainer, setTopGainer] = useState<TopGainer | null>(null)

  // Calculate totals for the summary - using real-time prices when available
  const totalValue = projects.reduce((sum, project) => {
    const realTimePrice =
      project.tokenAddress && tokenPrices[project.tokenAddress]?.price
        ? Number(tokenPrices[project.tokenAddress].price)
        : project.tokenPrice
    return sum + realTimePrice * project.tokenAmount
  }, 0)

  const totalTokens = projects.length

  // Load projects from JSON file
  useEffect(() => {
    async function loadProjects() {
      try {
        const response = await fetch("/data/projects.json")
        const projectsData = await response.json()
        setProjects(projectsData)
      } catch (error) {
        console.error("Error loading projects:", error)
      }
    }

    loadProjects()
  }, [])

  // Find the top daily gainer when prices are updated
  useEffect(() => {
    if (projects.length === 0 || Object.keys(tokenPrices).length === 0) return

    let bestProject: TopGainer | null = null
    let highestChange = Number.NEGATIVE_INFINITY

    projects.forEach((project) => {
      if (project.tokenAddress && tokenPrices[project.tokenAddress]?.priceChange24h) {
        const change = Number(tokenPrices[project.tokenAddress].priceChange24h)
        if (change > highestChange) {
          highestChange = change
          bestProject = {
            symbol: project.tokenSymbol,
            change: change,
            price: tokenPrices[project.tokenAddress].price
              ? Number(tokenPrices[project.tokenAddress].price)
              : project.tokenPrice,
          }
        }
      }
    })

    setTopGainer(bestProject)
  }, [projects, tokenPrices])

  // Fetch token prices
  useEffect(() => {
    if (projects.length === 0) return

    const fetchPrices = async () => {
      try {
        setLoading(true)
        const tokenAddresses = projects.filter((project) => project.tokenAddress).map((project) => project.tokenAddress)

        console.log("Fetching prices for:", tokenAddresses)
        const prices = await getTokensPrices(tokenAddresses)
        console.log("Prices", prices)
        setTokenPrices(prices)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching prices:", error)
        setLoading(false)
      }
    }

    fetchPrices()

    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000)
    return () => clearInterval(interval)
  }, [projects])

  // If projects are still loading
  if (projects.length === 0) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg">Loading projects...</p>
      </main>
    )
  }

  return (
    <main className="flex flex-col min-h-screen pb-24 bg-gray-50">
      {/* Header Section */}
      <div className="text-center py-6 px-4">
        <h1 className="text-3xl font-bold mb-1">
          <span className="text-gray-400">Discover</span> <span className="text-gray-900">projects</span>
        </h1>
        <h2 className="text-3xl font-bold mb-4">
          <span className="text-gray-900">to</span> <span className="text-gray-400">earn</span>{" "}
          <span className="text-gray-400">tokens</span>
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4">
              <div className="flex items-center gap-4">
                {/* Stats Icon */}
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-100 to-blue-400 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>

                {/* Stats Content */}
                <div className="flex-1">
                  <h3 className="text-base font-bold">Portfolio Value</h3>
                  <p className="text-xl font-bold text-blue-600">${formatTotalValue(totalValue)}</p>
                  <p className="text-xs text-gray-500">Across {totalTokens} different projects</p>
                </div>
              </div>
            </div>
          </div>

          {topGainer && !loading && (
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="p-4">
                <div className="flex items-center gap-4">
                  {/* Gainer Icon */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-green-100 to-emerald-400 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>

                  {/* Gainer Content */}
                  <div className="flex-1">
                    <h3 className="text-base font-bold">Top Gainer (24h)</h3>
                    <p className="text-xl font-bold text-green-600">
                      {topGainer.symbol} +{topGainer.change.toFixed(2)}%
                    </p>
                    <p className="text-xs text-gray-500">Price: ${formatPrice(topGainer.price)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Projects Section */}
      <div className="px-4 mb-8">
        <h2 className="text-2xl font-bold mb-4 text-center">Available Projects</h2>

        <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto">
          {projects.map((project, index) => {
            // Get real-time price if available, otherwise use the hardcoded price
            const priceData = project.tokenAddress ? tokenPrices[project.tokenAddress] : null
            const currentPrice = priceData?.price ? Number(priceData.price) : project.tokenPrice
            const priceChange = priceData?.priceChange24h
            const chainId = priceData?.chainId
            const dexId = priceData?.dexId

            return (
              <div
                key={project.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-blue-400 flex items-center justify-center">
                      <img
                        src={project.tokenIcon || "/placeholder.svg"}
                        alt={`${project.tokenSymbol} icon`}
                        className="w-7 h-7"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{project.name}</h3>
                      <p className="text-xs text-gray-500">{project.tokenSymbol}</p>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-3 text-sm">{project.description}</p>

                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Current Price</span>
                      <div className="flex items-center">
                        {loading ? (
                          <span className="text-xs">Loading...</span>
                        ) : (
                          <>
                            <span className="text-sm font-medium">${formatPrice(currentPrice)}</span>
                            {priceChange !== undefined && (
                              <span
                                className={`text-xs ml-1 ${Number(priceChange) >= 0 ? "text-green-600" : "text-red-500"}`}
                              >
                                ({priceChange > 0 ? "+" : ""}
                                {Number(priceChange).toFixed(2)}%)
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-500">Amount</span>
                      <span className="text-sm font-medium">
                        {project.tokenAmount.toLocaleString()} {project.tokenSymbol}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Value</span>
                      <span className="text-sm font-bold text-blue-600">
                        ${formatTotalValue(currentPrice * project.tokenAmount)}
                      </span>
                    </div>
                  </div>

                  <a
                    href={project.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-center text-sm font-medium transition-colors"
                  >
                    Visit Project <ExternalLink className="inline-block ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 shadow-lg">
        <div className="flex justify-around max-w-xs mx-auto">
          <button className="flex-1 flex flex-col items-center py-3 relative" disabled>
            <div className="absolute -top-3 w-12 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
            <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-1 text-white shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 11v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8" />
                <path d="M4 11V8a1 1 0 0 1 .4-.8l6.6-5.2a1 1 0 0 1 1.2 0l6.6 5.2a1 1 0 0 1 .4.8v3" />
              </svg>
            </div>
            <span className="text-xs font-medium">Projects</span>
          </button>

          <Link href="/missions" className="flex-1 flex flex-col items-center py-3">
            <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mb-1 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                <path d="M12 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                <path d="M20 12a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
                <path d="M4 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                <path d="M16 12h-4" />
                <path d="M4 12h4" />
                <path d="M12 16v-4" />
                <path d="M12 4v4" />
              </svg>
            </div>
            <span className="text-xs">Missions</span>
          </Link>
        </div>
      </div>
    </main>
  )
}

