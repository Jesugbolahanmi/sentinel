import { Flag } from "./rules";

export function checkTokenAge(firstTxTimestamp: number | null): Flag | null {
  if (!firstTxTimestamp) return null;

  const ageInDays = (Date.now() - firstTxTimestamp) / (1000 * 60 * 60 * 24);

  if (ageInDays < 3) {
    return {
      type: "NEW_TOKEN",
      severity: "medium",
      message: `Token contract was deployed only ${Math.floor(ageInDays)} day(s) ago — new tokens carry higher rug-pull risk.`,
    };
  }
  return null;
}

export function checkSuspiciousMetadata(metadata: any): Flag | null {
  const name = (metadata?.name || "").toLowerCase();
  const symbol = (metadata?.symbol || "").toLowerCase();
  const combined = `${name} ${symbol}`;

  const suspiciousPatterns = ["http", ".com", ".net", ".org", "claim", "t.me", "airdrop", "free"];
  const matched = suspiciousPatterns.some((p) => combined.includes(p));

  if (matched) {
    return {
      type: "SUSPICIOUS_TOKEN_METADATA",
      severity: "high",
      message: `This token's own name/symbol contains scam-style language or links — a strong indicator it's a phishing token, not a legitimate asset. (Name: "${metadata?.name}", Symbol: "${metadata?.symbol}")`,
    };
  }
  return null;
}

export function checkMissingMetadata(metadata: any): Flag | null {
  if (!metadata || (!metadata.name && !metadata.symbol)) {
    return {
      type: "MISSING_METADATA",
      severity: "medium",
      message: "This token has no name or symbol set — often a sign of an unfinished or low-effort deployment.",
    };
  }
  return null;
}

export function runTokenChecks(metadata: any, firstTxTimestamp: number | null): Flag[] {
  const flags: Flag[] = [];
  
 const suspiciousFlag = checkSuspiciousMetadata(metadata);
  if (suspiciousFlag) flags.push(suspiciousFlag);

  const metadataFlag = checkMissingMetadata(metadata);
  if (metadataFlag) flags.push(metadataFlag);

  const ageFlag = checkTokenAge(firstTxTimestamp);
  if (ageFlag) flags.push(ageFlag);

  return flags;
}

