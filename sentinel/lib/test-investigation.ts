import { config } from "dotenv";
config({ path: ".env.local" });

import { getWalletTransactions } from "./basescan";
import { runAllChecks } from "./rules";
import { generateThreatReport } from "./report";
import { traceFunds } from "./trace";

async function testInvestigation() {
  const address = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  try {
    console.log("Step 1: Fetching transactions...");
    const transactions = await getWalletTransactions(address);
    console.log(`✓ Got ${transactions.length} transactions`);

    console.log("\nStep 2: Running checks...");
    const flags = await runAllChecks(transactions, address);
    console.log(`✓ Found ${flags.length} flags`);

    console.log("\nStep 3: Generating threat report...");
    const report = await generateThreatReport(address, flags);
    console.log(`✓ Report generated:`, JSON.stringify(report, null, 2));

    console.log("\nStep 4: Checking for large outflow...");
    const hasOutflow = flags.some((f) => f.type === "LARGE_OUTFLOW");
    console.log(`✓ Has large outflow: ${hasOutflow}`);

    if (hasOutflow) {
      console.log("\nStep 5: Tracing funds...");
      const trail = await traceFunds(address, 3);
      console.log(`✓ Traced ${trail.length} hops`);
    }

    console.log("\n✅ All steps completed successfully!");
  } catch (error) {
    console.error("❌ Investigation failed:", error);
    process.exit(1);
  }
}

testInvestigation();
