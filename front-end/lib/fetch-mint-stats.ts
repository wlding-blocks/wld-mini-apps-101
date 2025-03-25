// import { BigInt } from "@graphprotocol/graph-ts";

/**
 * Fetches mint statistics for a specific address
 * @param address The Ethereum address to get mint stats for
 * @returns Object containing mint stats including total minted, count of mints, and first/last mint timestamps
 */
export async function fetchMintStats(address: string) {
  try {
    // Normalize the address to lowercase for consistent comparisons
    const normalizedAddress = address.toLowerCase();
    console.log(`Fetching mint stats for address: ${normalizedAddress}`);

    // GraphQL query to get user data and their claims
    const query = `{
      user(id: "${normalizedAddress}") {
        id
        address
        totalClaims
        firstClaimTimestamp
        lastClaimTimestamp
        claims(orderBy: timestamp, orderDirection: desc) {
          id
          amount
          timestamp
          blockNumber
          transactionHash
        }
      }
    }`;

    // Query the local subgraph
    const response = await fetch('http://localhost:8000/subgraphs/name/oro-token-claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error("Error querying the subgraph:", result.errors);
      throw new Error(result.errors[0].message);
    }

    const userData = result.data?.user;
    
    if (!userData) {
      return {
        address: normalizedAddress,
        totalMinted: "0",
        totalClaimCount: 0,
        firstClaimTimestamp: null,
        lastClaimTimestamp: null,
        claims: [],
        status: "No data found for this address"
      };
    }

    // Calculate total minted amount across all claims
    let totalMinted = BigInt(0);
    if (userData.claims && userData.claims.length > 0) {
      userData.claims.forEach((claim: any) => {
        // Skip test mints with amount of 1
        if (claim.amount !== "1") {
          totalMinted += BigInt(claim.amount);
        }
      });
    }

    return {
      address: userData.address,
      totalMinted: totalMinted.toString(),
      totalClaimCount: parseInt(userData.totalClaims || "0"),
      firstClaimTimestamp: userData.firstClaimTimestamp ? new Date(parseInt(userData.firstClaimTimestamp) * 1000).toISOString() : null,
      lastClaimTimestamp: userData.lastClaimTimestamp ? new Date(parseInt(userData.lastClaimTimestamp) * 1000).toISOString() : null,
      claims: userData.claims || [],
      status: "success"
    };
  } catch (error) {
    console.error("Error fetching mint stats:", error);
    return {
      address,
      totalMinted: "0",
      totalClaimCount: 0,
      firstClaimTimestamp: null,
      lastClaimTimestamp: null,
      claims: [],
      status: `Error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Fetches the total token amount minted across all users
 * @returns Object containing global mint statistics
 */
export async function fetchGlobalMintStats() {
  try {
    // GraphQL query to get global stats
    const query = `{
      tokenClaims(
        first: 1000, 
        where: { amount_not: "1" }
      ) {
        amount
      }
      users {
        id
        totalClaims
      }
    }`;

    // Query the local subgraph
    const response = await fetch('http://localhost:8000/subgraphs/name/oro-token-claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error("Error querying the subgraph:", result.errors);
      throw new Error(result.errors[0].message);
    }

    // Calculate total tokens minted
    let totalMinted = BigInt(0);
    const claims = result.data?.tokenClaims || [];
    
    claims.forEach((claim: any) => {
      totalMinted += BigInt(claim.amount);
    });

    return {
      totalMinted: totalMinted.toString(),
      uniqueUsers: result.data?.users?.length || 0,
      totalClaims: claims.length,
      status: "success"
    };
  } catch (error) {
    console.error("Error fetching global mint stats:", error);
    return {
      totalMinted: "0",
      uniqueUsers: 0,
      totalClaims: 0,
      status: `Error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
} 