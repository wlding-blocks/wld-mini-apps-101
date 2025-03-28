const hre = require("hardhat");

async function main() {
  console.log("Deploying contracts...");
  
  // Deploy MockWorldID first
  const MockWorldID = await hre.ethers.getContractFactory("MockWorldID");
  const mockWorldID = await MockWorldID.deploy();
  await mockWorldID.waitForDeployment();
  
  const mockWorldIDAddress = await mockWorldID.getAddress();
  console.log(`MockWorldID deployed to: ${mockWorldIDAddress}`);
  
  // Deploy ORO contract
  // Parameters for the ORO contract constructor
  const deployer = (await hre.ethers.getSigners())[0].address;
  const backendSigner = "0xFCAd0B19bB29D4674531d6f115237E16AfCE377c"; // Our test backend signer
  const worldId = mockWorldIDAddress;
  const appId = "app_staging_0123456789abcdef";
  const actionId = "user-verification";
  const amountPerMint = hre.ethers.parseEther("10"); // 10 tokens per mint
  const waitBetweenMints = 86400; // 1 day in seconds
  
  const ORO = await hre.ethers.getContractFactory("ORO");
  const oro = await ORO.deploy(
    deployer,
    backendSigner,
    worldId,
    appId,
    actionId,
    amountPerMint,
    waitBetweenMints
  );
  
  await oro.waitForDeployment();
  
  const oroAddress = await oro.getAddress();
  console.log(`ORO deployed to: ${oroAddress}`);
  console.log(`Backend signer set to: ${backendSigner}`);
  console.log(`Amount per mint: ${hre.ethers.formatEther(amountPerMint)} ORO`);
  
  console.log("Deployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 