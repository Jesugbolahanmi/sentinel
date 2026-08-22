import { config } from "dotenv";
config({ path: ".env.local" });

import { getWalletTransactions, isContract } from "./basescan";
import { getActiveApprovals } from "./approvals";

async function test() {
  const address = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  const txs = await getWalletTransactions(address);
  console.log(`Transactions: ${txs.length}`);

  const approvalData = await getActiveApprovals(address);
  console.log(`Active Approvals: ${approvalData.activeApprovals.length}`);

  const contractCheck = await isContract(address);
  console.log(`Is contract: ${contractCheck}`);
}

test();