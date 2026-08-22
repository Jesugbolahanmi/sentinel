import { NextRequest, NextResponse } from "next/server";
import { getWalletTransactions, classifyAddress } from "@/lib/basescan";
import { runAllChecks } from "@/lib/rules";
import { generateThreatReport } from "@/lib/report";
import { traceFunds } from "@/lib/trace";
import { getActiveApprovals, detectPermitTransactions } from "@/lib/approvals";

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { error: "A wallet address is required" },
        { status: 400 }
      );
    }

    const classification = await classifyAddress(address);

    if (!classification.valid) {
      return NextResponse.json(
        { error: classification.reason },
        { status: 400 }
      );
    }

    if (!classification.hasActivity) {
      return NextResponse.json(
        { error: classification.reason },
        { status: 400 }
      );
    }

    // Run transaction fetch and approval log scan in parallel — independent data sources
    const [transactions, approvalsData] = await Promise.all([
      getWalletTransactions(address),
      getActiveApprovals(address),
    ]);

    // Permit detection requires real calldata from getTransaction —
    // must run after transactions are fetched (needs tx hashes)
    const permits = await detectPermitTransactions(address, transactions);

    const flags = await runAllChecks(
      transactions,
      address,
      approvalsData.activeApprovals,
      permits
    );

    const report = await generateThreatReport(address, flags);

    const hasOutflow = flags.some((f) => f.type === "LARGE_OUTFLOW");
    const trail = hasOutflow ? await traceFunds(address, 3) : [];

    return NextResponse.json({
      address,
      isContract: classification.isContract,
      flags,
      report,
      trail,
      activeApprovals: approvalsData.activeApprovals,
      permits,
      approvalScanMeta: {
        totalScannedBlocks: approvalsData.totalScannedBlocks,
        startBlock: approvalsData.startBlock,
        endBlock: approvalsData.endBlock,
      },
    });
  } catch (error) {
    console.error("Investigation error:", error);
    return NextResponse.json(
      { error: "Investigation failed. Please try again." },
      { status: 500 }
    );
  }
}