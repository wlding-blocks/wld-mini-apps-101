"use client"
import { useState, useEffect } from "react"
import { missions, type Mission } from "@/lib/data"
import { verifyOnchainActivity, generateMockActivity } from "@/lib/onchain"
import { 
  Clock, 
  CheckCircle, 
  Trophy, 
  Coins, 
  Calendar, 
  ArrowRight, 
  ChevronRight,
  Award,
  TrendingUp
} from "lucide-react"
import { Button } from "@worldcoin/mini-apps-ui-kit-react"
import { WalletHeader } from "@/components/WalletHeader"
import { useWallet } from "@/context/WalletContext"
import { motion, AnimatePresence } from "framer-motion"

// Group missions by category (difficulty level)
const groupedMissions: Record<string, Mission[]> = {
  "Learn & Earn": missions.filter((_: Mission, index: number) => index < 5),
  "On-Chain Missions": missions.filter((_: Mission, index: number) => index >= 5),
}

export default function MissionsPage() {
  const { user } = useWallet()
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
  const [activeCategory, setActiveCategory] = useState("All")
  const [userAddress, setUserAddress] = useState<string>("0x6b2B6A8A6c41467172595454791EB88A8Ac54eE0") // Set to the specific wallet address
  const [isLoading, setIsLoading] = useState(true)
  const [expandedMission, setExpandedMission] = useState<string | null>(null)
  
  // Function to load mission progress
  const loadMissionProgress = async () => {
    setIsLoading(true)
    const progressData: Record<string, any> = {}
    
    // Use connected wallet address if available
    const addressToUse = user?.walletAddress || userAddress
    
    // Verify on-chain activity for all missions with on-chain verification
    for (const mission of missions) {
      if (mission.onchainVerification) {
        const result = await verifyOnchainActivity(mission, addressToUse)
        progressData[mission.id] = result
      }
    }
    
    setMissionProgress(progressData)
    setIsLoading(false)
  }

  // Update progress stats when claimed missions change or wallet connects
  useEffect(() => {
    // Load mission progress on initial load or when wallet changes
    loadMissionProgress()
  }, [claimedMissions, userAddress, user])

  // Set user address when wallet connects
  useEffect(() => {
    if (user?.walletAddress) {
      setUserAddress(user.walletAddress)
    }
  }, [user])

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
    showToast("Reward claimed!", `You&apos;ve successfully claimed ${mission.reward}`)
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

  const toggleExpandMission = (missionId: string) => {
    if (expandedMission === missionId) {
      setExpandedMission(null);
    } else {
      setExpandedMission(missionId);
    }
  };

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      <WalletHeader />
      
      {/* Toast notification */}
      <AnimatePresence>
        {toastVisible && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 left-0 right-0 mx-auto w-80 bg-white rounded-lg shadow-lg p-4 z-50"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{toastMessage.title}</p>
                <p className="mt-1 text-sm text-gray-500">{toastMessage.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="max-w-md mx-auto w-full px-4 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Missions</h1>
          <p className="text-sm text-gray-600">Complete tasks to earn rewards</p>
        </div>

        {/* User Stats Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Your Stats</h2>
            <div className="flex items-center bg-blue-100 px-3 py-1 rounded-lg">
              <Coins className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">
                {isLoading ? (
                  "Loading..."
                ) : (
                  <span>
                    {Object.values(missionProgress).find(m => m?.progress?.current > 0)?.progress.current || 0} Mints
                  </span>
                )}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-500">Address</span>
              <span className="font-mono text-xs truncate max-w-[180px]">{userAddress}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Completed</span>
              <span className="font-medium">{claimedMissions.length} / {missions.length}</span>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="overflow-x-auto mb-6 -mx-1 px-1">
          <div className="flex space-x-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                  activeCategory === category 
                    ? "bg-blue-600 text-white font-medium" 
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Missions Section */}
        <div className="space-y-4">
          {missionsToDisplay.map((mission: Mission) => {
            const isClaimed = claimedMissions.includes(mission.id)
            const onchainProgress = mission.onchainVerification ? missionProgress[mission.id] : null
            const isExpanded = expandedMission === mission.id
            
            // Calculate progress percentage
            let progressPercentage = isClaimed ? 100 : 0
            if (onchainProgress) {
              progressPercentage = onchainProgress.progress.percentage
            }

            return (
              <motion.div
                key={mission.id}
                layout
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Mission Header - Always visible */}
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpandMission(mission.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        isClaimed 
                          ? "bg-green-100" 
                          : onchainProgress?.isCompleted 
                            ? "bg-blue-100" 
                            : "bg-gray-100"
                      }`}>
                        {isClaimed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : mission.onchainVerification ? (
                          <Coins className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Award className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-bold">{mission.name}</h3>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{mission.timeRequired}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className={`px-3 py-1 rounded-full text-xs mr-2 ${
                        isClaimed ? "bg-green-100 text-green-700" : 
                        onchainProgress?.isCompleted ? "bg-blue-100 text-blue-700" : 
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {isClaimed ? "Completed" : onchainProgress?.isCompleted ? "Ready" : "In Progress"}
                      </div>
                      <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {(mission.onchainVerification || isClaimed) && (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${isClaimed ? 'bg-green-600' : 'bg-blue-600'}`}
                        style={{ width: `${isLoading ? 0 : progressPercentage}%` }}
                      ></div>
                    </div>
                  )}
                </div>
                
                {/* Mission Details - Only visible when expanded */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-gray-100 overflow-hidden"
                    >
                      <div className="p-4">
                        <p className="text-sm text-gray-600 mb-4">{mission.description}</p>
                        
                        {/* On-chain verification details */}
                        {mission.onchainVerification && (
                          <div className="bg-gray-50 p-3 rounded-lg mb-4">
                            <h4 className="font-medium text-gray-700 mb-2">On-chain Requirements:</h4>
                            <div className="flex flex-col space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">
                                  {mission.onchainVerification.action === "claim" ? "Token Claims" : "Actions"}: 
                                </span>
                                <span className="font-medium text-sm">
                                  {isLoading ? "Loading..." : `${onchainProgress?.progress.current || 0} / ${mission.onchainVerification.requiredCount}`}
                                </span>
                              </div>
                              
                              {mission.onchainVerification.requiredDays && (
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-gray-600">Days Active: </span>
                                  <span className="font-medium text-sm">
                                    {isLoading ? "Loading..." : `${onchainProgress?.daysActive || 0} / ${mission.onchainVerification.requiredDays}`}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center bg-blue-50 px-3 py-2 rounded-lg">
                            <Trophy className="h-4 w-4 text-blue-600 mr-2" />
                            <span className="font-medium text-sm text-blue-800">{mission.reward}</span>
                          </div>

                          <Button
                            onClick={() => handleClaimReward(mission)}
                            disabled={isClaimed || (mission.onchainVerification && (!onchainProgress || !onchainProgress.isCompleted))}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center ${
                              isClaimed
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : mission.onchainVerification && (!onchainProgress || !onchainProgress.isCompleted)
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                          >
                            {isClaimed ? "Claimed" : "Claim"}
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </main>
  )
}

