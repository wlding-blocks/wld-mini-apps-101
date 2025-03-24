"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { missions, type Mission } from "@/lib/data"
import { verifyOnchainActivity, generateMockActivity } from "@/lib/onchain"
import { Clock, CheckCircle, Trophy, Coins, Calendar, ArrowRight } from "lucide-react"
import { Button } from "@worldcoin/mini-apps-ui-kit-react"

// Group missions by category (difficulty level)
const groupedMissions: Record<string, Mission[]> = {
  "Learn & Earn": missions.filter((_: Mission, index: number) => index < 5),
  "On-Chain Missions": missions.filter((_: Mission, index: number) => index >= 5),
}

export default function MissionsPage() {
  const [claimedMissions, setClaimedMissions] = useState<string[]>([])
  const [missionProgress, setMissionProgress] = useState<Record<string, {
    isCompleted: boolean;
    progress: {
      current: number;
      required: number;
      percentage: number;
    };
    daysActive?: number;
  }>>({})
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState({
    title: "",
    description: "",
  })
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [activeCategory, setActiveCategory] = useState("All")
  const [userAddress, setUserAddress] = useState<string>("0x123...userAddress") // Mock user address
  const [isLoading, setIsLoading] = useState(true)

  // Function to load mission progress
  const loadMissionProgress = async () => {
    setIsLoading(true)
    const progressData: Record<string, any> = {}
    
    // Verify on-chain activity for all missions with on-chain verification
    for (const mission of missions) {
      if (mission.onchainVerification) {
        const result = await verifyOnchainActivity(mission, userAddress)
        progressData[mission.id] = result
      }
    }
    
    setMissionProgress(progressData)
    setIsLoading(false)
  }

  // Update progress stats when claimed missions change
  useEffect(() => {
    // Calculate completion percentage
    const percentage = (claimedMissions.length / missions.length) * 100
    setCompletionPercentage(Math.round(percentage))
    
    // Load mission progress on initial load
    loadMissionProgress()
  }, [claimedMissions, userAddress])

  const showToast = (title: string, description: string) => {
    setToastMessage({ title, description })
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3000)
  }

  const handleClaimReward = (mission: Mission) => {
    if (claimedMissions.includes(mission.id)) return

    // If it's an on-chain mission, check if it's completed first
    if (mission.onchainVerification) {
      const progress = missionProgress[mission.id]
      if (!progress || !progress.isCompleted) {
        showToast("Mission incomplete", "Complete the on-chain requirements first")
        return
      }
    }

    setClaimedMissions([...claimedMissions, mission.id])
    showToast("Reward claimed!", `You've successfully claimed ${mission.reward}`)
  }

  // Simulate generating more mock activity data for testing
  const handleGenerateMockActivity = () => {
    if (missions[5]?.onchainVerification?.tokenAddress) {
      generateMockActivity(missions[5].onchainVerification.tokenAddress, userAddress)
      loadMissionProgress()
      showToast("Data generated", "Generated mock ORO token claim data")
    }
  }

  // Categories with all missions
  const categories = ["All", ...Object.keys(groupedMissions)]

  // Get missions to display based on active category
  const getMissionsToDisplay = (): Mission[] => {
    if (activeCategory === "All") {
      return missions
    }
    return groupedMissions[activeCategory as keyof typeof groupedMissions] || []
  }

  const missionsToDisplay = getMissionsToDisplay()

  return (
    <main className="flex flex-col min-h-screen bg-gray-50 pb-24">
      {/* Toast notification */}
      {toastVisible && (
        <div className="fixed top-5 left-0 right-0 mx-auto w-80 bg-white rounded-lg shadow-lg p-4 z-50 animate-bounce">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">{toastMessage.title}</p>
              <p className="mt-1 text-sm text-gray-500">{toastMessage.description}</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto w-full px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Complete <span className="text-blue-600">missions</span> to earn <span className="text-blue-600">rewards</span>
          </h1>
          <p className="text-gray-600 mb-4">Engage with the World ecosystem and earn rewards</p>
          
          {/* Mock data generator (for demo purposes) */}
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleGenerateMockActivity}
            className="mt-4"
          >
            Generate Mock ORO Claims
          </Button>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Your Progress</h2>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full mr-3">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Missions Completed</p>
                <p className="text-xl font-bold">{claimedMissions.length} / {missions.length}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full mr-3">
                <Coins className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Rewards Claimed</p>
                <p className="text-xl font-bold">{claimedMissions.reduce((total, id) => {
                  const mission = missions.find(m => m.id === id);
                  return total + (mission?.rewardAmount || 0);
                }, 0)} {claimedMissions.length > 0 ? missions.find(m => m.id === claimedMissions[0])?.rewardToken : ""}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Missions Section */}
        <div className="grid grid-cols-1 gap-6">
          {missionsToDisplay.map((mission: Mission) => {
            const isClaimed = claimedMissions.includes(mission.id)
            const onchainProgress = mission.onchainVerification ? missionProgress[mission.id] : null
            
            // Calculate progress percentage
            let progressPercentage = isClaimed ? 100 : 0
            if (onchainProgress) {
              progressPercentage = onchainProgress.progress.percentage
            }

            return (
              <div
                key={mission.id}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Mission Image/Icon */}
                    <div className="w-full md:w-1/4 aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                      <div className="text-3xl font-bold text-white">
                        {mission.onchainVerification ? <Coins className="h-12 w-12" /> : mission.name.substring(0, 1)}
                      </div>
                    </div>

                    {/* Mission Content */}
                    <div className="w-full md:w-3/4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold">{mission.name}</h3>
                          <div className="flex items-center text-sm">
                            <span className={`px-3 py-1 rounded-full ${
                              isClaimed ? "bg-green-100 text-green-700" : 
                              onchainProgress?.isCompleted ? "bg-blue-100 text-blue-700" : 
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {isClaimed ? "Completed" : onchainProgress?.isCompleted ? "Ready to Claim" : "In Progress"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-500 text-sm mb-3">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{mission.timeRequired}</span>
                          {mission.onchainVerification?.requiredDays && (
                            <>
                              <span className="mx-2">•</span>
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{mission.onchainVerification.requiredDays} Days</span>
                            </>
                          )}
                        </div>
                        
                        <p className="text-gray-600 mb-4">{mission.description}</p>
                        
                        {/* On-chain verification details */}
                        {mission.onchainVerification && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <h4 className="font-medium text-gray-700 mb-2">On-chain Requirements:</h4>
                            <div className="flex flex-col space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  {mission.onchainVerification.action === "claim" ? "Token Claims" : "Actions"}: 
                                </span>
                                <span className="font-medium">
                                  {isLoading ? "Loading..." : `${onchainProgress?.progress.current || 0} / ${mission.onchainVerification.requiredCount}`}
                                </span>
                              </div>
                              
                              {mission.onchainVerification.requiredDays && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Days Active: </span>
                                  <span className="font-medium">
                                    {isLoading ? "Loading..." : `${onchainProgress?.daysActive || 0} / ${mission.onchainVerification.requiredDays}`}
                                  </span>
                                </div>
                              )}
                              
                              {/* Progress bar */}
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <div 
                                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                                  style={{ width: `${isLoading ? 0 : progressPercentage}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center bg-blue-50 px-4 py-2 rounded-lg">
                          <Coins className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="font-medium text-blue-800">{mission.reward}</span>
                        </div>

                        <button
                          onClick={() => handleClaimReward(mission)}
                          disabled={isClaimed || (mission.onchainVerification && (!onchainProgress || !onchainProgress.isCompleted))}
                          className={`px-6 py-3 rounded-lg text-sm font-medium transition-colors flex items-center ${
                            isClaimed
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : mission.onchainVerification && (!onchainProgress || !onchainProgress.isCompleted)
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {isClaimed ? "Claimed" : "Claim Rewards"}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-2 shadow-lg">
        <div className="flex justify-around max-w-xs mx-auto">
          <Link href="/" className="flex-1 flex flex-col items-center py-3">
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
                <path d="M4 11v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8" />
                <path d="M4 11V8a1 1 0 0 1 .4-.8l6.6-5.2a1 1 0 0 1 1.2 0l6.6 5.2a1 1 0 0 1 .4.8v3" />
              </svg>
            </div>
            <span className="text-xs">Projects</span>
          </Link>

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
            <span className="text-xs font-medium">Missions</span>
          </button>
        </div>
      </div>
    </main>
  )
}

