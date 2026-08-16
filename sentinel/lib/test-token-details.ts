import { config } from "dotenv";
config({ path: ".env.local" });

import { getWalletTransactions } from "./basescan";
import { runAllChecks } from "./rules";

async function testTokenDetails() {
  const address = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

  try {
    console.log("Fetching transactions...");
    const transactions = await getWalletTransactions(address);
    console.log(`✓ Got ${transactions.length} transactions\n`);

    console.log("Running checks to generate flags...");
    const flags = runAllChecks(transactions, address);
    console.log(`✓ Found ${flags.length} flags\n`);

    // Display phishing flag details with timestamps and sender info
    const phishingFlag = flags.find(f => f.type === "PHISHING_AIRDROP");
    if (phishingFlag && phishingFlag.details) {
      console.log("=== MALICIOUS TOKEN TRANSFERS ===\n");
      phishingFlag.details.slice(0, 5).forEach((token: any, index: number) => {
        const timestamp = new Date(token.timestamp);
        console.log(`${index + 1}. ${token.asset}`);
        console.log(`   Sent: ${timestamp.toLocaleString()}`);
        console.log(`   From: ${token.from}`);
        console.log(`   To: ${token.to}`);
        console.log(`   Value: ${token.value}`);
        console.log(`   TX Hash: ${token.hash}`);
        console.log(`   Block: ${token.blockNum}`);
        console.log("");
      });
      console.log(`✅ Displaying first 5 of ${phishingFlag.details.length} malicious tokens\n`);
    }

  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

testTokenDetails();
