import { NextRequest, NextResponse } from "next/server";
import { getWalletTransactions, classifyAddress } from "@/lib/basescan";
import { runAllChecks } from "@/lib/rules";
import { generateThreatReport } from "@/lib/report";
import { traceFunds } from "@/lib/trace";

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

    const transactions = await getWalletTransactions(address);
    const flags = await runAllChecks(transactions, address);
    const report = await generateThreatReport(address, flags);

    const hasOutflow = flags.some((f) => f.type === "LARGE_OUTFLOW");
    const trail = hasOutflow ? await traceFunds(address, 3) : [];

    return NextResponse.json({
      address,
      isContract: classification.isContract,
      flags,
      report,
      trail,
    });
  } catch (error) {
    console.error("Investigation error:", error);
    return NextResponse.json(
      { error: "Investigation failed. Please try again." },
      { status: 500 }
    );
  }
}