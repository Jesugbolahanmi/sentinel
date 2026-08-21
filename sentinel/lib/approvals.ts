import {
  createPublicClient,
  fallback,
  http,
  parseAbi,
  parseAbiItem,
  formatUnits,
  getAddress,
  isAddress,
} from "viem";
import { base } from "viem/chains";
import { config } from "dotenv";

config({ path: ".env.local" });

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ALCHEMY_URL = ALCHEMY_API_KEY
  ? `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
  : "https://mainnet.base.org";

export const publicClient = createPublicClient({
  chain: base,
  transport: fallback(
    [
      http("https://mainnet.base.org", { timeout: 20000 }),
      http(ALCHEMY_URL, { timeout: 20000 }),
      http("https://base.llamarpc.com", { timeout: 20000 }),
    ],
    { retryCount: 3 }
  ),
});

export const APPROVAL_SCAN_BLOCKS = Number(process.env.APPROVAL_SCAN_BLOCKS) || 50000;
export const APPROVAL_LOG_CHUNK = Number(process.env.APPROVAL_LOG_CHUNK) || 5000;

export const EIP2612_PERMIT_SELECTOR = "0xd505accf"; // permit(address,address,uint256,uint256,uint8,bytes32,bytes32)
export const DAI_PERMIT_SELECTOR = "0x8fcbaf0c";    // permit(address,address,uint256,uint256,bool,uint8,bytes32,bytes32)

export const approvalEventAbi = parseAbiItem(
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
);

const erc20Abi = parseAbi([
  "function allowance(address owner, address spender) view returns (uint256)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function name() view returns (string)",
]);

export interface ActiveApproval {
  tokenAddress: string;
  tokenSymbol: string;
  tokenName: string;
  tokenDecimals: number;
  spender: string;
  spenderIsContract: boolean;
  allowanceRaw: string;
  allowanceFormatted: string;
  isUnlimited: boolean;
  lastUpdatedBlock: string;
  lastTxHash?: string;
  riskSeverity?: "high" | "medium" | "low";
}

export interface DetectedPermit {
  type: "EIP-2612" | "DAI-Permit";
  selector: string;
  txHash: string;
  from: string;
  to: string;
  timestamp?: string;
  blockNumber?: string;
  spender?: string;
}

export interface ApprovalsResult {
  activeApprovals: ActiveApproval[];
  permits: DetectedPermit[];
  totalScannedBlocks: number;
  startBlock: string;
  endBlock: string;
}

// Approvals >= 2^128 are effectively unlimited
const UNLIMITED_THRESHOLD = BigInt(2) ** BigInt(128);

/**
 * Fetch raw Approval logs for a wallet within a block range using chunking.
 */
async function fetchApprovalLogsChunked(
  ownerAddress: `0x${string}`,
  fromBlock: bigint,
  toBlock: bigint
) {
  const chunkRanges: { from: bigint; to: bigint }[] = [];

  let current = fromBlock;
  const chunkSize = BigInt(APPROVAL_LOG_CHUNK);

  while (current <= toBlock) {
    const next = current + chunkSize - BigInt(1);
    chunkRanges.push({
      from: current,
      to: next > toBlock ? toBlock : next,
    });
    current = next + BigInt(1);
  }

  // Execute chunks with bounded concurrency
  const CONCURRENCY = 5;
  const allLogs: any[] = [];

  for (let i = 0; i < chunkRanges.length; i += CONCURRENCY) {
    const slice = chunkRanges.slice(i, i + CONCURRENCY);
    const chunkPromises = slice.map(async (range) => {
      try {
        return await publicClient.getLogs({
          event: approvalEventAbi,
          args: {
            owner: ownerAddress,
          },
          fromBlock: range.from,
          toBlock: range.to,
        });
      } catch (err) {
        console.warn(`Failed to fetch logs from block ${range.from} to ${range.to}:`, err);
        return [];
      }
    });

    const results = await Promise.all(chunkPromises);
    for (const res of results) {
      if (res && res.length) {
        allLogs.push(...res);
      }
    }
  }

  return allLogs;
}

/**
 * Check if an address is a smart contract.
 */
export async function checkIsContract(address: string): Promise<boolean> {
  if (!isAddress(address)) return false;
  try {
    const bytecode = await publicClient.getBytecode({ address: getAddress(address) });
    return !!bytecode && bytecode !== "0x" && bytecode !== "0x0";
  } catch {
    return false;
  }
}

/**
 * Get token metadata with fallback.
 */
async function fetchTokenMetadata(tokenAddress: `0x${string}`) {
  try {
    const [symbol, name, decimals] = await Promise.all([
      publicClient
        .readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "symbol",
        })
        .catch(() => "UNKNOWN"),
      publicClient
        .readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "name",
        })
        .catch(() => "Unknown Token"),
      publicClient
        .readContract({
          address: tokenAddress,
          abi: erc20Abi,
          functionName: "decimals",
        })
        .catch(() => 18),
    ]);

    return {
      symbol: typeof symbol === "string" ? symbol : "UNKNOWN",
      name: typeof name === "string" ? name : "Unknown Token",
      decimals: typeof decimals === "number" ? decimals : 18,
    };
  } catch {
    return { symbol: "UNKNOWN", name: "Unknown Token", decimals: 18 };
  }
}

/**
 * Scan for active token approvals and verify them against live onchain allowance.
 */
export async function getActiveApprovals(ownerAddress: string): Promise<{
  activeApprovals: ActiveApproval[];
  totalScannedBlocks: number;
  startBlock: string;
  endBlock: string;
}> {
  if (!isAddress(ownerAddress)) {
    return { activeApprovals: [], totalScannedBlocks: 0, startBlock: "0", endBlock: "0" };
  }

  const checksummedOwner = getAddress(ownerAddress);
  const currentBlock = await publicClient.getBlockNumber();
  const scanDepth = BigInt(APPROVAL_SCAN_BLOCKS);
  const startBlock = currentBlock > scanDepth ? currentBlock - scanDepth : BigInt(0);

  const logs = await fetchApprovalLogsChunked(checksummedOwner, startBlock, currentBlock);

  // Group and find the latest approval event per (tokenAddress, spender)
  const pairMap = new Map<
    string,
    {
      tokenAddress: `0x${string}`;
      spender: `0x${string}`;
      rawAmount: bigint;
      blockNumber: bigint;
      txHash?: `0x${string}`;
    }
  >();

  for (const log of logs) {
    if (!log.args?.spender) continue;
    const tokenAddress = getAddress(log.address);
    const spender = getAddress(log.args.spender);
    const pairKey = `${tokenAddress.toLowerCase()}_${spender.toLowerCase()}`;

    const blockNum = log.blockNumber || BigInt(0);
    const existing = pairMap.get(pairKey);

    if (!existing || blockNum >= existing.blockNumber) {
      pairMap.set(pairKey, {
        tokenAddress,
        spender,
        rawAmount: log.args.value ?? BigInt(0),
        blockNumber: blockNum,
        txHash: log.transactionHash,
      });
    }
  }

  const pairs = Array.from(pairMap.values());
  const activeApprovals: ActiveApproval[] = [];

  // Query live allowance and metadata for each pair in parallel batches
  const BATCH_SIZE = 10;
  for (let i = 0; i < pairs.length; i += BATCH_SIZE) {
    const batch = pairs.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (pair) => {
        try {
          // Live onchain check
          const currentAllowance = await publicClient.readContract({
            address: pair.tokenAddress,
            abi: erc20Abi,
            functionName: "allowance",
            args: [checksummedOwner, pair.spender],
          });

          // Zero allowance means revoked / spent!
          if (currentAllowance === BigInt(0)) {
            return null;
          }

          const [metadata, spenderIsContract] = await Promise.all([
            fetchTokenMetadata(pair.tokenAddress),
            checkIsContract(pair.spender),
          ]);

          const isUnlimited = currentAllowance >= UNLIMITED_THRESHOLD;
          const allowanceFormatted = isUnlimited
            ? "Unlimited"
            : formatUnits(currentAllowance, metadata.decimals);

          // Determine risk severity
          let riskSeverity: "high" | "medium" | "low" = "low";
          if (!spenderIsContract) {
            // Approval to an EOA is highly suspicious
            riskSeverity = "high";
          } else if (isUnlimited) {
            riskSeverity = "medium";
          }

          const approval: ActiveApproval = {
            tokenAddress: pair.tokenAddress,
            tokenSymbol: metadata.symbol,
            tokenName: metadata.name,
            tokenDecimals: metadata.decimals,
            spender: pair.spender,
            spenderIsContract,
            allowanceRaw: currentAllowance.toString(),
            allowanceFormatted,
            isUnlimited,
            lastUpdatedBlock: pair.blockNumber.toString(),
            lastTxHash: pair.txHash,
            riskSeverity,
          };

          return approval;
        } catch {
          // Non-standard contract or reverted call
          return null;
        }
      })
    );

    for (const res of batchResults) {
      if (res) {
        activeApprovals.push(res);
      }
    }
  }

  // Sort approvals: High risk first, then unlimited, then others
  activeApprovals.sort((a, b) => {
    if (a.riskSeverity === "high" && b.riskSeverity !== "high") return -1;
    if (b.riskSeverity === "high" && a.riskSeverity !== "high") return 1;
    if (a.isUnlimited && !b.isUnlimited) return -1;
    if (b.isUnlimited && !a.isUnlimited) return 1;
    return 0;
  });

  return {
    activeApprovals,
    totalScannedBlocks: Number(currentBlock - startBlock),
    startBlock: startBlock.toString(),
    endBlock: currentBlock.toString(),
  };
}

/**
 * Detect direct EIP-2612 or DAI-style permit transactions in transaction logs/history.
 */
export async function detectPermitTransactions(
  address: string,
  transactions: any[]
): Promise<DetectedPermit[]> {
  const detectedPermits: DetectedPermit[] = [];

  for (const tx of transactions) {
    const input = (tx.input || "").toLowerCase();
    const hash = tx.hash || tx.transactionHash || "";

    if (!input || input === "0x") continue;

    if (input.startsWith(EIP2612_PERMIT_SELECTOR)) {
      detectedPermits.push({
        type: "EIP-2612",
        selector: EIP2612_PERMIT_SELECTOR,
        txHash: hash,
        from: tx.from,
        to: tx.to,
        timestamp: tx.timeStamp ? new Date(parseInt(tx.timeStamp) * 1000).toISOString() : undefined,
        blockNumber: tx.blockNum || tx.blockNumber,
      });
    } else if (input.startsWith(DAI_PERMIT_SELECTOR)) {
      detectedPermits.push({
        type: "DAI-Permit",
        selector: DAI_PERMIT_SELECTOR,
        txHash: hash,
        from: tx.from,
        to: tx.to,
        timestamp: tx.timeStamp ? new Date(parseInt(tx.timeStamp) * 1000).toISOString() : undefined,
        blockNumber: tx.blockNum || tx.blockNumber,
      });
    }
  }

  return detectedPermits;
}

/**
 * Combined approval and permit scan.
 */
export async function scanApprovalsAndPermits(
  address: string,
  transactions: any[] = []
): Promise<ApprovalsResult> {
  const [approvalsData, permits] = await Promise.all([
    getActiveApprovals(address),
    detectPermitTransactions(address, transactions),
  ]);

  return {
    activeApprovals: approvalsData.activeApprovals,
    permits,
    totalScannedBlocks: approvalsData.totalScannedBlocks,
    startBlock: approvalsData.startBlock,
    endBlock: approvalsData.endBlock,
  };
}
