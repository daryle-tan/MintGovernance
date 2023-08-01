const { ethers } = require("hardhat")
const { toUtf8Bytes, keccak256, parseEther } = ethers.utils
const { governorAddress, tokenAddress } = require("./contracts")
const { proposalId } = require("./_lastProposal")
const moveBlocks = require("../utils/moveBlocks")

/**
 * They must have passed the time that is configured in the contract deploy
 */
async function main() {
  // Get owner address
  const [owner] = await ethers.getSigners()

  const governor = await ethers.getContractAt("MyGovernor", governorAddress)
  const token = await ethers.getContractAt("MyToken", tokenAddress)

  proposalState = await governor.state(proposalId)
  console.log(
    `Current Proposal State: ${proposalState} (should be 1. if 0 wait for it)`,
  )

  const preBalance = await token.balanceOf(owner.address)
  console.log(`Balance before executing: ${preBalance}`)

  // Go ahead of time to make it active
  const votingPeriod = await governor.votingPeriod()
  await moveBlocks(votingPeriod.toNumber() + 1)

  const tx = await governor.execute(
    [token.address],
    [0],
    [
      token.interface.encodeFunctionData("mint", [
        owner.address,
        parseEther("25000"),
      ]),
    ],
    keccak256(toUtf8Bytes("Give the owner more tokens!")),
  )

  const balance = await token.balanceOf(owner.address)
  console.log(`Balance post executing: ${balance}`)

  console.log(tx)

  proposalState = await governor.state(proposalId)
  console.log(`Current Proposal State: ${proposalState}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
