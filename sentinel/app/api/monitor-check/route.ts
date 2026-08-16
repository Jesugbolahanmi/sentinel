import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getWalletTransactions } from "@/lib/basescan";
import { runAllChecks } from "@/lib/rules";
import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

export async function GET(req: NextRequest) {
  try {
    const { data: watches, error } = await supabase
      .from("watched_wallets")
      .select("*");

    if (error) {
      console.error("Fetch watches error:", error);
      return NextResponse.json({ error: "Failed to fetch watchlist" }, { status: 500 });
    }

    const results = [];

    for (const watch of watches) {
      const transactions = await getWalletTransactions(watch.address);
      const flags = runAllChecks(transactions, watch.address);

      const previousFlagTypes = (watch.last_flags || []).map((f: any) => f.type);
      const newFlags = flags.filter((f) => !previousFlagTypes.includes(f.type));

      if (newFlags.length > 0) {
        await brevo.transactionalEmails.sendTransacEmail({
          subject: `Sentinel Alert: New activity on ${watch.address.slice(0, 6)}...${watch.address.slice(-4)}`,
          htmlContent: `
            <h2>Sentinel detected new activity</h2>
            <p><strong>Wallet:</strong> ${watch.address}</p>
            <ul>
              ${newFlags.map((f) => `<li><strong>[${f.severity.toUpperCase()}]</strong> ${f.message}</li>`).join("")}
            </ul>
          `,
          sender: { name: "Sentinel", email: process.env.BREVO_FROM_EMAIL! },
          to: [{ email: watch.email }],
        });

        await supabase
          .from("watched_wallets")
          .update({ last_flags: flags })
          .eq("id", watch.id);

        results.push({ address: watch.address, alerted: true, newFlags: newFlags.length });
      } else {
        results.push({ address: watch.address, alerted: false });
      }
    }

    return NextResponse.json({ checked: watches.length, results });
  } catch (error) {
    console.error("Monitor-check error:", error);
    return NextResponse.json({ error: "Monitor check failed" }, { status: 500 });
  }
}