import Link from "next/link";
import { Wallet, Coins, Image as ImageIcon, ChevronLeft } from "lucide-react";

export default function ScanSelector() {
  return (
    <main className="min-h-screen px-6 py-10 flex flex-col items-center justify-center relative overflow-hidden bg-[#050505]">
      {/* Background Cyber-grid */}
      <div className="absolute inset-0 z-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#38BDF8] opacity-10 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-4xl w-full relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <Link
          href="/"
          className="group flex items-center gap-2 font-[family-name:var(--font-mono)] text-xs text-[#7C8394] hover:text-[#38BDF8] transition-colors mb-12 w-fit mx-auto"
        >
          <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          RETURN HOME
        </Link>

        <div className="flex flex-col items-center gap-4 mb-12 text-center">
          <div className="relative flex items-center justify-center w-4 h-4 mb-2">
            <span className="absolute w-full h-full rounded-full bg-[#34D399] opacity-75 animate-ping" />
            <span className="relative w-3 h-3 rounded-full bg-[#34D399]" />
          </div>
          <h1 className="font-[family-name:var(--font-display)] text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#7C8394] tracking-tight">
            SELECT INVESTIGATION TARGET
          </h1>
          <p className="text-[#7C8394] text-base md:text-lg max-w-lg mx-auto">
            Choose an entity for Sentinel to analyze. All reports are generated using deterministic onchain data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/scan/wallet"
            className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#38BDF8]/50 hover:bg-white/10 rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(56,189,248,0.3)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#38BDF8]/0 to-[#38BDF8]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 mx-auto bg-black/40 border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:border-[#38BDF8]/30">
              <Wallet size={32} className="text-[#38BDF8]" />
            </div>
            <div className="font-[family-name:var(--font-mono)] text-white text-lg mb-3 font-bold tracking-wider">
              WALLET
            </div>
            <p className="text-[#7C8394] text-sm leading-relaxed">
              Investigate a wallet's activity, approvals, phishing threats, and fund flow history.
            </p>
          </Link>

          <Link
            href="/scan/token"
            className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#38BDF8]/50 hover:bg-white/10 rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(56,189,248,0.3)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#38BDF8]/0 to-[#38BDF8]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 mx-auto bg-black/40 border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:border-[#38BDF8]/30">
              <Coins size={32} className="text-[#38BDF8]" />
            </div>
            <div className="font-[family-name:var(--font-mono)] text-white text-lg mb-3 font-bold tracking-wider">
              TOKEN
            </div>
            <p className="text-[#7C8394] text-sm leading-relaxed">
              Analyze a token contract for honey-pots, liquidity risks, and structural threats.
            </p>
          </Link>

          <Link
            href="/scan/nft"
            className="group bg-white/5 backdrop-blur-xl border border-white/10 hover:border-[#38BDF8]/50 hover:bg-white/10 rounded-2xl p-8 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(56,189,248,0.3)] relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-[#38BDF8]/0 to-[#38BDF8]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 mx-auto bg-black/40 border border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform group-hover:border-[#38BDF8]/30">
              <ImageIcon size={32} className="text-[#38BDF8]" />
            </div>
            <div className="font-[family-name:var(--font-mono)] text-white text-lg mb-3 font-bold tracking-wider">
              NFT
            </div>
            <p className="text-[#7C8394] text-sm leading-relaxed">
              Investigate an NFT collection's deployer footprint and contract approval risks.
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}