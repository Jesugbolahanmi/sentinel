import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

async function sendMessage(chatId: number, text: string) {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const message = update.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;
    const text: string = message.text.trim();

    // Deep link arrives as: /start 0xWalletAddress
    if (text.startsWith("/start")) {
      const parts = text.split(" ");
      const address = parts[1];

      if (!address) {
        await sendMessage(
          chatId,
          "Welcome to Sentinel. Add a wallet to monitor from the app first, then tap the \"Connect Telegram\" link it gives you."
        );
        return NextResponse.json({ ok: true });
      }

      const { data: existing } = await supabase
        .from("watched_wallets")
        .select("id")
        .eq("address", address.toLowerCase())
        .maybeSingle();

      if (existing) {
        await supabase
          .from("watched_wallets")
          .update({ telegram_chat_id: chatId })
          .eq("id", existing.id);
      } else {
        await supabase
          .from("watched_wallets")
          .insert([{ address: address.toLowerCase(), telegram_chat_id: chatId, last_flags: [] }]);
      }

      await sendMessage(
        chatId,
        `✅ Connected. Sentinel will alert you here the moment new activity is flagged on <code>${address}</code>.`
      );
      return NextResponse.json({ ok: true });
    }

    await sendMessage(chatId, "Sentinel is listening. Use the app to add or manage watched wallets.");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: true }); // always 200 so Telegram doesn't retry-storm
  }
}