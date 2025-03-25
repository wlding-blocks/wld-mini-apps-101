#!/usr/bin/env node

// This script queries the subgraph for mint data

// Sample addresses to query
const ADDRESSES = [
  '0x006a9300277233910900000000e24b9c5b8fc8c0',
  '0x6b2b6a8a6c41467172595454791eb88a8ac54ee0'
];

async function fetchUserMintData(address) {
  console.log(`Fetching mint data for address: ${address}`);
  
  const query = `{
    user(id: "${address.toLowerCase()}") {
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
  
  try {
    const response = await fetch('http://localhost:8000/subgraphs/name/oro-token-claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    
    const data = await response.json();
    
    if (data.errors) {
      console.error(`Error querying for address ${address}:`, data.errors);
      return null;
    }
    
    return data.data.user;
  } catch (error) {
    console.error(`Error fetching data for address ${address}:`, error);
    return null;
  }
}

async function fetchGlobalMintStats() {
  console.log('Fetching global mint statistics...');
  
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
  
  try {
    const response = await fetch('http://localhost:8000/subgraphs/name/oro-token-claims', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    
    const data = await response.json();
    
    if (data.errors) {
      console.error('Error querying global stats:', data.errors);
      return null;
    }
    
    // Calculate total tokens minted
    let totalMinted = 0n;
    const claims = data.data?.tokenClaims || [];
    
    claims.forEach((claim) => {
      totalMinted += BigInt(claim.amount);
    });
    
    return {
      totalMinted: totalMinted.toString(),
      uniqueUsers: data.data?.users?.length || 0,
      totalClaims: claims.length
    };
  } catch (error) {
    console.error('Error fetching global stats:', error);
    return null;
  }
}

// Format mint amounts to ORO tokens
function formatOROAmount(amount) {
  const bigAmount = BigInt(amount);
  const divisor = 10n ** 18n;
  const whole = bigAmount / divisor;
  const fraction = (bigAmount * 100n / divisor) % 100n;
  
  return `${whole}.${fraction.toString().padStart(2, '0')} ORO`;
}

async function main() {
  try {
    // Get global stats
    const globalStats = await fetchGlobalMintStats();
    
    if (globalStats) {
      console.log('\n=== GLOBAL MINT STATISTICS ===');
      console.log(`Total tokens minted: ${formatOROAmount(globalStats.totalMinted)}`);
      console.log(`Unique users: ${globalStats.uniqueUsers}`);
      console.log(`Total claim transactions: ${globalStats.totalClaims}`);
    }
    
    // Query each address
    for (const address of ADDRESSES) {
      const userData = await fetchUserMintData(address);
      
      if (userData) {
        console.log(`\n=== USER: ${address} ===`);
        console.log(`Total claims: ${userData.totalClaims}`);
        
        if (userData.firstClaimTimestamp) {
          const firstDate = new Date(parseInt(userData.firstClaimTimestamp) * 1000);
          console.log(`First claim: ${firstDate.toLocaleString()}`);
        }
        
        if (userData.lastClaimTimestamp) {
          const lastDate = new Date(parseInt(userData.lastClaimTimestamp) * 1000);
          console.log(`Last claim: ${lastDate.toLocaleString()}`);
        }
        
        // Calculate total minted (excluding amount 1)
        let totalMinted = 0n;
        if (userData.claims && userData.claims.length > 0) {
          userData.claims.forEach(claim => {
            if (claim.amount !== "1") {
              totalMinted += BigInt(claim.amount);
            }
          });
          
          console.log(`Total minted: ${formatOROAmount(totalMinted)}`);
          console.log(`Recent claims:`);
          
          // Show the most recent 3 claims
          userData.claims.slice(0, 3).forEach(claim => {
            const date = new Date(parseInt(claim.timestamp) * 1000);
            console.log(`- ${formatOROAmount(claim.amount)} at ${date.toLocaleString()} (Block: ${claim.blockNumber})`);
          });
        }
      } else {
        console.log(`\n=== USER: ${address} ===`);
        console.log('No data found for this user');
      }
    }
  } catch (error) {
    console.error('Error running script:', error);
  }
}

main(); 