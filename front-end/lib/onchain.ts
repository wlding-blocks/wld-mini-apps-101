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

// Keep mock data for fallback or testing purposes
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
  ]
};

/**
 * Query Alchemy subgraph to get user claim data
 * @param userAddress The user's wallet address
 * @returns User data from the subgraph including claim count and days active
 */
async function querySubgraph(userAddress: string) {
  try {
    // Normalize the address to lowercase
    const normalizedAddress = userAddress.toLowerCase();
    
    // GraphQL query to get user data 
    const query = `{
      user(id: "${normalizedAddress}") {
        totalClaims
        uniqueDays
        claims(first: 1, orderBy: timestamp, orderDirection: desc) {
          amount
          timestamp
          transactionHash
        }
      }
    }`;
    
    // Make the request to the local subgraph endpoint
    console.log(`Querying subgraph for address: ${normalizedAddress}`);
    const response = await fetch('http://localhost:8000/subgraphs/name/oro-token-claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    
    const data = await response.json();
    console.log("Subgraph response:", data);
    return data.data.user;
  } catch (error) {
    console.error("Error querying subgraph:", error);
    return null;
  }
}

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
  
  // Try to get data from the subgraph first
  const userData = await querySubgraph(userAddress);
  
  // If we have data from the subgraph, use it
  if (userData) {
    const current = parseInt(userData.totalClaims);
    const required = requiredCount || 0;
    const percentage = required > 0 ? Math.min(Math.round((current / required) * 100), 100) : 0;
    const daysActive = parseInt(userData.uniqueDays);
    
    // Determine if the mission is completed
    const isCompleted = current >= required && (!requiredDays || daysActive >= requiredDays);
    
    // Create lastActivity object if we have a claim
    let lastActivity: OnchainActivity | undefined = undefined;
    
    if (userData.claims && userData.claims.length > 0) {
      const claim = userData.claims[0];
      lastActivity = {
        address: userAddress,
        tokenAddress: tokenAddress || "",
        action: action || "claim",
        timestamp: parseInt(claim.timestamp) * 1000, // Convert to milliseconds
        transactionHash: claim.transactionHash
      };
    }
    
    return {
      isCompleted,
      progress: {
        current,
        required,
        percentage
      },
      lastActivity,
      daysActive
    };
  }
  
  // Fallback to mock data for development/testing
  console.warn("Falling back to mock data because subgraph query failed or returned no data");
  
  // Filter activities by user address and action type
  const activities = tokenAddress ? mockUserActivities[tokenAddress] || [] : [];
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

/**
 * Query transaction claims directly by transaction hash
 */
export async function queryTransactionData(txHash: string): Promise<any> {
  console.log(`Querying subgraph for transaction: ${txHash}`);
  
  try {
    const response = await fetch('http://localhost:8000/subgraphs/name/oro-token-claims', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `{
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
        }`
      })
    });

    const data = await response.json();
    console.log("Subgraph response for transaction:", data);
    return data;
  } catch (error) {
    console.error("Error querying subgraph for transaction:", error);
    return { error: String(error) };
  }
} 