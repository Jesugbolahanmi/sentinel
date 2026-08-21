import { config } from "dotenv";
config({ path: ".env.local" });

import { publicClient, approvalEventAbi } from "./approvals";
import { getAddress } from "viem";

async function findTestWallet() {
  console.log("Searching for wallets with recent USDC approvals on Base...\n");

  const USDC_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const currentBlock = await publicClient.getBlockNumber();

  // Scan last 100 blocks for recent USDC Approval events
  const logs = await publicClient.getLogs({
    address: getAddress(USDC_BASE),
    event: approvalEventAbi,
    fromBlock: currentBlock - BigInt(100),
    toBlock: currentBlock,
  });

  console.log(`Found ${logs.length} USDC approval events in last 100 blocks\n`);

  if (logs.length === 0) {
    console.log("No recent approvals found. Try widening the block range.");
    return;
  }

  // Pick a few unique owners
  const seen = new Set<string>();
  const candidates: string[] = [];

  for (const log of logs) {
    const owner = log.args?.owner;
    if (!owner || seen.has(owner.toLowerCase())) continue;
    seen.add(owner.toLowerCase());
    candidates.push(owner);
    if (candidates.length >= 5) break;
  }

  console.log("Candidate wallets with recent USDC approvals:");
  for (const addr of candidates) {
    console.log(`  ${addr}`);
    console.log(`  https://basescan.org/address/${addr}`);
    console.log();
  }

  console.log(`\nTry scanning one of these in the Sentinel UI at http://localhost:3000/scan/wallet`);
}

findTestWallet().catch(console.error);
