const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ORO Contract", function () {
  let oro;
  let mockWorldID;
  let owner;
  let user;
  let backendSigner;
  let backendSignerWallet;
  
  const nullifierHash = 123456789;
  const amountPerMint = ethers.parseEther("10");
  
  before(async function () {
    // Get signers
    [owner, user] = await ethers.getSigners();
    
    // Create backend signer wallet with the private key
    // This is the same private key used in smart.js
    const backendPrivateKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    backendSignerWallet = new ethers.Wallet(backendPrivateKey);
    backendSigner = await backendSignerWallet.getAddress();
    
    console.log("Backend signer address:", backendSigner);
    
    // Deploy MockWorldID
    const MockWorldID = await ethers.getContractFactory("MockWorldID");
    mockWorldID = await MockWorldID.deploy();
    await mockWorldID.waitForDeployment();
    
    // Deploy ORO contract
    const ORO = await ethers.getContractFactory("ORO");
    oro = await ORO.deploy(
      owner.address,
      backendSigner,
      await mockWorldID.getAddress(),
      "app_staging_0123456789abcdef",
      "user-verification",
      amountPerMint,
      86400 // 1 day in seconds
    );
    await oro.waitForDeployment();
  });
  
  async function generateSignature(userAddress, nullifierHash) {
    // Convert nullifierHash to a hex string and pad to 32 bytes
    const nullifierHashHex = ethers.zeroPadValue(
      ethers.toBeHex(nullifierHash),
      32
    );
    
    // Create the message hash the same way the contract does
    const messageHash = ethers.keccak256(
      ethers.solidityPacked(
        ['address', 'uint256'],
        [userAddress, nullifierHashHex]
      )
    );
    
    console.log("Message hash:", messageHash);
    
    // Sign the message hash
    const signature = await backendSignerWallet.signMessage(ethers.getBytes(messageHash));
    console.log("Signature:", signature);
    
    return signature;
  }
  
  it("Should correctly verify signatures", async function () {
    // Generate a signature for the user
    const signature = await generateSignature(user.address, nullifierHash);
    
    // Should succeed when signature is valid
    await expect(oro.connect(user).mint(nullifierHash, signature))
      .to.emit(oro, "Minted")
      .withArgs(user.address, amountPerMint);
    
    // Check balance after minting
    expect(await oro.balanceOf(user.address)).to.equal(amountPerMint);
  });
  
  it("Should reject with invalid signature", async function () {
    // Generate signature for user1 but try to use it with user2
    const signature = await generateSignature(owner.address, nullifierHash);
    
    // Should fail when user doesn't match the one in the signature
    await expect(oro.connect(user).mint(nullifierHash, signature))
      .to.be.revertedWithCustomError(oro, "ORO__InvalidSignature");
  });
  
  it("Should allow owner to change backend signer", async function () {
    // Get new signer
    const newSigner = ethers.Wallet.createRandom();
    const newSignerAddress = newSigner.address;
    
    // Change signer
    await expect(oro.connect(owner).setBackendSigner(newSignerAddress))
      .to.emit(oro, "BackendSignerUpdated")
      .withArgs(backendSigner, newSignerAddress);
    
    // Verify it changed
    expect(await oro.backendSigner()).to.equal(newSignerAddress);
    
    // Generate signature with old signer
    const signature = await generateSignature(user.address, 987654321);
    
    // Should fail with the new signer set
    await expect(oro.connect(user).mint(987654321, signature))
      .to.be.revertedWithCustomError(oro, "ORO__InvalidSignature");
    
    // Set it back for other tests
    await oro.connect(owner).setBackendSigner(backendSigner);
  });
}); 