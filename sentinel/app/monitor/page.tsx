"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";

export default function Monitor() {
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { address: walletAddress, isConnected } = useAccount();

  async function handleWatch() {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await fetch("/api/monitor-add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSuccess(true);
        setAddress("");
        setEmail("");
      }
    } catch (err) {
      setError("Failed to reach the server");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="font-[family-name:var(--font-mono)] text-xs text-[#7C8394] hover:text-[#E6E8EC] transition-colors mb-8 inline-block"
        >
          ← back
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <span className="w-2 h-2 rounded-full bg-[#34D399] animate-blink" />
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#E6E8EC]">
            SENTINEL
          </h1>
          <span className="font-[family-name:var(--font-mono)] text-xs text-[#7C8394]">
            / monitor
          </span>
        </div>
        <p className="text-[#7C8394] text-sm mb-8">
          Sentinel will re-scan this wallet automatically and email you the moment something new is detected.
        </p>

        <div className="bg-[#12151C] border border-[#242938] rounded p-6 space-y-4">
          <div>
            <label className="font-[family-name:var(--font-mono)] text-xs text-[#7C8394] block mb-2">
              WALLET_ADDRESS
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={isConnected ? walletAddress : "0x..."}
              className="w-full bg-[#0A0C10] border border-[#242938] rounded px-4 py-3 text-[#E6E8EC] placeholder-[#4a5063] font-[family-name:var(--font-mono)] text-sm focus:outline-none focus:border-[#38BDF8] transition-colors"
            />
            {isConnected ? (
              <button
                onClick={() => setAddress(walletAddress || "")}
                className="text-xs text-[#38BDF8] mt-1 hover:underline font-[family-name:var(--font-mono)]"
              >
                use connected wallet
              </button>
            ) : null}
          </div>

          <div>
            <label className="font-[family-name:var(--font-mono)] text-xs text-[#7C8394] block mb-2">
              ALERT_EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-[#0A0C10] border border-[#242938] rounded px-4 py-3 text-[#E6E8EC] placeholder-[#4a5063] font-[family-name:var(--font-mono)] text-sm focus:outline-none focus:border-[#38BDF8] transition-colors"
            />
          </div>

          <button
            onClick={handleWatch}
            disabled={loading || !address || !email}
            className="w-full bg-[#FFB020] hover:bg-[#ffc04d] disabled:bg-[#242938] disabled:text-[#4a5063] disabled:cursor-not-allowed text-black rounded px-6 py-3 font-semibold font-[family-name:var(--font-mono)] text-sm transition-colors"
          >
            {loading ? "ADDING..." : "$ watch --wallet"}
          </button>

          {success ? (
            <div className="bg-[#34D399]/10 border border-[#34D399]/30 rounded p-3 text-[#34D399] text-sm font-[family-name:var(--font-mono)]">
              ✓ Wallet added to watchlist. You will be alerted by email if new threats are detected.
            </div>
          ) : null}

          {error ? (
            <div className="bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded p-3 text-[#FF3B3B] text-sm font-[family-name:var(--font-mono)]">
              ERROR: {error}
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}