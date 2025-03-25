# ORO Token Claims Subgraph

This subgraph indexes claim events for the ORO token contract. It tracks token claims, user activity, daily statistics, and overall token stats.

## Setup & Deployment

### Prerequisites

- Node.js and npm/yarn installed
- Access to an Alchemy account with Subgraphs feature
- The Graph CLI installed globally: `npm install -g @graphprotocol/graph-cli`

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   cd subgraph
   npm install
   ```

### Configuration

1. Update the `subgraph.yaml` file:

   - Ensure the contract address is correct
   - Set the appropriate start block
   - Update the network if needed (default is mainnet)

2. Update your deploy key in the package.json file:
   ```json
   "deploy": "graph deploy --node https://subgraphs.alchemy.com/api/subgraphs/deploy --deploy-key YOUR_ALCHEMY_DEPLOY_KEY alchemy/oro-token-claims"
   ```

### Deployment

1. Generate code from schema:

   ```
   npm run codegen
   ```

2. Build the subgraph:

   ```
   npm run build
   ```

3. Deploy to Alchemy:
   ```
   npm run deploy
   ```

## Queries

### Get Token Claims by Address

```graphql
{
  user(id: "0x123...userWalletAddress") {
    address
    totalClaims
    uniqueDays
    firstClaimTimestamp
    lastClaimTimestamp
    claims {
      amount
      timestamp
      transactionHash
    }
  }
}
```

### Get Daily Claim Statistics

```graphql
{
  dailyClaimStats(first: 10, orderBy: date, orderDirection: desc) {
    date
    totalClaims
    uniqueUsers
  }
}
```

### Get Overall Token Statistics

```graphql
{
  tokenStats(id: "oro_token_stats") {
    totalClaims
    uniqueClaimants
    totalAmountClaimed
  }
}
```

## Integration with WorldMini App

To check how many claims a specific user has made:

1. Get the user's wallet address from MiniKit:

   ```javascript
   const walletAddress = MiniKit.walletAddress || window.MiniKit?.walletAddress;
   ```

2. Query the subgraph with the user's address:

   ```javascript
   const queryUserClaims = async (address) => {
     const query = `{
       user(id: "${address.toLowerCase()}") {
         totalClaims
         uniqueDays
       }
     }`;

     const response = await fetch(
       "https://api.thegraph.com/subgraphs/name/alchemy/oro-token-claims",
       {
         method: "POST",
         headers: {
           "Content-Type": "application/json",
         },
         body: JSON.stringify({ query }),
       }
     );

     const data = await response.json();
     return data.data.user;
   };
   ```

3. Check if the user has met the mission requirements:
   ```javascript
   const checkMissionCompletion = async (
     address,
     requiredClaims,
     requiredDays
   ) => {
     const userData = await queryUserClaims(address);

     if (!userData)
       return {
         isCompleted: false,
         progress: { current: 0, required: requiredClaims, percentage: 0 },
       };

     const totalClaims = parseInt(userData.totalClaims);
     const uniqueDays = parseInt(userData.uniqueDays);

     return {
       isCompleted: totalClaims >= requiredClaims && uniqueDays >= requiredDays,
       progress: {
         current: totalClaims,
         required: requiredClaims,
         percentage: Math.min(
           Math.round((totalClaims / requiredClaims) * 100),
           100
         ),
       },
       daysActive: uniqueDays,
     };
   };
   ```
