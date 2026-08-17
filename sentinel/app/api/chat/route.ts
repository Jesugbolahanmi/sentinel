import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { message, context, history } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

    const systemContext = `You are Sentinel, an AI Web3 incident-response agent. You just completed an investigation with these results:

Wallet: ${context.address}
Risk Score: ${context.riskScore}/100
Threat Level: ${context.threatLevel}
Summary: ${context.summary}
Flags: ${context.flags.map((f: any) => `[${f.severity}] ${f.type}: ${f.message}`).join("; ")}

The user may now ask follow-up questions about this specific investigation. Answer based only on the evidence above — don't invent facts not present in the data. Keep answers concise (2-4 sentences unless more detail is genuinely needed). If asked something outside the scope of this investigation, say so honestly rather than guessing.`;

    const conversationHistory = (history || [])
      .map((h: any) => `${h.role === "user" ? "User" : "Sentinel"}: ${h.content}`)
      .join("\n");

    const prompt = `${systemContext}\n\n${conversationHistory}\n\nUser: ${message}\n\nSentinel:`;

    const result = await model.generateContent(prompt);
    const reply = result.response.text().trim();

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Chat failed" }, { status: 500 });
  }
}