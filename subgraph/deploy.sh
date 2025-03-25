#!/bin/bash

# Set environment variables
export VERSION_LABEL="v0.0.1"
export DEPLOY_KEY="HTnCRg0KxPt5aG7FCaMePEWGK1nRegjD"  # Your Alchemy deploy key

# Run codegen and build first
npm run codegen
npm run build

# Deploy the subgraph
npm run deploy

echo "Subgraph deployment complete!" 