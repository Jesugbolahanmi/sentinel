import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Sentinel — AI Web3 Incident Response",
  description: "An AI-powered incident response agent for Web3. Scan wallets, tokens, and NFT collections on Base for onchain threats, suspicious approvals, and fund trail risks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} bg-[#050505] m-0 p-0`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}