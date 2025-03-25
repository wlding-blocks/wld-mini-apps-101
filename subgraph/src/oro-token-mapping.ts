import { BigInt, Bytes, log } from "@graphprotocol/graph-ts"
import {
  Minted as MintedEvent
} from "../generated/OROToken/OROToken"
import { TokenClaim, User, DailyClaimStat, TokenStats } from "../generated/schema"

// Initialize or get user
function getOrCreateUser(address: Bytes): User {
  let userId = address.toHexString()
  let user = User.load(userId)
  
  if (user == null) {
    user = new User(userId)
    user.address = address
    user.totalClaims = BigInt.fromI32(0)
    user.uniqueDays = BigInt.fromI32(0)
    user.save()
  }
  
  return user
}

// Process Minted events
export function handleMinted(event: MintedEvent): void {
  // Log event details for debugging
  log.info(
    "Minted event detected: to={}, amount={}, txHash={}", 
    [
      event.params.to.toHexString(),
      event.params.amount.toString(),
      event.transaction.hash.toHexString()
    ]
  )

  // Filter by amount to exclude potential test mints (amount of 1)
  if (event.params.amount.equals(BigInt.fromI32(1))) {
    log.info("Skipping test mint with amount 1", [])
    return
  }
  
  // Create unique ID for the claim using transaction hash and log index
  let claimId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  
  // Get or create the user
  let user = getOrCreateUser(event.params.to)
  
  // Create the claim entity
  let claim = new TokenClaim(claimId)
  claim.claimant = user.id
  claim.amount = event.params.amount
  claim.timestamp = event.block.timestamp
  claim.blockNumber = event.block.number
  claim.transactionHash = event.transaction.hash
  claim.save()
  
  // Update user's stats but with minimal operations
  user.totalClaims = user.totalClaims.plus(BigInt.fromI32(1))
  
  // Set first claim timestamp if not set
  if (!user.firstClaimTimestamp) {
    user.firstClaimTimestamp = event.block.timestamp
  }
  
  // Set last claim timestamp if not set or update if later
  if (!user.lastClaimTimestamp) {
    user.lastClaimTimestamp = event.block.timestamp
  } else if (user.lastClaimTimestamp!.lt(event.block.timestamp)) {
    user.lastClaimTimestamp = event.block.timestamp
  }
  
  user.save()
  
  log.info("Processed mint event for user {}, amount {}", [user.id, event.params.amount.toString()])
}

// Removing all other event handlers to simplify the subgraph 