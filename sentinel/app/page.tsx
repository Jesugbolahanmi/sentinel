"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  ShieldCheck, Search, Activity, ChevronRight, Zap, 
  AlertTriangle, Eye, TrendingUp, Cpu,
  Shield
} from "lucide-react";

const THREAT_FEED = [
  { time: "00:03", type: "HIGH", msg: "Unlimited approval to unverified contract detected" },
  { time: "00:07", type: "CRIT", msg: "Wallet drained via EIP-2612 permit exploit" },
  { time: "00:12", type: "MED",  msg: "Honeypot token identified, sell function disabled" },
  { time: "00:18", type: "HIGH", msg: "Cross-chain bridge phishing attempt flagged" },
  { time: "00:24", type: "CRIT", msg: "EOA approved as spender, private key risk" },
  { time: "00:31", type: "MED",  msg: "Suspicious deployer reused across 14 contracts" },
  { time: "00:38", type: "HIGH", msg: "NFT collection minted from flagged wallet cluster" },
];



const HOW_IT_WORKS = [
  {
    step: "01",
    title: "You provide an address",
    desc: "Wallet, token contract, or NFT collection — Sentinel accepts all three. No account needed.",
    icon: Search,
    color: "#38BDF8",
  },
  {
    step: "02",
    title: "Sentinel investigates onchain",
    desc: "Reads real Approval events, traces fund movement, checks deployer history, queries live market data on Base.",
    icon: Cpu,
    color: "#FFB020",
  },
  {
    step: "03",
    title: "Threats are scored & explained",
    desc: "Every flag is backed by a transaction hash. A deterministic risk score is computed.",
    icon: ShieldCheck,
    color: "#A855F7",
  },
  {
    step: "04",
    title: "You act before it's too late",
    desc: "Revoke dangerous approvals, monitor wallets for ongoing activity, and get actionable mitigation steps.",
    icon: TrendingUp,
    color: "#34D399",
  },
];

