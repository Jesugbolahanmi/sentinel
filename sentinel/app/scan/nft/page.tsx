"use client";

import { useState } from "react";
import Link from "next/link";

export default function NFTScan() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function handleInvestigate() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/investigate-nft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Failed to reach the server");
    } finally {
      setLoading(false);
    }
  }

  function severityColor(level: string) {
    if (level === "CRITICAL" || level === "HIGH") return "#FF3B3B";
    if (level === "MEDIUM") return "#FFB020";
    return "#34D399";
  }

  function flagColor(severity: string) {
    if (severity === "high") return "#FF3B3B";
    if (severity === "medium") return "#FFB020";
    return "#7C8394";
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/scan"
          className="font-[family-name:var(--font-mono)] text-xs text-[#7C8394] hover:text-[#E6E8EC] transition-colors mb-8 inline-block"
        >
          back
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#34D399] animate-blink" />
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#E6E8EC]">
            SENTINEL
          </h1>
          <span className="font-[family-name:var(--font-mono)] text-xs text-[#7C8394]">
            / scan / nft
          </span>
        </div>

        <div className="bg-[#12151C] border border-[#242938] rounded p-4 mb-6">
          <div className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-sm text-[#38BDF8] mb-2">
            <span>$</span>
            <span>scan --nft</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="NFT contract address (0x...)"
              className="flex-1 bg-[#0A0C10] border border-[#242938] rounded px-4 py-3 text-[#E6E8EC] placeholder-[#4a5063] font-[family-name:var(--font-mono)] text-sm focus:outline-none focus:border-[#38BDF8] transition-colors"
            />
            <button
              onClick={handleInvestigate}
              disabled={loading || !address}
              className="bg-[#FFB020] hover:bg-[#ffc04d] disabled:bg-[#242938] disabled:text-[#4a5063] disabled:cursor-not-allowed text-black rounded px-6 py-3 font-semibold font-[family-name:var(--font-mono)] text-sm transition-colors"
            >
              {loading ? "SCANNING" : "RUN"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded p-4 mb-6 text-[#FF3B3B] font-[family-name:var(--font-mono)] text-sm">
            ERROR: {error}
          </div>
        ) : null}

        {result && !loading ? (
          <div className="space-y-4">
            {result.metadata ? (
              <div className="bg-[#12151C] border border-[#242938] rounded p-6">
                <h3 className="font-[family-name:var(--font-mono)] text-xs text-[#7C8394] mb-3">
                  COLLECTION_INFO
                </h3>
                <div className="text-sm text-[#B4B9C4] space-y-1">
                  <div>Name: {result.metadata.name || result.metadata.openSeaMetadata?.collectionName || "Unknown"}</div>
                  <div>Symbol: {result.metadata.symbol || "Unknown"}</div>
                  <div>Type: {result.metadata.tokenType || "Unknown"}</div>
                  <div>Total Supply: {result.metadata.totalSupply || "Unknown"}</div>
                </div>
              </div>
            ) : null}

            <div
              className="bg-[#12151C] border-l-4 rounded p-6"
              style={{ borderColor: severityColor(result.report.threatLevel) }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#7C8394] text-sm">Threat Level</span>
                <span
                  className="px-3 py-1 rounded text-sm font-bold font-[family-name:var(--font-mono)]"
                  style={{
                    color: severityColor(result.report.threatLevel),
                    backgroundColor: severityColor(result.report.threatLevel) + "1A",
                  }}
                >
                  {result.report.threatLevel}
                </span>
              </div>
              <div className="text-3xl font-bold text-[#E6E8EC] mb-3 font-[family-name:var(--font-mono)]">
                {result.report.riskScore}
                <span className="text-lg text-[#7C8394]">/100</span>
              </div>
              <p className="text-[#B4B9C4] text-sm leading-relaxed">{result.report.summary}</p>
            </div>

            {result.flags && result.flags.length > 0 ? (
              <div className="bg-[#12151C] border border-[#242938] rounded p-6">
                <h3 className="font-[family-name:var(--font-mono)] text-xs text-[#7C8394] mb-3">
                  DETECTED_FLAGS [{result.flags.length}]
                </h3>
                <div className="space-y-2 font-[family-name:var(--font-mono)] text-sm">
                  {result.flags.map((flag: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 bg-[#0A0C10] rounded p-3">
                      <span className="text-xs shrink-0" style={{ color: flagColor(flag.severity) }}>
                        [{flag.severity.toUpperCase()}]
                      </span>
                      <span className="text-[#B4B9C4]">{flag.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {result.deployerReport ? (
              <div className="bg-[#12151C] border border-[#242938] rounded p-6">
                <h3 className="font-[family-name:var(--font-mono)] text-xs text-[#7C8394] mb-3">
                  DEPLOYER_FOOTPRINT
                </h3>
                <div className="text-sm text-[#B4B9C4] mb-3">
                    <a
                    href={"https://basescan.org/address/" + result.deployerReport.address}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#38BDF8] hover:underline font-[family-name:var(--font-mono)] text-xs"
                  >
                    {result.deployerReport.address}
                  </a>
                </div>
                {result.deployerReport.flags.length > 0 ? (
                  <div className="space-y-2 font-[family-name:var(--font-mono)] text-sm">
                    {result.deployerReport.flags.map((flag: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 bg-[#0A0C10] rounded p-3">
                        <span className="text-xs shrink-0" style={{ color: flagColor(flag.severity) }}>
                          [{flag.severity.toUpperCase()}]
                        </span>
                        <span className="text-[#B4B9C4]">{flag.message}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[#34D399] text-sm">
                    No red flags found on the deployer's own on-chain history.
                  </p>
                )}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </main>
  );
}
