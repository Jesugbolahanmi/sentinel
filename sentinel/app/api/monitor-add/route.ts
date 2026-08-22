import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json(
        { error: "Invalid Ethereum address format" },
        { status: 400 }
      );
    }

    const normalized = address.toLowerCase();

    const { data: existing } = await supabase
      .from("watched_wallets")
      .select("*")
      .eq("address", normalized)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, watch: existing });
    }

    const { data, error } = await supabase
      .from("watched_wallets")
      .insert([{ address: normalized, last_flags: [] }])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to add wallet" }, { status: 500 });
    }

    return NextResponse.json({ success: true, watch: data[0] });
  } catch (error) {
    console.error("Monitor-add error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}