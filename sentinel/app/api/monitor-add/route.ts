import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { address, email } = await req.json();

    if (!address || !email) {
      return NextResponse.json(
        { error: "Address and email are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("watched_wallets")
      .insert([{ address, email, last_flags: [] }])
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