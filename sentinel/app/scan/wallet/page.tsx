"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAccount, useConnect, useDisconnect } from "wagmi";

const INVESTIGATION_STEPS = [
  "Connecting to Base network...",
  "Fetching wallet transaction history...",
  "Scanning for suspicious approvals...",
  "Checking for phishing patterns...",
  "Analyzing with AI reasoning engine...",
  "Compiling threat report...",
];

export default function Scan() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [displayScore, setDisplayScore] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { address: walletAddress, isConnected } = useAccount();
  const { connectors, connect } = useConnect();
  const { disconnect } = useDisconnect();

  const [chatMessages, setChatMessages] = useState<{ role: string; content: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading) return;
    setCurrentStep(0);
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= INVESTIGATION_STEPS.length - 1) {
          clearInterval(interval);
          return prev;
        }
        return prev + 1;
      });
    }, 700);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!result) return;
    setDisplayScore(0);
    setChatMessages([]);
    const timer = setTimeout(() => setDisplayScore(result.report.riskScore), 100);
    return () => clearTimeout(timer);
  }, [result]);

  async function handleInvestigate() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/investigate", {
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

  async function handleChatSend() {
    if (!chatInput.trim() || !result) return;
    const userMessage = chatInput.trim();
    setChatInput("");
    const newMessages = [...chatMessages, { role: "user", content: userMessage }];
    setChatMessages(newMessages);
    setChatLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          context: {
            address: result.address,
            riskScore: result.report.riskScore,
            threatLevel: result.report.threatLevel,
            summary: result.report.summary,
            flags: result.flags,
          },
          history: chatMessages,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setChatMessages([...newMessages, { role: "assistant", content: data.reply }]);
      } else {
        setChatMessages([...newMessages, { role: "assistant", content: "Sorry, I couldn't process that." }]);
      }
    } catch (err) {
      setChatMessages([...newMessages, { role: "assistant", content: "Failed to reach the server." }]);
    } finally {
      setChatLoading(false);
    }
  }

  const severityColor = (level: string) => {
    if (level === "CRITICAL" || level === "HIGH") return "#FF3B3B";
    if (level === "MEDIUM") return "#FFB020";
    return "#34D399";
  };

  const circumference = 2 * Math.PI * 54;

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="font-[family-name:var(--font-mono)] text-xs text-[#7C8394] hover:text-[#E6E8EC] transition-colors mb-8 inline-block"
        >
          ← back
        </Link>

        <div className="flex justify-end mb-4">
          {!mounted ? null : isConnected ? (
            <div className="flex items-center gap-3 bg-[#12151C] border border-[#242938] rounded px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-[#34D399]" />
              <span className="font-[family-name:var(--font-mono)] text-xs text-[#B4B9C4]">
                {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-4)}
              </span>
              <button
                onClick={() => disconnect()}
                className="text-xs text-[#7C8394] hover:text-[#FF3B3B] transition-colors ml-2"
              >
                disconnect
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              {connectors.map((connector) => (
                <button
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  className="bg-[#12151C] border border-[#242938] hover:border-[#38BDF8] rounded px-4 py-2 text-xs font-[family-name:var(--font-mono)] text-[#B4B9C4] transition-colors"
                >
                  {connector.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mb-8">
          <span className="w-2 h-2 rounded-full bg-[#34D399] animate-blink" />
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#E6E8EC]">
            SENTINEL
          </h1>
          <span className="font-[family-name:var(--font-mono)] text-xs text-[#7C8394]">
            / scan
          </span>
        </div>

        <div className="bg-[#12151C] border border-[#242938] rounded p-4 mb-6">
          <div className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-sm text-[#38BDF8] mb-2">
            <span>$</span>
            <span>scan --wallet</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
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

        {loading && (
          <div className="bg-[#12151C] border border-[#242938] rounded p-6 mb-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full border border-[#38BDF8]/20 animate-radar" />
            <div className="space-y-2 font-[family-name:var(--font-mono)] text-sm relative z-10">
              {INVESTIGATION_STEPS.map((step, i) => (
                <div
                  key={i}
                  className={"flex items-center gap-3 transition-opacity duration-300 " + (i <= currentStep ? "opacity-100" : "opacity-30")}
                >
                  <span className="w-4 text-[#38BDF8]">
                    {i < currentStep ? "✓" : i === currentStep ? ">" : " "}
                  </span>
                  <span className={i === currentStep ? "text-[#E6E8EC]" : "text-[#7C8394]"}>
                    {step}
                    {i === currentStep && <span className="animate-blink">_</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded p-4 mb-6 text-[#FF3B3B] font-[family-name:var(--font-mono)] text-sm">
            ERROR: {error}
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4">
            <div className="bg-[#12151C] border border-[#242938] rounded p-6 flex items-center gap-6">
              <svg width="120" height="120" className="shrink-0 -rotate-90">
                <circle cx="60" cy="60" r="54" fill="none" stroke="#242938" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="54" fill="none"
                  stroke={severityColor(result.report.threatLevel)}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (displayScore / 100) * circumference}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s ease-out" }}
                />
                <text
                  x="60" y="60" textAnchor="middle" dominantBaseline="middle"
                  fill="#E6E8EC" fontSize="24" fontWeight="bold"
                  transform="rotate(90 60 60)"
                  className="font-[family-name:var(--font-mono)]"
                >
                  {displayScore}
                </text>
              </svg>
              <div>
                <span
                  className="inline-block px-3 py-1 rounded text-xs font-bold font-[family-name:var(--font-mono)] mb-3"
                  style={{
                    color: severityColor(result.report.threatLevel),
                    backgroundColor: `${severityColor(result.report.threatLevel)}1A`,
                  }}
                >
                  {result.report.threatLevel}
                </span>
                <p className="text-[#B4B9C4] text-sm leading-relaxed">
                  {result.report.summary}
                </p>
              </div>
            </div>

              <Link
              href={`/monitor?address=${address}`}
              className="inline-flex items-center gap-2 bg-[#12151C] hover:bg-[#1a1e28] border border-[#242938] hover:border-[#38BDF8] text-[#38BDF8] rounded px-4 py-2 text-sm font-semibold font-[family-name:var(--font-mono)] transition-colors"
            >
              $ monitor --wallet →
            </Link>

            {result.report.recommendations && (
              <div className="bg-[#12151C] border border-[#242938] rounded p-6">
                <h3 className="font-[family-name:var(--font-mono)] text-xs text-[#7C8394] mb-3">
                  RECOMMENDED_ACTIONS
                </h3>
                <ul className="space-y-2">
                  {result.report.recommendations.map((rec: string, i: number) => (
                    <li key={i} className="text-[#B4B9C4] text-sm flex gap-2">
                      <span className="text-[#FFB020] font-[family-name:var(--font-mono)]">→</span>
                      {rec}
                    </li>
                  ))}
                </ul>
                {result.report.revokeUrl ? (
                    <a
                    href={result.report.revokeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 bg-[#FF3B3B] hover:bg-[#ff5c5c] text-white rounded px-4 py-2 text-sm font-semibold font-[family-name:var(--font-mono)] transition-colors"
                  >
                    revoke_approvals →
                  </a>
                ) : null}
              </div>
            )}

            {result.flags && result.flags.length > 0 && (
              <div className="bg-[#12151C] border border-[#242938] rounded p-6">
                <h3 className="font-[family-name:var(--font-mono)] text-xs text-[#7C8394] mb-3">
                  DETECTED_FLAGS [{result.flags.length}]
                </h3>
                <div className="space-y-3 font-[family-name:var(--font-mono)] text-sm">
                  {result.flags.map((flag: any, i: number) => (
                    <div key={i} className="bg-[#0A0C10] rounded p-3">
                      <div className="flex items-start gap-3">
                        <span
                          className="text-xs shrink-0"
                          style={{ color: flag.severity === "high" ? "#FF3B3B" : flag.severity === "medium" ? "#FFB020" : "#7C8394" }}
                        >
                          [{flag.severity.toUpperCase()}]
                        </span>
                        <span className="text-[#B4B9C4]">{flag.message}</span>
                      </div>
                      {flag.details && flag.details.length > 0 ? (
                        <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                          {flag.details.slice(0, 15).map((d: any, j: number) => {
                            const timestamp = new Date(d.timestamp);
                            const timeString = timestamp.toLocaleString();
                            return (
                              <div key={j} className="bg-[#12151C] rounded p-2 border border-[#242938]">
                                <div className="flex justify-between items-start gap-2 mb-1">
                                  <span className="text-[#FFB020] font-bold">{d.asset}</span>
                                  <span className="text-xs text-[#7C8394]">{timeString}</span>
                                </div>
                                <div className="text-xs space-y-1 text-[#B4B9C4]">
                                  <div className="flex justify-between">
                                    <span className="text-[#7C8394]">FROM:</span>
                                    <a href={`https://basescan.org/address/${d.from}`} target="_blank" rel="noopener noreferrer" className="text-[#38BDF8] hover:underline">
                                      {d.from}
                                    </a>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-[#7C8394]">TO:</span>
                                    <span>{address}</span>
                                  </div>
                                  {d.value ? (
                                    <div className="flex justify-between">
                                      <span className="text-[#7C8394]">VALUE:</span>
                                      <span>{d.value}</span>
                                    </div>
                                  ) : null}
                                  {d.hash ? (
                                    <div className="flex justify-between">
                                      <span className="text-[#7C8394]">HASH:</span>
                                      <a href={`https://basescan.org/tx/${d.hash}`} target="_blank" rel="noopener noreferrer" className="text-[#38BDF8] hover:underline truncate max-w-xs">
                                        {d.hash.slice(0, 10)}...{d.hash.slice(-8)}
                                      </a>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                          {flag.details.length > 15 ? (
                            <div className="text-xs text-[#4a5063] p-2 text-center">
                              +{flag.details.length - 15} more token transfers
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.trail && result.trail.length > 0 && (
              <div className="bg-[#12151C] border border-[#242938] rounded p-6">
                <h3 className="font-[family-name:var(--font-mono)] text-xs text-[#7C8394] mb-4">
                  FUND_TRACE_ANALYSIS
                </h3>
                <div className="space-y-3 font-[family-name:var(--font-mono)] text-xs">
                  {result.trail.map((hop: any, i: number) => (
                    <div key={i} className="bg-[#0A0C10] border border-[#242938] rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[#7C8394]">HOP {i + 1}</span>
                        {hop.outflowTo ? <span className="text-[#FF3B3B]">OUTFLOW DETECTED</span> : null}
                      </div>
                      <div className="space-y-1 text-[#B4B9C4]">
                        <div className="flex justify-between">
                          <span className="text-[#7C8394]">ADDRESS:</span>
                          <a href={`https://basescan.org/address/${hop.address}`} target="_blank" rel="noopener noreferrer" className="text-[#38BDF8] hover:underline">
                            {hop.address}
                          </a>
                        </div>
                        {hop.outflowTo ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-[#7C8394]">SENT_TO:</span>
                              <a href={`https://basescan.org/address/${hop.outflowTo}`} target="_blank" rel="noopener noreferrer" className="text-[#38BDF8] hover:underline">
                                {hop.outflowTo}
                              </a>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#7C8394]">AMOUNT:</span>
                              <span className="text-[#FF3B3B] font-bold">{hop.outflowAmount} ETH</span>
                            </div>
                          </>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-[#12151C] border border-[#242938] rounded p-6">
              <h3 className="font-[family-name:var(--font-mono)] text-xs text-[#7C8394] mb-3">
                ASK_SENTINEL
              </h3>

              {chatMessages.length > 0 ? (
                <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={msg.role === "user" ? "flex justify-end" : "flex justify-start"}
                    >
                      <div
                        className={
                          "max-w-[85%] rounded p-3 text-sm " +
                          (msg.role === "user"
                            ? "bg-[#38BDF8]/10 text-[#E6E8EC]"
                            : "bg-[#0A0C10] text-[#B4B9C4] border border-[#242938]")
                        }
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                  {chatLoading ? (
                    <div className="flex justify-start">
                      <div className="bg-[#0A0C10] border border-[#242938] rounded p-3 text-sm text-[#7C8394] font-[family-name:var(--font-mono)]">
                        thinking<span className="animate-blink">...</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <p className="text-[#4a5063] text-sm mb-4">
                  Ask Sentinel a follow-up question about this investigation — e.g. "should I be worried?" or "what does the outflow mean?"
                </p>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleChatSend()}
                  placeholder="Ask a question..."
                  disabled={chatLoading}
                  className="flex-1 bg-[#0A0C10] border border-[#242938] rounded px-4 py-2 text-[#E6E8EC] placeholder-[#4a5063] font-[family-name:var(--font-mono)] text-sm focus:outline-none focus:border-[#38BDF8] transition-colors"
                />
                <button
                  onClick={handleChatSend}
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-[#38BDF8] hover:bg-[#5fd1ff] disabled:bg-[#242938] disabled:text-[#4a5063] disabled:cursor-not-allowed text-black rounded px-4 py-2 text-sm font-semibold font-[family-name:var(--font-mono)] transition-colors"
                >
                  SEND
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}