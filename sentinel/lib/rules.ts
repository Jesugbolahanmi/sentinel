import { supabase } from "./supabase";

export interface TokenDetail {
  asset: string;
  from: string;
  to?: string;
  timestamp: string; // ISO date string
  value?: string;
  hash?: string;
  blockNum?: string;
  metadata?: {
    blockTimestamp?: string;
    decimal?: string;
  };
}

export interface Flag {
  type: string;
  severity: "low" | "medium" | "high";
  message: string;
  details?: TokenDetail[];
}

export function checkWalletAge(transactions: any[]): Flag | null {
  if (transactions.length === 0) return null;

  const oldest = transactions[transactions.length - 1];
  const firstTxTime = parseInt(oldest.timeStamp) * 1000;
  const ageInDays = (Date.now() - firstTxTime) / (1000 * 60 * 60 * 24);

  if (ageInDays < 7) {
    return {
      type: "NEW_WALLET",
      severity: "medium",
      message: `Wallet is only ${Math.floor(ageInDays)} days old`,
    };
  }
  return null;
}

export function checkTransactionBurst(transactions: any[]): Flag | null {
  if (transactions.length < 5) return null;

  const recentFive = transactions.slice(0, 5);
  const timestamps = recentFive.map((tx) => parseInt(tx.timeStamp));
  const spreadSeconds = timestamps[0] - timestamps[4];

  if (spreadSeconds < 300) {
    return {
      type: "TRANSACTION_BURST",
      severity: "medium",
      message: `5 transactions occurred within ${Math.floor(spreadSeconds / 60)} minutes`,
    };
  }
  return null;
}

export function checkLargeOutflow(transactions: any[], address: string): Flag | null {
  const outgoing = transactions.filter(
    (tx) => tx.from.toLowerCase() === address.toLowerCase()
  );
  if (outgoing.length === 0) return null;

  // only treat native ETH transfers (18 decimals, no token asset name) as ETH outflows
  // avoids misreading a low-decimal or high-decimal token amount as billions of "ETH"
  const ethOutgoing = outgoing.filter((tx) => tx.decimal === 18 && !tx.asset);
  if (ethOutgoing.length === 0) return null;

  const largest = ethOutgoing.reduce((max: any, tx: any) =>
    BigInt(tx.value) > BigInt(max.value) ? tx : max
  );
  const valueInEth = Number(BigInt(largest.value)) / 1e18;

  if (valueInEth > 1) {
    return {
      type: "LARGE_OUTFLOW",
      severity: "high",
      message: `Large outgoing transfer of ${valueInEth.toFixed(4)} ETH detected`,
    };
  }
  return null;
}

export function checkPhishingTokenNames(transfers: any[]): Flag | null {
  const suspicious = transfers.filter((t) => {
    const asset = (t.asset || "").toLowerCase();
    return (
      asset.includes("http") ||
      asset.includes(".com") ||
      asset.includes(".net") ||
      asset.includes(".org") ||
      asset.includes("claim") ||
      asset.includes("check your")
    );
  });

  if (suspicious.length === 0) return null;

  // dangerous lure patterns: active links (t.me, http/https, URLs) or urgency language
  // these are HIGH regardless of count, since the risk is "will someone click this," not volume
  const hasActiveLure = suspicious.some((t) => {
    const asset = (t.asset || "").toLowerCase();
    return (
      asset.includes("t.me") ||
      asset.includes("http") ||
      asset.includes("claim until") ||
      asset.includes("claim before") ||
      /\*.*claim/.test(asset)
    );
  });

  const severity = hasActiveLure
    ? "high"
    : suspicious.length >= 10
    ? "high"
    : suspicious.length >= 3
    ? "medium"
    : "low";

  return {
    type: "PHISHING_AIRDROP",
    severity,
    message: `Received ${suspicious.length} token(s) with phishing-style names (e.g. "${suspicious[0].asset}")${hasActiveLure ? " — includes active scam links/urgency lures" : ""}`,
    details: suspicious.map((t) => ({
      asset: t.asset,
      from: t.from,
      timestamp: new Date(parseInt(t.timeStamp) * 1000).toISOString(),
    })),
  };
}

