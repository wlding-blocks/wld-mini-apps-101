const { ethers } = require("hardhat");

async function main() {
  console.log("Minting ORO tokens...");
  
  // Connect to deployed ORO contract
  const oroAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
  const ORO = await ethers.getContractFactory("ORO");
  const oro = await ORO.attach(oroAddress);
  
  // Use the first account to mint tokens
  const [signer] = await ethers.getSigners();
  const userAddress = await signer.getAddress();
  console.log(`User address: ${userAddress}`);
  
  // Check initial balance
  const initialBalance = await oro.balanceOf(userAddress);
  console.log(`Initial ORO balance: ${ethers.formatEther(initialBalance)} ORO`);
  
  // Generate a new signature with deadline for this specific transaction
  const { nullifierHash, deadline, signature } = await generateSignature(userAddress, oroAddress);
  
  console.log("Minting tokens...");
  try {
    // Call mint function with deadline
    const tx = await oro.mint(nullifierHash, signature, deadline);
    console.log(`Transaction hash: ${tx.hash}`);
    
    // Wait for confirmation
    console.log("Waiting for transaction confirmation...");
    const receipt = await tx.wait();
    console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
    
    // Check updated balance
    const newBalance = await oro.balanceOf(userAddress);
    console.log(`\nNew ORO balance: ${ethers.formatEther(newBalance)} ORO`);
    console.log(`Minted: ${ethers.formatEther(newBalance - initialBalance)} ORO`);
    
    console.log("\nMinting successful! ✅");
  } catch (error) {
    console.error("Error minting tokens:", error.message);
    if (error.message.includes("ORO__InvalidSignature")) {
      console.log("\nThe signature verification failed. This could be because:");
      console.log("1. The message sender doesn't match the address in the signature");
      console.log("2. The backend signer address in the contract doesn't match the one that generated the signature");
      console.log("3. The nullifier hash doesn't match the one used to generate the signature");
    } else if (error.message.includes("ORO__SignatureExpired")) {
      console.log("\nThe signature has expired. Generate a new signature with a future deadline.");
    } else if (error.message.includes("ORO__SignatureAlreadyUsed")) {
      console.log("\nThis signature has already been used. Generate a new signature.");
    }
  }
}

async function generateSignature(userAddress, contractAddress) {
  // Backend signer private key (this is the same test key from smart.js)
  const backendPrivateKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  const backendWallet = new ethers.Wallet(backendPrivateKey);
  
  // Use a test nullifier hash
  const nullifierHash = 123456789;
  
  // Generate a deadline 1 hour in the future
  const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  
  // Get chain ID
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;
  
  // Convert nullifierHash to a hex string (padded to 32 bytes)
  const nullifierHashHex = ethers.zeroPadValue(
    ethers.toBeHex(nullifierHash),
    32
  );
  
  // Create the message hash the same way the contract does
  const messageHash = ethers.keccak256(
    ethers.solidityPacked(
      ['address', 'uint256', 'uint256', 'uint256', 'address'],
      [userAddress, nullifierHashHex, deadline, chainId, contractAddress]
    )
  );
  
  // Sign the message hash
  const signature = await backendWallet.signMessage(ethers.getBytes(messageHash));
  
  console.log("Generated signature with deadline:", new Date(deadline * 1000).toISOString());
  
  return { nullifierHash, deadline, signature };
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 