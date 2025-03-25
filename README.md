# WorldAgg Project

This project consists of three main components:

1. Graph Node (Docker)
2. Subgraph
3. Front-end (Next.js)

## Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

## Running the Graph Node

The Graph Node runs in Docker and requires PostgreSQL and IPFS.

```bash
# Navigate to the graph node directory
cd graph-node/docker

# Start the containers
docker-compose -f docker-compose-worldchain.yml up -d
```

This will start three containers:

- `docker-graph-node-1`: The Graph Node service
- `docker-postgres-1`: PostgreSQL database
- `docker-ipfs-1`: IPFS node

You can check if they're running with:

```bash
docker ps
```

The Graph Node explorer will be available at http://localhost:8000/

## Deploying the Subgraph

Once the Graph Node is running, deploy the subgraph:

```bash
# Navigate to the subgraph directory
cd subgraph

# Make the deployment script executable (if needed)
chmod +x deploy-local-worldchain.sh

# Deploy the subgraph
./deploy-local-worldchain.sh
```

The subgraph will be deployed to the local Graph Node and will be available at:

- Explorer: http://localhost:8000/subgraphs/name/oro-token-claims
- GraphQL endpoint: http://localhost:8000/subgraphs/name/oro-token-claims/graphql

## Running the Front-end

```bash
# Navigate to the front-end directory
cd front-end

# Install dependencies (if not already done)
npm install
# or
pnpm install

# Start the development server
npm run dev
# or
pnpm dev
```

The front-end will be available at http://localhost:3000/ (or http://localhost:3001/ if port 3000 is already in use).

## Troubleshooting

### Docker Issues

If you encounter Docker errors:

```bash
# Stop all containers
docker stop $(docker ps -q)

# Remove all containers
docker rm $(docker ps -aq)

# Remove volumes (if needed)
docker-compose -f docker-compose-worldchain.yml down -v
```

### Graph Node Connection Issues

If the subgraph deployment fails with connection errors, ensure the Graph Node container is fully initialized. This might take a minute or two after starting the containers.

## Project Structure

- `graph-node/`: Contains the Graph Node Docker configuration
- `subgraph/`: Contains the subgraph code and deployment scripts
- `front-end/`: Contains the Next.js front-end application