export async function runAllChecks(transactions: any[], address: string): Promise<Flag[]> {
  const flags: Flag[] = [];

  const ageFlag = checkWalletAge(transactions);
  if (ageFlag) flags.push(ageFlag);

  const burstFlag = checkTransactionBurst(transactions);
  if (burstFlag) flags.push(burstFlag);

  const outflowFlag = checkLargeOutflow(transactions, address);
  if (outflowFlag) flags.push(outflowFlag);

  const phishingFlag = checkPhishingTokenNames(transactions);
  if (phishingFlag) flags.push(phishingFlag);

  const dustingFlag = checkDustingPattern(transactions, address);
  if (dustingFlag) flags.push(dustingFlag);

  const blocklistFlag = await checkBlocklist(transactions);
  if (blocklistFlag) flags.push(blocklistFlag);

  return flags;
}

export function checkDustingPattern(transactions: any[], address: string): Flag | null {
  const outgoing = transactions.filter(
    (tx) => tx.from.toLowerCase() === address.toLowerCase()
  );

  if (outgoing.length < 5) return null;

  // group by approximate value (rounded to handle tiny variations) and by asset
  const valueGroups: Record<string, any[]> = {};

  for (const tx of outgoing) {
    const roundedValue = Math.round(Number(tx.value) * 1000) / 1000; // round to avoid float noise
    const key = `${tx.asset || "ETH"}_${roundedValue}`;
    if (!valueGroups[key]) valueGroups[key] = [];
    valueGroups[key].push(tx);
  }

  for (const key in valueGroups) {
    const group = valueGroups[key];
    const uniqueRecipients = new Set(group.map((tx) => tx.to.toLowerCase()));

    // same near-identical amount sent to 5+ distinct addresses = dusting pattern
    if (group.length >= 5 && uniqueRecipients.size >= 5) {
      return {
        type: "DUSTING_PATTERN",
        severity: "high",
        message: `Sent the same amount (${group[0].asset || "ETH"}) to ${uniqueRecipients.size} different addresses — a pattern typical of dusting/scam-tagging campaigns`,
        details: group.slice(0, 15).map((t) => ({
          asset: t.asset || "ETH",
          from: t.to, // showing recipient here since this flag is about outgoing spray
          timestamp: new Date(parseInt(t.timeStamp) * 1000).toISOString(),
        })),
      };
    }
  }

  return null;
}

export async function checkBlocklist(transactions: any[]): Promise<Flag | null> {
  const { data: blocklist, error } = await supabase.from("blocklist").select("address, reason");

  if (error || !blocklist || blocklist.length === 0) return null;

  const blockedSet = new Set(blocklist.map((b: any) => b.address.toLowerCase()));

  const matches = transactions.filter(
    (tx) =>
      blockedSet.has(tx.from?.toLowerCase()) || blockedSet.has(tx.to?.toLowerCase())
  );

  if (matches.length > 0) {
    const matchedAddress = blockedSet.has(matches[0].from?.toLowerCase())
      ? matches[0].from
      : matches[0].to;

    const reason = blocklist.find(
      (b: any) => b.address.toLowerCase() === matchedAddress.toLowerCase()
    )?.reason;

    return {
      type: "BLOCKLIST_MATCH",
      severity: "high",
      message: `Interacted with a known malicious address (${matchedAddress.slice(0, 6)}...${matchedAddress.slice(-4)}) — ${reason || "flagged by Sentinel"}`,
      details: matches.slice(0, 10).map((t) => ({
        asset: t.asset || "ETH",
        from: t.from,
        timestamp: new Date(parseInt(t.timeStamp) * 1000).toISOString(),
      })),
    };
  }

  return null;
}