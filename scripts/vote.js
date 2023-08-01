const { ethers } = require("hardhat")
const fs = require("fs")
const { governorAddress } = require("./scontracts")
const { proposalId } = require("./_lastProposal")

/**
 * They must have passed the time that is configured in the contract deploy
 */
async function main() {
  // Get owner address
  const governor = await ethers.getContractAt("MyGovernor", governorAddress)

  proposalState = await governor.state(proposalId)
  console.log(
    `Current Proposal State: ${proposalState} (should be 1. if 0 wait for it)`,
  )

  const tx = await governor.castVote(proposalId, 1)
  const receipt = await tx.wait()
  const voteCastEvent = receipt.events.find((x) => x.event === "VoteCast")
  console.log(voteCastEvent)

  proposalState = await governor.state(proposalId)

  console.log(`Current Proposal State: ${proposalState}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
