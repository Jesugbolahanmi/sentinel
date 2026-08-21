import { config } from "dotenv";
config({ path: ".env.local" });

import { getActiveApprovals, scanApprovalsAndPermits, checkIsContract } from "./approvals";
import { runAllChecks, checkApprovalRisks } from "./rules";
import { calculateRiskScore, getThreatLevel } from "./report";

async function testEngine() {
  console.log("=========================================");
  console.log("SENTINEL ONCHAIN APPROVALS ENGINE TEST");
  console.log("=========================================\n");

  // Test 1: Check contract vs EOA detection on Base
  const usdcBase = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC Contract
  const testEoa = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";   // Standard EOA

  const isUsdcContract = await checkIsContract(usdcBase);
  const isEoaContract = await checkIsContract(testEoa);

  console.log(`[Contract Check] USDC (${usdcBase}) -> isContract: ${isUsdcContract} (Expected: true)`);
  console.log(`[Contract Check] Standard EOA (${testEoa}) -> isContract: ${isEoaContract} (Expected: false)`);

  // Test 2: Active approvals scanning on a known active wallet
  console.log("\n[Scan Test] Testing active approvals scan on test address...");
  const scanResult = await scanApprovalsAndPermits(testEoa);

  console.log(`Scanned blocks: ${scanResult.totalScannedBlocks}`);
  console.log(`Found active approvals: ${scanResult.activeApprovals.length}`);
  console.log(`Found permits: ${scanResult.permits.length}`);

  if (scanResult.activeApprovals.length > 0) {
    console.log("\nSample Active Approval:", JSON.stringify(scanResult.activeApprovals[0], null, 2));
  }

  // Test 3: Heuristic rules with mock approvals & permits
  console.log("\n[Rules Test] Running risk rules with mock dangerous approval & permit...");
  const mockApprovals = [
    {
      tokenAddress: usdcBase,
      tokenSymbol: "USDC",
      tokenName: "USD Coin",
      tokenDecimals: 6,
      spender: testEoa, // Mock EOA spender
      spenderIsContract: false,
      allowanceRaw: "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      allowanceFormatted: "Unlimited",
      isUnlimited: true,
      lastUpdatedBlock: "25000000",
      riskSeverity: "high" as const,
    }
  ];

  const mockPermits = [
    {
      type: "EIP-2612" as const,
      selector: "0xd505accf",
      txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      from: testEoa,
      to: usdcBase,
    }
  ];

  const flags = await runAllChecks([], testEoa, mockApprovals, mockPermits);
  console.log(`Flags generated: ${flags.length}`);
  flags.forEach((f) => console.log(`  - [${f.severity.toUpperCase()}] ${f.type}: ${f.message}`));

  const riskScore = calculateRiskScore(flags);
  const threatLevel = getThreatLevel(riskScore);
  console.log(`\nRisk Score: ${riskScore}/100 | Threat Level: ${threatLevel}`);

  console.log("\n=========================================");
  console.log("TEST COMPLETED SUCCESSFULLY");
  console.log("=========================================");
}

testEngine().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
