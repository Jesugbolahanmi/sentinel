import Link from "next/link";

export default function Landing() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full border border-[#38BDF8]/10 animate-radar" />
        <div className="absolute w-[500px] h-[500px] rounded-full border border-[#38BDF8]/10 animate-radar" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 text-center max-w-2xl">
        <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-[#242938] bg-[#12151C]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-blink" />
          <span className="font-[family-name:var(--font-mono)] text-xs text-[#7C8394]">
            LIVE ON BASE
          </span>
        </div>

        <h1 className="font-[family-name:var(--font-display)] text-6xl md:text-7xl font-bold text-[#E6E8EC] mb-4 tracking-tight">
          SENTINEL
        </h1>

        <p className="text-[#7C8394] text-lg mb-2 leading-relaxed">
          An AI incident response agent for Web3.
        </p>
        <p className="text-[#7C8394] mb-10 leading-relaxed">
          Give it a wallet. It investigates onchain activity, traces suspicious
          fund movement, and explains exactly what happened — backed by
          verifiable evidence, not guesswork.
        </p>

        <Link
          href="/scan"
          className="inline-flex items-center gap-2 bg-[#FFB020] hover:bg-[#ffc04d] text-black font-semibold px-8 py-4 rounded transition-colors font-[family-name:var(--font-mono)]"
        >
          $ enter_sentinel
        </Link>

        <div className="mt-16 grid grid-cols-3 gap-6 text-left">
          <div className="border-l-2 border-[#242938] pl-4">
            <div className="font-[family-name:var(--font-mono)] text-[#38BDF8] text-sm mb-1">
              01 — INVESTIGATE
            </div>
            <p className="text-[#7C8394] text-sm">
              Scans wallet history, approvals, and contract interactions.
            </p>
          </div>
          <div className="border-l-2 border-[#242938] pl-4">
            <div className="font-[family-name:var(--font-mono)] text-[#38BDF8] text-sm mb-1">
              02 — TRACE
            </div>
            <p className="text-[#7C8394] text-sm">
              Follows suspicious fund movement across wallets.
            </p>
          </div>
          <div className="border-l-2 border-[#242938] pl-4">
            <div className="font-[family-name:var(--font-mono)] text-[#38BDF8] text-sm mb-1">
              03 — REPORT
            </div>
            <p className="text-[#7C8394] text-sm">
              Delivers an evidence-linked threat assessment.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}