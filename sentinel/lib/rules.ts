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

export function runAllChecks(transactions: any[], address: string): Flag[] {
  const flags: Flag[] = [];

  const ageFlag = checkWalletAge(transactions);
  if (ageFlag) flags.push(ageFlag);

  const burstFlag = checkTransactionBurst(transactions);
  if (burstFlag) flags.push(burstFlag);

  const outflowFlag = checkLargeOutflow(transactions, address);
  if (outflowFlag) flags.push(outflowFlag);

  const phishingFlag = checkPhishingTokenNames(transactions);
  if (phishingFlag) flags.push(phishingFlag);

  return flags;
}