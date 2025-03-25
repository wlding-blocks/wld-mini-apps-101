#!/bin/bash

# Set environment variables for World Chain
ETHEREUM_RPC_URL="https://worldchain-mainnet.g.alchemy.com/v2/HTnCRg0KxPt5aG7FCaMePEWGK1nRegjD"

echo "🌎 Deploying oro-token-claims subgraph to local Graph Node for World Chain..."
echo "=================================================="
echo "RPC URL: $ETHEREUM_RPC_URL"
echo "=================================================="

# Run codegen and build first
echo "📦 Generating types and building subgraph..."
npm run codegen
npm run build

# First, try to create the subgraph (will fail if already exists, that's OK)
echo "🔨 Creating subgraph in local Graph Node..."
graph create --node http://localhost:8020/ oro-token-claims || echo "Subgraph may already exist, continuing..."

# Now deploy the subgraph without an explicit network (it's in the subgraph.yaml)
echo "🚀 Deploying subgraph to local Graph Node..."
graph deploy oro-token-claims \
  --version-label v0.0.1 \
  --node http://localhost:8020/ \
  --ipfs http://localhost:5001 \
  --network-file ./networks.json

echo "✅ Local subgraph deployment complete!"
echo "- Explore the subgraph at: http://localhost:8000/subgraphs/name/oro-token-claims"
echo "- Query the GraphQL endpoint at: http://localhost:8000/subgraphs/name/oro-token-claims/graphql" 