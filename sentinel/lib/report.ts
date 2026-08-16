import { GoogleGenerativeAI } from "@google/generative-ai";
import { Flag } from "./rules";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export function getRevokeLink(address: string) {
  return `https://revoke.cash/address/${address}?chainId=8453`;
}

export async function generateThreatReport(address: string, flags: Flag[]) {
  if (flags.length === 0) {
    return {
      riskScore: 5,
      threatLevel: "LOW",
      summary: "No significant threat indicators found in recent wallet activity.",
      recommendations: ["No immediate action needed."],
      revokeUrl: getRevokeLink(address),
    };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `You are Sentinel, an AI Web3 incident-response agent. Analyze this wallet's flagged activity and produce a threat assessment.

Wallet: ${address}

Flags detected:
${flags.map((f) => `- [${f.severity.toUpperCase()}] ${f.type}: ${f.message}`).join("\n")}

Respond ONLY with valid JSON in this exact shape, no markdown formatting, no code fences:
{
  "riskScore": <number 0-100>,
  "threatLevel": "<LOW|MEDIUM|HIGH|CRITICAL>",
  "summary": "<2-3 sentence plain-English explanation of what's happening and why it matters>",
  "recommendations": ["<specific action 1>", "<specific action 2>"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();

  const cleaned = text.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  const parsed = JSON.parse(cleaned);

  return {
    ...parsed,
    revokeUrl: getRevokeLink(address),
  };
}