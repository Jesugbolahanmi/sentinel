import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getWalletTransactions } from "@/lib/basescan";
import { runAllChecks } from "@/lib/rules";

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function sendTelegramAlert(chatId: number, address: string, newFlags: any[]) {
  const lines = newFlags
    .map((f) => `• <b>[${f.severity.toUpperCase()}]</b> ${f.message}`)
    .join("\n");

  const text = `🚨 <b>Sentinel Alert</b>\nWallet: <code>${address}</code>\n\n${lines}`;

  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

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
      const flags = await runAllChecks(transactions, watch.address);

      const previousFlagTypes = (watch.last_flags || []).map((f: any) => f.type);
      const newFlags = flags.filter((f) => !previousFlagTypes.includes(f.type));

      if (newFlags.length > 0) {
        if (watch.telegram_chat_id) {
          await sendTelegramAlert(watch.telegram_chat_id, watch.address, newFlags);
        }

        await supabase
          .from("watched_wallets")
          .update({ last_flags: flags })
          .eq("id", watch.id);

        results.push({
          address: watch.address,
          alerted: !!watch.telegram_chat_id,
          newFlags: newFlags.length,
        });
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