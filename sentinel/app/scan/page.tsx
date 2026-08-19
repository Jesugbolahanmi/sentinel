import Link from "next/link";

export default function ScanSelector() {
  return (
    <main className="min-h-screen px-6 py-10 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="flex items-center gap-3 mb-2 justify-center">
          <span className="w-2 h-2 rounded-full bg-[#34D399] animate-blink" />
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#E6E8EC]">
            SENTINEL
          </h1>
        </div>
        <p className="text-[#7C8394] text-sm text-center mb-10">
          What would you like Sentinel to investigate?
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/scan/wallet"
            className="bg-[#12151C] border border-[#242938] hover:border-[#38BDF8] rounded p-6 text-center transition-colors"
          >
            <div className="font-[family-name:var(--font-mono)] text-[#38BDF8] text-sm mb-2">
              WALLET
            </div>
            <p className="text-[#7C8394] text-xs">
              Investigate a wallet's activity, threats, and history.
            </p>
          </Link>

          <Link
            href="/scan/token"
            className="bg-[#12151C] border border-[#242938] hover:border-[#38BDF8] rounded p-6 text-center transition-colors"
          >
            <div className="font-[family-name:var(--font-mono)] text-[#38BDF8] text-sm mb-2">
              TOKEN
            </div>
            <p className="text-[#7C8394] text-xs">
              Check if a token contract looks safe or suspicious.
            </p>
          </Link>

          <Link
            href="/scan/nft"
            className="bg-[#12151C] border border-[#242938] hover:border-[#38BDF8] rounded p-6 text-center transition-colors"
          >
            <div className="font-[family-name:var(--font-mono)] text-[#38BDF8] text-sm mb-2">
              NFT
            </div>
            <p className="text-[#7C8394] text-xs">
              Investigate an NFT collection or approval risk.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}