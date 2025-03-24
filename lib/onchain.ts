import type { Mission } from './data';

interface OnchainActivity {
  address: string;
  tokenAddress: string;
  action: string;
  timestamp: number;
  transactionHash: string;
}

interface VerificationResult {
  isCompleted: boolean;
  progress: {
    current: number;
    required: number;
    percentage: number;
  };
  lastActivity?: OnchainActivity;
  daysActive?: number;
}

// Mock user activity data - in a real app, this would be fetched from an indexer or blockchain API
const mockUserActivities: Record<string, OnchainActivity[]> = {
  // ORO token address
  "0xF3F92A60e6004f3982F0FdE0d43602fC0a30a0dB": [
    {
      address: "0x123...userAddress", // This should be the connected user's address
      tokenAddress: "0xF3F92A60e6004f3982F0FdE0d43602fC0a30a0dB",
      action: "claim",
      timestamp: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 day ago
      transactionHash: "0xabc123..."
    },
    {
      address: "0x123...userAddress",
      tokenAddress: "0xF3F92A60e6004f3982F0FdE0d43602fC0a30a0dB",
      action: "claim",
      timestamp: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
      transactionHash: "0xdef456..."
    },
    // Add more mock activities as needed
  ]
};

/**
 * Verify if a user has completed the on-chain requirements for a mission
 * @param mission The mission to verify
 * @param userAddress The user's wallet address
 * @returns Verification result with completion status and progress
 */
export async function verifyOnchainActivity(mission: Mission, userAddress: string): Promise<VerificationResult> {
  if (!mission.onchainVerification) {
    return {
      isCompleted: false,
      progress: {
        current: 0,
        required: 0,
        percentage: 0
      }
    };
  }

  const { type, tokenAddress, requiredCount, requiredDays, action } = mission.onchainVerification;
  
  // In a real app, you would fetch this data from the blockchain or an indexer
  // For this demo, we're using mock data
  const activities = tokenAddress ? mockUserActivities[tokenAddress] || [] : [];
  
  // Filter activities by user address and action type
  const userActivities = activities.filter(act => 
    act.address.toLowerCase() === userAddress.toLowerCase() && 
    (!action || act.action === action)
  );
  
  // Sort activities by timestamp (newest first)
  const sortedActivities = [...userActivities].sort((a, b) => b.timestamp - a.timestamp);
  
  // Calculate progress
  const current = sortedActivities.length;
  const required = requiredCount || 0;
  const percentage = required > 0 ? Math.min(Math.round((current / required) * 100), 100) : 0;
  
  // Calculate days active (for missions that require activity over multiple days)
  let daysActive = 0;
  
  if (requiredDays && requiredDays > 0) {
    // Get unique days from timestamps
    const uniqueDays = new Set();
    sortedActivities.forEach(activity => {
      const date = new Date(activity.timestamp);
      const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      uniqueDays.add(dayKey);
    });
    daysActive = uniqueDays.size;
  }
  
  // Determine if the mission is completed
  const isCompleted = current >= required && (!requiredDays || daysActive >= requiredDays);
  
  return {
    isCompleted,
    progress: {
      current,
      required,
      percentage
    },
    lastActivity: sortedActivities[0],
    daysActive
  };
}

// Function to generate more mock activity data for testing (5 more claims)
export function generateMockActivity(tokenAddress: string, userAddress: string): void {
  if (!mockUserActivities[tokenAddress]) {
    mockUserActivities[tokenAddress] = [];
  }
  
  // Generate activity for the last 5 days
  for (let i = 3; i <= 7; i++) {
    mockUserActivities[tokenAddress].push({
      address: userAddress,
      tokenAddress,
      action: "claim",
      timestamp: Date.now() - (i * 24 * 60 * 60 * 1000), // i days ago
      transactionHash: `0x${Math.random().toString(16).substr(2, 40)}`
    });
  }
} 