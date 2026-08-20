import { Flag } from "./rules";

export function checkNFTContractType(metadata: any): Flag | null {
  const tokenType = metadata?.tokenType;
  if (!tokenType || tokenType === "UNKNOWN") {
    return {
      type: "UNKNOWN_CONTRACT_TYPE",
      severity: "medium",
      message: "This contract doesn't clearly implement a standard NFT interface (ERC-721/1155) — verify it's genuinely an NFT collection before interacting.",
    };
  }
  return null;
}

export function checkMissingCollectionInfo(metadata: any): Flag | null {
  const name = metadata?.name || metadata?.openSeaMetadata?.collectionName;
  if (!name) {
    return {
      type: "MISSING_COLLECTION_INFO",
      severity: "medium",
      message: "This contract has no collection name set — often a sign of an incomplete, low-effort, or freshly-deployed collection.",
    };
  }
  return null;
}

export function checkSuspiciousCollectionName(metadata: any): Flag | null {
  const name = (metadata?.name || metadata?.openSeaMetadata?.collectionName || "").toLowerCase();
  const suspiciousPatterns = ["http", ".com", ".net", ".org", "claim", "t.me", "airdrop", "free mint"];
  const matched = suspiciousPatterns.some((p) => name.includes(p));

  if (matched) {
    return {
      type: "SUSPICIOUS_COLLECTION_NAME",
      severity: "high",
      message: `This collection's name contains scam-style language or links — a strong phishing indicator. (Name: "${metadata?.name}")`,
    };
  }
  return null;
}

export function runNFTChecks(metadata: any): Flag[] {
  const flags: Flag[] = [];

  const suspiciousFlag = checkSuspiciousCollectionName(metadata);
  if (suspiciousFlag) flags.push(suspiciousFlag);

  const typeFlag = checkNFTContractType(metadata);
  if (typeFlag) flags.push(typeFlag);

  const missingFlag = checkMissingCollectionInfo(metadata);
  if (missingFlag) flags.push(missingFlag);

  return flags;
}