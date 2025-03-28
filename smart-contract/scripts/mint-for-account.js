const { ethers } = require("hardhat");

async function main() {
  // Get the account index from command line arguments (default to 1)
  const accountIndex = process.argv[2] ? parseInt(process.argv[2]) : 1;
  
  // Get the account
  const signers = await ethers.getSigners();
  if (accountIndex >= signers.length) {
    throw new Error(`Account index ${accountIndex} is out of range. Max: ${signers.length - 1}`);
  }
  
  const account = signers[accountIndex];
  const userAddress = await account.getAddress();
  
  console.log(`Minting ORO tokens for Account #${accountIndex} (${userAddress})...`);
  
  // Connect to deployed ORO contract
  const oroAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";
  const ORO = await ethers.getContractFactory("ORO");
  const oro = await ORO.attach(oroAddress);
  
  // Check initial balance
  const initialBalance = await oro.balanceOf(userAddress);
  console.log(`Initial ORO balance: ${ethers.formatEther(initialBalance)} ORO`);
  
  // Generate a signature for this account
  const nullifierHash = 123456789 + accountIndex; // Different nullifier for each account
  const { deadline, signature } = await generateSignature(userAddress, nullifierHash, oroAddress);
  
  console.log("Minting tokens...");
  try {
    // Call mint function with the account
    const tx = await oro.connect(account).mint(nullifierHash, signature, deadline);
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

async function generateSignature(userAddress, nullifierHash, contractAddress) {
  // Backend signer private key (this is the same test key from smart.js)
  const backendPrivateKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
  const backendWallet = new ethers.Wallet(backendPrivateKey);
  
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
  
  console.log(`Generated signature for account ${userAddress} with nullifier ${nullifierHash}`);
  console.log(`Deadline: ${new Date(deadline * 1000).toISOString()} (${deadline})`);
  
  return { deadline, signature };
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 