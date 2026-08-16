import { config } from "dotenv";
config({ path: ".env.local" });

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
if (!ALCHEMY_API_KEY) {
  throw new Error("ALCHEMY_API_KEY environment variable is not set");
}

const ALCHEMY_URL = `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

async function alchemyCall(method: string, params: any[]) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

  try {
    const res = await fetch(ALCHEMY_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
      signal: controller.signal,
    });
    const data = await res.json();
    console.log(`ALCHEMY RESPONSE for ${method}:`, JSON.stringify(data, null, 2));
    return data.result;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getWalletTransactions(address: string) {
  const [outgoing, incoming] = await Promise.all([
    alchemyCall("alchemy_getAssetTransfers", [{
      fromBlock: "0x0",
      fromAddress: address,
      category: ["external", "erc20"],
      order: "desc",
      maxCount: "0x64",
    }]),
    alchemyCall("alchemy_getAssetTransfers", [{
      fromBlock: "0x0",
      toAddress: address,
      category: ["external", "erc20"],
      order: "desc",
      maxCount: "0x64",
    }]),
  ]);


  const all = [...(outgoing?.transfers || []), ...(incoming?.transfers || [])];

 return all
  .map((t: any) => ({
    from: t.from,
    to: t.to,
    value: t.rawContract?.value || "0",
    decimal: t.rawContract?.decimal ? parseInt(t.rawContract.decimal, 16) : 18,
    timeStamp: Math.floor(new Date(t.metadata.blockTimestamp).getTime() / 1000).toString(),
    hash: t.hash,
    asset: t.asset || "",
  }))
  .sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));
}

export async function getTokenApprovals(address: string) {
  // reuse the same transfer data for MVP - real approval events come later
  return getWalletTransactions(address);
}

export async function isContract(address: string) {
  const code = await alchemyCall("eth_getCode", [address, "latest"]);
  return code && code !== "0x";
}