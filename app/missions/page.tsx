"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { missions, type Mission } from "@/lib/data"
import { Clock, CheckCircle } from "lucide-react"

// Group missions by category (difficulty level)
const groupedMissions: Record<string, Mission[]> = {
  Beginner: missions.filter((_: Mission, index: number) => index < 2),
  Intermediate: missions.filter((_: Mission, index: number) => index >= 2 && index < 4),
  Advanced: missions.filter((_: Mission, index: number) => index === 4),
}

export default function MissionsPage() {
  const [claimedMissions, setClaimedMissions] = useState<string[]>([])
  const [toastVisible, setToastVisible] = useState(false)
  const [toastMessage, setToastMessage] = useState({
    title: "",
    description: "",
  })
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [activeCategory, setActiveCategory] = useState("All")

  // Update progress stats when claimed missions change
  useEffect(() => {
    // Calculate completion percentage
    const percentage = (claimedMissions.length / missions.length) * 100
    setCompletionPercentage(Math.round(percentage))
  }, [claimedMissions])

  const showToast = (title: string, description: string) => {
    setToastMessage({ title, description })
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3000)
  }

  const handleClaimReward = (missionId: string, reward: string) => {
    if (claimedMissions.includes(missionId)) return

    setClaimedMissions([...claimedMissions, missionId])
    showToast("Reward claimed!", `You've successfully claimed ${reward}`)
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
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2">
            <span className="text-gray-400">Discover</span> <span className="text-gray-900">missions</span>
          </h1>
          <h2 className="text-5xl font-bold mb-8">
            <span className="text-gray-900">to</span> <span className="text-gray-400">earn</span>{" "}
            <span className="text-gray-400">Rewards</span>
          </h2>
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
            const completionText = isClaimed ? "100%" : "0%"

            return (
              <div
                key={mission.id}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Mission Image/Icon */}
                    <div className="w-full md:w-1/3 aspect-video md:aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-cyan-100 to-blue-400 flex items-center justify-center">
                      <div className="text-3xl font-bold text-white">{mission.name.substring(0, 1)}</div>
                    </div>

                    {/* Mission Content */}
                    <div className="w-full md:w-2/3 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{mission.name}</h3>
                        <div className="flex items-center text-gray-500 mb-4">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{mission.timeRequired}</span>
                          <span className="mx-2">•</span>
                          <span>{Number.parseInt(mission.id) + 1} Lessons</span>
                        </div>
                        <p className="text-gray-600 mb-6">{mission.description}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="relative w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                          <div className="absolute inset-0 rounded-full">
                            <svg width="100%" height="100%" viewBox="0 0 100 100">
                              <circle cx="50" cy="50" r="45" fill="none" stroke="#e6e6e6" strokeWidth="10" />
                              {isClaimed && (
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="45"
                                  fill="none"
                                  stroke="#3b82f6"
                                  strokeWidth="10"
                                  strokeDasharray="283"
                                  strokeDashoffset="0"
                                  transform="rotate(-90 50 50)"
                                />
                              )}
                            </svg>
                          </div>
                          <span className="text-xl font-bold">{completionText}</span>
                        </div>

                        <button
                          onClick={() => handleClaimReward(mission.id, mission.reward)}
                          disabled={isClaimed}
                          className={`px-6 py-3 rounded-full text-sm font-medium transition-colors ${
                            isClaimed
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {isClaimed ? "Completed" : "Claim Rewards"}
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

