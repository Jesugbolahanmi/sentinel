import { config } from "dotenv";
config({ path: ".env.local" });

import { getWalletTransactions } from "./basescan";
import { runAllChecks } from "./rules";

async function test() {
  const address = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const txs = await getWalletTransactions(address);
  console.log(`Transactions: ${txs.length}`);
  const flags = runAllChecks(txs, address);
  console.log(JSON.stringify(flags, null, 2));
}

test();