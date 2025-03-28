const { ethers } = require("hardhat");

async function main() {
  // Get the signer for testing
  const [signer] = await ethers.getSigners();
  const userAddress = signer.address;
  
  // Use a test nullifier hash
  const nullifierHash = 123456789;
  
  // Generate a deadline 1 hour in the future
  const deadlineInSeconds = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
  
  // Get the contract address and chainId
  const contractAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;
  
  // Backend signer private key (this is the same test key from smart.js)
  const backendPrivateKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  const backendWallet = new ethers.Wallet(backendPrivateKey);
  const backendAddress = await backendWallet.getAddress();
  
  console.log("=== Signature Generation with Anti-Replay Protection ===");
  console.log("Backend Signer Address:", backendAddress);
  console.log("User Address:", userAddress);
  console.log("Nullifier Hash:", nullifierHash);
  console.log("Deadline:", new Date(deadlineInSeconds * 1000).toISOString(), `(${deadlineInSeconds})`);
  console.log("Chain ID:", chainId);
  console.log("Contract Address:", contractAddress);
  
  // Convert nullifierHash to a hex string (padded to 32 bytes)
  const nullifierHashHex = ethers.zeroPadValue(
    ethers.toBeHex(nullifierHash),
    32
  );
  
  // Create the message hash the same way the contract does
  const messageHash = ethers.keccak256(
    ethers.solidityPacked(
      ['address', 'uint256', 'uint256', 'uint256', 'address'],
      [userAddress, nullifierHashHex, deadlineInSeconds, chainId, contractAddress]
    )
  );
  
  console.log("Message Hash:", messageHash);
  
  // Sign the message hash
  const signature = await backendWallet.signMessage(ethers.getBytes(messageHash));
  
  console.log("\nSignature:", signature);
  
  // Verify the signature (same method as the contract)
  const prefixedHash = ethers.hashMessage(ethers.getBytes(messageHash));
  const recoveredAddress = ethers.recoverAddress(prefixedHash, signature);
  
  console.log("\nVerification Check:");
  console.log("Recovered address:", recoveredAddress);
  console.log("Expected signer:", backendAddress);
  console.log("Signature Valid:", recoveredAddress.toLowerCase() === backendAddress.toLowerCase());
  
  console.log("\n=== Values for Contract Call ===");
  console.log(`nullifierHash: ${nullifierHash}`);
  console.log(`deadline: ${deadlineInSeconds}`);
  console.log(`signature: ${signature}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 