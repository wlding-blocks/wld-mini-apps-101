"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { missions } from "@/lib/data";

// SVG icons as components
const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-green-600"
  >
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

const GiftIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-6 w-6 text-blue-500"
  >
    <path d="M20 12v10H4V12"></path>
    <path d="M2 7h20v5H2z"></path>
    <path d="M12 22V7"></path>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
  </svg>
);

const ClockIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3 w-3 mr-1"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const TrophyIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 text-amber-500"
  >
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
    <path d="M4 22h16"></path>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
  </svg>
);

// Group missions by category (difficulty level)
const groupedMissions = {
  Beginner: missions.filter((_, index) => index < 2),
  Intermediate: missions.filter((_, index) => index >= 2 && index < 4),
  Advanced: missions.filter((_, index) => index === 4),
};

export default function MissionsPage() {
  const [claimedMissions, setClaimedMissions] = useState<string[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState({
    title: "",
    description: "",
  });
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);
  const [activeCategory, setActiveCategory] = useState("Beginner");

  // Update progress stats when claimed missions change
  useEffect(() => {
    // Calculate completion percentage
    const percentage = (claimedMissions.length / missions.length) * 100;
    setCompletionPercentage(Math.round(percentage));

    // Calculate total rewards
    let total = 0;
    claimedMissions.forEach((id) => {
      const mission = missions.find((m) => m.id === id);
      if (mission) {
        const rewardAmount = parseInt(mission.reward.split(" ")[0]);
        total += rewardAmount;
      }
    });
    setTotalRewards(total);
  }, [claimedMissions]);

  const showToast = (title: string, description: string) => {
    setToastMessage({ title, description });
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleClaimReward = (missionId: string, reward: string) => {
    if (claimedMissions.includes(missionId)) return;

    setClaimedMissions([...claimedMissions, missionId]);
    showToast("Reward claimed!", `You've successfully claimed ${reward}`);
  };

  return (
    <main className="flex flex-col min-h-screen pb-24 bg-gradient-to-b from-blue-50 to-cyan-50">
      {/* Toast notification */}
      {toastVisible && (
        <div className="fixed top-5 left-0 right-0 mx-auto w-80 bg-white rounded-lg shadow-lg p-4 z-50 animate-bounce">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <CheckIcon />
            </div>
            <div className="ml-3 w-0 flex-1">
              <p className="text-sm font-medium text-gray-900">
                {toastMessage.title}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {toastMessage.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-b-3xl shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-2">Missions</h1>
        <p className="text-white/80 text-sm mb-4">
          Complete missions to earn rewards
        </p>

        {/* Progress summary */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 max-w-xs mx-auto mt-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-white/80">Mission Progress</span>
            <span className="text-xs font-medium">{completionPercentage}%</span>
          </div>
          <div className="h-2 w-full bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-3">
            <TrophyIcon />
            <p className="text-sm font-bold">{totalRewards} WLD Earned</p>
          </div>
        </div>
      </div>

      {/* Category navigation */}
      <div className="px-4 pt-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 max-w-sm mx-auto">
          {Object.keys(groupedMissions).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                activeCategory === category
                  ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium"
                  : "bg-white text-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="grid gap-4 mt-2 max-w-sm mx-auto">
          {groupedMissions[activeCategory as keyof typeof groupedMissions].map(
            (mission) => {
              const isClaimed = claimedMissions.includes(mission.id);

              return (
                <div
                  key={mission.id}
                  className={`bg-white rounded-lg overflow-hidden border-0 shadow-lg transition-all duration-300 ease-in-out ${
                    isClaimed ? "scale-100" : "hover:scale-[1.02]"
                  }`}
                >
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                  <div className="p-4 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className={`p-3 rounded-full transition-colors duration-300 ${
                          isClaimed
                            ? "bg-green-100"
                            : "bg-gradient-to-r from-blue-500/20 to-cyan-500/20"
                        }`}
                      >
                        {isClaimed ? <CheckIcon /> : <GiftIcon />}
                      </div>
                      <div>
                        <h2 className="font-semibold text-lg">
                          {mission.name}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {mission.description}
                        </p>

                        <div className="flex items-center justify-center gap-3 mt-3">
                          <div className="flex items-center text-sm text-gray-500">
                            <ClockIcon />
                            {mission.timeRequired}
                          </div>
                          <div className="text-sm font-medium px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                            {mission.reward}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <button
                      className={`w-full py-3 rounded-lg transition-all duration-300 ${
                        isClaimed
                          ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                          : "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transform active:scale-[0.98]"
                      }`}
                      disabled={isClaimed}
                      onClick={() =>
                        handleClaimReward(mission.id, mission.reward)
                      }
                    >
                      {isClaimed ? "Claimed ✓" : "Claim Reward"}
                    </button>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Improved Tab Bar */}
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

          <button
            className="flex-1 flex flex-col items-center py-3 relative"
            disabled
          >
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
  );
}
