// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

contract MockWorldID {
    function verifyProof(
        uint256 root,
        uint256 groupId,
        uint256 signalHash,
        uint256 nullifierHash,
        uint256 externalNullifierHash,
        uint256[8] calldata proof
    ) external view {
        // This is a mock implementation, it doesn't verify anything
        // In a real implementation, this would verify a ZK proof
    }
}
