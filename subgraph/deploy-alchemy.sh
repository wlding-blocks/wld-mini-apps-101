#!/bin/bash

# Run codegen and build first
npm run codegen
npm run build

# Deploy to Alchemy (using embedded environment variables)
npm run deploy-alchemy

echo "Alchemy subgraph deployment complete!" 