export default function Landing() {
  const [feedIndex, setFeedIndex] = useState(0);
  const [visibleFeed, setVisibleFeed] = useState(THREAT_FEED.slice(0, 4));
  const [tick, setTick] = useState(0);

  // Rotate threat feed every 2.5s
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const next = (feedIndex + 1) % THREAT_FEED.length;
    setFeedIndex(next);
    setVisibleFeed(prev => [THREAT_FEED[next], ...prev.slice(0, 3)]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  const threatColor = (type: string) => {
    if (type === "CRIT") return "#FF3B3B";
    if (type === "HIGH") return "#FFB020";
    return "#38BDF8";
  };

  return (
    <div className="bg-[#050505] text-[#E6E8EC] overflow-x-hidden">

      {/* ═══════════════════════════════════════════
          SECTION 1 — HERO (full-screen, tells a story)
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 pt-24 pb-16 overflow-hidden">
        
        {/* Background layers */}
        <div className="absolute inset-0 z-0 bg-[url('/grid.svg')] bg-center opacity-10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-[#38BDF8] opacity-[0.07] blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#A855F7] opacity-[0.04] blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#FFB020] opacity-[0.03] blur-[100px] rounded-full pointer-events-none" />

        {/* Radar rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
          <div className="w-[600px] h-[600px] rounded-full border border-[#38BDF8]/30 animate-radar" />
          <div className="absolute w-[600px] h-[600px] rounded-full border border-[#38BDF8]/20 animate-radar" style={{ animationDelay: "1.3s" }} />
          <div className="absolute w-[350px] h-[350px] rounded-full border border-[#38BDF8]/10 animate-radar" style={{ animationDelay: "0.6s" }} />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 mb-10 px-4 py-1.5 rounded-full border border-[#38BDF8]/30 bg-[#38BDF8]/10 backdrop-blur-md shadow-[0_0_20px_rgba(56,189,248,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34D399]" />
            </span>
            <span className="font-[family-name:var(--font-mono)] text-xs text-[#38BDF8] tracking-widest uppercase font-semibold">
              LIVE ON BASE NETWORK
            </span>
          </div>

          {/* Big headline */}
          <h1 className="font-[family-name:var(--font-display)] text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-[#E6E8EC] to-[#38BDF8]/60 mb-6 tracking-tight leading-none">
            SENTINEL
          </h1>

          {/* Sub-headline — narrative hook */}
          <p className="text-[#B4B9C4] text-lg sm:text-xl md:text-2xl mb-4 leading-relaxed font-light max-w-2xl mx-auto">
            Every wallet has a story. Most people never know theirs.
          </p>
          <p className="text-[#7C8394] text-sm sm:text-base mb-12 leading-relaxed max-w-xl mx-auto">
            Sentinel reads the onchain truth like approvals, permits, fund trails, and contract risks, and tells you exactly what happened before it&apos;s too late.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/scan"
              className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#38BDF8] to-[#0ea5e9] hover:from-[#0ea5e9] hover:to-[#0284c7] text-black font-bold px-8 sm:px-10 py-4 sm:py-5 rounded-2xl transition-all font-[family-name:var(--font-mono)] text-base sm:text-lg shadow-[0_0_30px_rgba(56,189,248,0.35)] hover:shadow-[0_0_55px_rgba(56,189,248,0.6)] hover:-translate-y-1 w-full sm:w-auto justify-center"
            >
              <Zap size={20} className="group-hover:animate-pulse" />
              ENTER_SENTINEL
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-[#B4B9C4] font-bold px-8 py-4 rounded-2xl transition-all font-[family-name:var(--font-mono)] text-sm w-full sm:w-auto justify-center"
            >
              SEE HOW IT WORKS
            </a>
          </div>

          {/* Live Threat Feed teaser */}
          <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-5 max-w-xl mx-auto text-left shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#7C8394] uppercase tracking-widest flex items-center gap-2">
                <Activity size={10} className="animate-pulse text-[#FF3B3B]" /> LIVE THREAT FEED BASE NETWORK
              </span>
              <span className="text-[10px] font-[family-name:var(--font-mono)] text-[#4a5063] bg-black/60 px-2 py-0.5 rounded">SIMULATED</span>
            </div>
            <div className="space-y-2 overflow-hidden">
              {visibleFeed.map((item, i) => (
                <div
                  key={`${item.time}-${i}`}
                  className={"flex items-start gap-3 font-[family-name:var(--font-mono)] text-xs transition-all duration-500 " + (i === 0 ? "opacity-100" : i === 1 ? "opacity-70" : i === 2 ? "opacity-40" : "opacity-20")}
                >
                  <span className="text-[#4a5063] shrink-0 tabular-nums">{item.time}</span>
                  <span
                    className="px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0"
                    style={{ color: threatColor(item.type), backgroundColor: `${threatColor(item.type)}15`, border: `1px solid ${threatColor(item.type)}30` }}
                  >
                    {item.type}
                  </span>
                  <span className="text-[#7C8394] leading-relaxed">{item.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#7C8394] uppercase tracking-widest">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#38BDF8] to-transparent animate-pulse" />
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 2 — THE STORY (narrative paragraph)
      ══════════════════════════════════════════════ */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#080B10] to-[#050505] pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 mb-8 px-3 py-1 rounded-full bg-[#FF3B3B]/10 border border-[#FF3B3B]/20">
            <AlertTriangle size={12} className="text-[#FF3B3B]" />
            <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#FF3B3B] uppercase tracking-widest">The Reality Check</span>
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">
            Most wallet hacks happen<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF3B3B] to-[#FFB020]">
              months before the victim notices.
            </span>
          </h2>
          <p className="text-[#7C8394] text-base sm:text-lg leading-relaxed mb-6">
            A single unlimited approval. A DAI-style permit signed in a hurry. A token contract with
            a disabled sell function. These are the breadcrumbs that drain wallets silently while
            explorers show nothing unusual.
          </p>
          <p className="text-[#B4B9C4] text-base sm:text-lg leading-relaxed">
            Sentinel was built to read those breadcrumbs before they become a crime scene.
          </p>
        </div>
      </section>



      {/* ═══════════════════════════════════════════
          SECTION 4 — HOW IT WORKS
      ══════════════════════════════════════════════ */}
      <section id="how-it-works" className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#38BDF8] opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-[#38BDF8]/10 border border-[#38BDF8]/20">
              <Cpu size={12} className="text-[#38BDF8]" />
              <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#38BDF8] uppercase tracking-widest">How Sentinel Works</span>
            </div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold text-white">
              Investigation, not speculation.
            </h2>
            <p className="text-[#7C8394] text-base sm:text-lg mt-4 max-w-xl mx-auto">
              Every step Sentinel takes is deterministic, tied to real transaction hashes on Base.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc, icon: Icon, color }) => (
              <div
                key={step}
                className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 hover:bg-white/10 hover:border-white/20 transition-all group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-10 pointer-events-none" style={{ backgroundColor: color }} />
                <div className="flex items-start gap-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${color}15`, border: `1px solid ${color}30` }}
                  >
                    <Icon size={22} style={{ color }} />
                  </div>
                  <div>
                    <div className="font-[family-name:var(--font-mono)] text-xs mb-2 font-bold tracking-widest" style={{ color }}>
                      STEP {step}
                    </div>
                    <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-white mb-2">{title}</h3>
                    <p className="text-[#7C8394] text-sm leading-relaxed">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 5 — SCAN TYPES
      ══════════════════════════════════════════════ */}
      <section className="py-24 sm:py-32 px-4 sm:px-6 bg-black/30 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-bold text-white mb-4">
              Three lenses. One truth.
            </h2>
            <p className="text-[#7C8394] text-base max-w-lg mx-auto">
              Whether you&apos;re a DeFi trader, NFT collector, or building on Base, Sentinel has you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
            {[
              {
                href: "/scan/wallet",
                accent: "#38BDF8",
                label: "WALLET SCAN",
                title: "Full wallet forensics",
                desc: "Approvals, permits, fund flows, risk score, the complete onchain picture for any address.",
                icon: Shield,
              },
              {
                href: "/scan/token",
                accent: "#FFB020",
                label: "TOKEN SCAN",
                title: "Contract integrity audit",
                desc: "Honeypot detection, liquidity analysis, market data before you ape in.",
                icon: TrendingUp,
              },
              {
                href: "/scan/nft",
                accent: "#A855F7",
                label: "NFT SCAN",
                title: "Collection risk profile",
                desc: "Deployer history, ownership concentration, and collection-level threat flags.",
                icon: Eye,
              },
            ].map(({ href, accent, label, title, desc, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all overflow-hidden flex flex-col"
                style={{ ["--accent" as string]: accent }}
              >
                <div className="absolute top-0 right-0 w-28 h-28 blur-3xl rounded-full opacity-10 pointer-events-none" style={{ backgroundColor: accent }} />
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}30` }}
                >
                  <Icon size={22} style={{ color: accent }} />
                </div>
                <span className="font-[family-name:var(--font-mono)] text-[10px] font-bold tracking-widest mb-2" style={{ color: accent }}>
                  {label}
                </span>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-[#7C8394] text-sm leading-relaxed flex-1">{desc}</p>
                <div className="flex items-center gap-1 mt-5 font-[family-name:var(--font-mono)] text-xs font-bold transition-colors" style={{ color: accent }}>
                  SCAN NOW <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          SECTION 6 — FINAL CTA
      ══════════════════════════════════════════════ */}
      <section className="relative py-28 sm:py-40 px-4 sm:px-6 text-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#38BDF8] opacity-[0.06] blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 pointer-events-none" />
        
        <div className="max-w-2xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 mb-8 px-3 py-1 rounded-full bg-[#34D399]/10 border border-[#34D399]/20">
            <ShieldCheck size={12} className="text-[#34D399]" />
            <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#34D399] uppercase tracking-widest">Your assets are at risk right now</span>
          </div>
          <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            The investigation<br />starts with one address.
          </h2>
          <p className="text-[#7C8394] text-base sm:text-lg mb-10 leading-relaxed">
            No signup. No wallet connection required. Just paste an address and let Sentinel 
            do what blockchains can&apos;t hide.
          </p>
          <Link
            href="/scan"
            className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#38BDF8] to-[#0ea5e9] hover:from-[#0ea5e9] hover:to-[#0284c7] text-black font-bold px-10 py-5 rounded-2xl transition-all font-[family-name:var(--font-mono)] text-lg shadow-[0_0_40px_rgba(56,189,248,0.35)] hover:shadow-[0_0_60px_rgba(56,189,248,0.6)] hover:-translate-y-1"
          >
            <Zap size={20} className="group-hover:animate-pulse" />
            ENTER_SENTINEL
            <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-10 sm:py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-3 h-3">
              <span className="absolute w-full h-full rounded-full bg-[#38BDF8] opacity-75 animate-ping" />
              <span className="relative w-2 h-2 rounded-full bg-[#38BDF8]" />
            </div>
            <span className="font-[family-name:var(--font-display)] font-bold text-white tracking-widest text-sm">SENTINEL</span>
            <span className="font-[family-name:var(--font-mono)] text-[10px] text-[#4a5063] bg-white/5 border border-white/10 px-2 py-0.5 rounded">v1.0 BASE</span>
          </div>
          <p className="font-[family-name:var(--font-mono)] text-[11px] text-[#4a5063] text-center">
            Built for every onchain normie, guru or new.
          </p>
          <div className="flex items-center gap-4 font-[family-name:var(--font-mono)] text-[11px] text-[#4a5063]">
            <Link href="/scan/wallet" className="hover:text-[#38BDF8] transition-colors">WALLET</Link>
            <span>/</span>
            <Link href="/scan/token" className="hover:text-[#FFB020] transition-colors">TOKEN</Link>
            <span>/</span>
            <Link href="/scan/nft" className="hover:text-[#A855F7] transition-colors">NFT</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}