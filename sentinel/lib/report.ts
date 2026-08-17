import { GoogleGenerativeAI } from "@google/generative-ai";
import { Flag } from "./rules";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export function getRevokeLink(address: string) {
  return `https://revoke.cash/address/${address}?chainId=8453`;
}

export function calculateRiskScore(flags: Flag[]): number {
  const weights = { high: 30, medium: 15, low: 5 };
  const raw = flags.reduce((sum, f) => sum + weights[f.severity], 0);
  return Math.min(raw, 100);
}

export function getThreatLevel(score: number): string {
  if (score >= 70) return "CRITICAL";
  if (score >= 45) return "HIGH";
  if (score >= 20) return "MEDIUM";
  return "LOW";
}

export async function generateThreatReport(address: string, flags: Flag[]) {
  const riskScore = calculateRiskScore(flags);
  const threatLevel = getThreatLevel(riskScore);

  if (flags.length === 0) {
    return {
      riskScore,
      threatLevel,
      summary: "No significant threat indicators found in recent wallet activity.",
      recommendations: ["No immediate action needed."],
      revokeUrl: getRevokeLink(address),
    };
  }

  const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

  const prompt = `You are Sentinel, an AI Web3 incident-response agent. A deterministic scoring system has already calculated this wallet's risk score and threat level from its flagged activity — do not invent or change these numbers, only explain them.

Wallet: ${address}
Calculated risk score: ${riskScore}/100
Calculated threat level: ${threatLevel}

Flags detected:
${flags.map((f) => `- [${f.severity.toUpperCase()}] ${f.type}: ${f.message}`).join("\n")}

Respond ONLY with valid JSON in this exact shape, no markdown formatting, no code fences:
{
  "summary": "<2-3 sentence plain-English explanation of what's happening and why it matters, referencing the given risk score and threat level naturally>",
  "recommendations": ["<specific action 1>", "<specific action 2>"]
}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const cleaned = text.replace(/^```json\n?/, "").replace(/\n?```$/, "");
  const parsed = JSON.parse(cleaned);

  return {
    riskScore,
    threatLevel,
    summary: parsed.summary,
    recommendations: parsed.recommendations,
    revokeUrl: getRevokeLink(address),
  };
}