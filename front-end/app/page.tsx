"use client"
import { useEffect, useState } from "react"
import { Clock, Sparkles, TrendingUp, TrendingDown, Wallet, BarChart3, Coins, ArrowUpRight } from "lucide-react"
import { getTokensPrices } from "./utils/getPriceData"
import { motion } from "framer-motion"

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
  const [activeTab, setActiveTab] = useState<"holdings" | "trends">("trends")

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
        <div className="flex flex-col items-center justify-center p-8">
          <div className="w-12 h-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading projects...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      {/* <WalletHeader /> */}

      {/* Main Container with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-4 pb-6 max-w-md mx-auto w-full"
      >
        {/* Portfolio Value Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mt-6 mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-400 px-5 pt-6 pb-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-sm font-medium text-blue-100 mb-1">Portfolio Value</h2>
                <p className="text-3xl font-bold text-white">${formatTotalValue(totalValue)}</p>
                <p className="text-xs text-blue-100 mt-1">{totalTokens} Projects</p>
              </div>
              <div className="bg-white bg-opacity-20 p-3 rounded-full">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>

          {/* Tabs for Holdings/Trends */}
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === "holdings" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("holdings")}
            >
              Holdings
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === "trends" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("trends")}
            >
              Trends
            </button>
          </div>

          {/* Holdings Section */}
          {activeTab === "holdings" && (
            <div className="p-4">
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Holdings Feature</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Advanced portfolio tracking is coming soon! We&apos;re working hard to bring you comprehensive insights
                  into your crypto investments.
                </p>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-800 flex items-center justify-center">
                    <Clock className="w-4 h-4 mr-2" /> Stay tuned for updates
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Top Gainer Section */}
          {activeTab === "trends" && topGainer && !loading && (
            <div className="p-4">
              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">Top Gainer (24h)</h3>
                    <div className="flex items-center">
                      <p className="text-lg font-bold text-green-600">{topGainer.symbol}</p>
                      <span className="ml-2 text-sm font-medium text-green-600">+{topGainer.change.toFixed(2)}%</span>
                    </div>
                    <p className="text-xs text-gray-500">Price: ${formatPrice(topGainer.price)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Projects List */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Projects</h2>
            {activeTab === "holdings" && (
              <div className="text-sm text-gray-500 flex items-center">
                <BarChart3 className="w-4 h-4 mr-1" /> {projects.length} total
              </div>
            )}
          </div>

          <div className="space-y-3">
            {projects.map((project, index) => {
              // Get real-time price if available, otherwise use the hardcoded price
              const priceData = project.tokenAddress ? tokenPrices[project.tokenAddress] : null
              const currentPrice = priceData?.price ? Number(priceData.price) : project.tokenPrice
              const priceChange = priceData?.priceChange24h
              const totalValue = currentPrice * project.tokenAmount
              const isPriceUp = Number(priceChange || 0) >= 0

              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  <div className="p-4">
                    {/* Header section with icon, name and price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-blue-100 mr-3">
                          <img
                            src={project.tokenIcon || "/placeholder.svg"}
                            alt={`${project.tokenSymbol} icon`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold">{project.name}</h3>
                          <p className="text-sm text-gray-500">{project.tokenSymbol}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full ${isPriceUp ? 'bg-green-100' : 'bg-red-100'} flex items-center`}>
                        <span className={`text-sm font-medium ${isPriceUp ? 'text-green-700' : 'text-red-700'}`}>
                          ${formatPrice(currentPrice)} {isPriceUp ? '↗' : '↘'}
                        </span>
                      </div>
                    </div>

                    {/* Token information section */}
                    <div className="mt-4 bg-blue-50 rounded-xl p-4">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm text-blue-600 mb-1">You can earn</p>
                          <div className="flex items-center">
                            <Coins className="w-4 h-4 text-blue-600 mr-1" />
                            <p className="text-lg font-bold text-blue-900">
                              {project.tokenAmount} {project.tokenSymbol}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-blue-600 mb-1">Total value</p>
                          <p className="text-lg font-bold text-blue-900">
                            ${formatTotalValue(totalValue)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="mt-4 flex justify-end">
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 py-2 font-medium flex items-center"
                      >
                        Earn
                        <ArrowUpRight className="ml-1 h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </main>
  )
}

