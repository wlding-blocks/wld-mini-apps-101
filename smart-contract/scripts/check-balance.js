const { ethers } = require("hardhat");

async function main() {
  const oroAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
  const ORO = await ethers.getContractFactory("ORO");
  const oro = await ORO.attach(oroAddress);
  
  // Get the first 5 accounts
  const signers = await ethers.getSigners();
  const accounts = signers.slice(0, 5);
  
  console.log("=== ORO Token Balances ===");
  console.log(`Contract Address: ${oroAddress}`);
  
  // Get contract information
  const name = await oro.name();
  const symbol = await oro.symbol();
  const totalSupply = await oro.totalSupply();
  const amountPerMint = await oro.amountPerMint();
  const backendSigner = await oro.backendSigner();
  
  console.log(`\nToken Name: ${name}`);
  console.log(`Token Symbol: ${symbol}`);
  console.log(`Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);
  console.log(`Amount Per Mint: ${ethers.formatEther(amountPerMint)} ${symbol}`);
  console.log(`Backend Signer: ${backendSigner}`);
  
  console.log("\n=== Account Balances ===");
  for (let i = 0; i < accounts.length; i++) {
    const address = await accounts[i].getAddress();
    const balance = await oro.balanceOf(address);
    console.log(`Account #${i}: ${address}`);
    console.log(`Balance: ${ethers.formatEther(balance)} ${symbol}`);
    console.log("---------------");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 