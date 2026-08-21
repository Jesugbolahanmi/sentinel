import { config } from "dotenv";
config({ path: ".env.local" });

import { getWalletTransactions } from "./basescan";
import { runAllChecks } from "./rules";
import { generateThreatReport } from "./report";

async function test() {
  const address = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const txs = await getWalletTransactions(address);
  const flags = await runAllChecks(txs, address);
  const report = await generateThreatReport(address, flags);
  console.log(JSON.stringify(report, null, 2));
}

test();