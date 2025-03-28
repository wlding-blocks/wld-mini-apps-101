// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {MessageHashUtils} from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

library ByteHasher {
    /// @dev Creates a keccak256 hash of a bytestring.
    /// @param value The bytestring to hash
    /// @return The hash of the specified value
    /// @dev `>> 8` makes sure that the result is included in our field
    function hashToField(bytes memory value) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(value))) >> 8;
    }
}

interface IWorldID {
    /// @notice Reverts if the zero-knowledge proof is invalid.
    /// @param root The of the Merkle tree
    /// @param groupId The id of the Semaphore group
    /// @param signalHash A keccak256 hash of the Semaphore signal
    /// @param nullifierHash The nullifier hash
    /// @param externalNullifierHash A keccak256 hash of the external nullifier
    /// @param proof The zero-knowledge proof
    /// @dev  Note that a double-signaling check is not included here, and should be carried by the caller.
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view;
}

contract ORO is ERC20, Ownable {
    using ByteHasher for bytes;
    using ECDSA for bytes32;

    error ORO__NotEnoughTimeHasPassed(
        uint256 lastMintedAt,
        uint256 requiredWaitTime
    );
    error ORO__InvalidSignature();
    error ORO__SignatureExpired(uint256 deadline);
    error ORO__SignatureAlreadyUsed();

    uint256 internal constant GROUP_ID = 1;
    IWorldID internal immutable WORLD_ID;
    uint256 internal immutable EXTERNAL_NULLIFIER;

    // Domain separator for EIP-712 signatures
    bytes32 private immutable DOMAIN_SEPARATOR;

    uint256 public amountPerMint;
    uint40 public waitBetweenMints;

    address public backendSigner;

    struct MintData {
        uint40 lastMintedAt;
        uint32 numOfMints;
        bool signatureUsed;
    }

    mapping(uint256 nullifierHash => MintData) public nullifierHashMintData;

    // Keep track of used signatures to prevent replay attacks
    mapping(bytes32 => bool) public usedSignatures;

    event Minted(address indexed to, uint256 amount);
    event AmountPerMintUpdated(uint256 oldAmount, uint256 newAmount);
    event WaitBetweenMintsUpdated(uint40 oldWait, uint40 newWait);
    event BackendSignerUpdated(address oldSigner, address newSigner);

    constructor(
        address _owner,
        address _backendSigner,
        IWorldID _worldId,
        string memory _appId,
        string memory _actionId,
        uint256 _amountPerMint,
        uint40 _waitBetweenMints
    ) ERC20("ORO", "ORO") Ownable(_owner) {
        WORLD_ID = _worldId;
        EXTERNAL_NULLIFIER = abi
            .encodePacked(abi.encodePacked(_appId).hashToField(), _actionId)
            .hashToField();

        backendSigner = _backendSigner;
        amountPerMint = _amountPerMint;
        waitBetweenMints = _waitBetweenMints;

        // Create domain separator for EIP-712
        DOMAIN_SEPARATOR = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes("ORO")),
                keccak256(bytes("1")),
                block.chainid,
                address(this)
            )
        );
    }

    function mint(
        // uint256 root,
        uint256 nullifierHash,
        // uint256[8] calldata proof,
        bytes calldata signature,
        uint256 deadline
    ) public returns (uint256 amount) {
        // Check if deadline has passed
        if (block.timestamp > deadline) {
            revert ORO__SignatureExpired(deadline);
        }

        MintData memory mintData = nullifierHashMintData[nullifierHash];

        // Check time between mints
        if (block.timestamp - mintData.lastMintedAt < waitBetweenMints) {
            revert ORO__NotEnoughTimeHasPassed(
                mintData.lastMintedAt,
                waitBetweenMints
            );
        }

        // Verify signature and check it hasn't been used before
        bytes32 signatureHash = verify_signature(
            msg.sender,
            nullifierHash,
            deadline,
            signature
        );

        // Ensure signature hasn't been used before
        if (usedSignatures[signatureHash]) {
            revert ORO__SignatureAlreadyUsed();
        }

        // Mark signature as used
        usedSignatures[signatureHash] = true;

        // // Verify proof of personhood
        // WORLD_ID.verifyProof(
        //     root,
        //     GROUP_ID,
        //     abi.encodePacked(msg.sender).hashToField(),
        //     nullifierHash,
        //     EXTERNAL_NULLIFIER,
        //     proof
        // );

        // Update mint data
        MintData storage data = nullifierHashMintData[nullifierHash];
        data.lastMintedAt = uint40(block.timestamp);
        data.numOfMints++;

        amount = amountPerMint;
        _mint(msg.sender, amount);

        emit Minted(msg.sender, amount);
    }

    function verify_signature(
        address sender,
        uint256 nullifierHash,
        uint256 deadline,
        bytes calldata signature
    ) internal view returns (bytes32) {
        // Include deadline in the message to prevent replay attacks
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                sender,
                nullifierHash,
                deadline,
                block.chainid,
                address(this)
            )
        );

        bytes32 ethSignedHash = MessageHashUtils.toEthSignedMessageHash(
            messageHash
        );

        address recoveredSigner = ECDSA.recover(ethSignedHash, signature);

        if (recoveredSigner != backendSigner) {
            revert ORO__InvalidSignature();
        }

        return ethSignedHash;
    }

    function setBackendSigner(address _newSigner) external onlyOwner {
        emit BackendSignerUpdated(backendSigner, _newSigner);
        backendSigner = _newSigner;
    }

    function setAmountPerMint(uint256 _amountPerMint) external onlyOwner {
        emit AmountPerMintUpdated(amountPerMint, _amountPerMint);
        amountPerMint = _amountPerMint;
    }

    function setWaitBetweenMints(uint40 _waitBetweenMints) external onlyOwner {
        emit WaitBetweenMintsUpdated(waitBetweenMints, _waitBetweenMints);
        waitBetweenMints = _waitBetweenMints;
    }
}
