import { config } from "dotenv";
config({ path: ".env.local" });

const rawApiKey = process.env.ALCHEMY_API_KEY || "";
console.log("\n=== API KEY VERIFICATION ===");
console.log(`Key Length: ${rawApiKey.length}`);
console.log(`First 10: "${rawApiKey.substring(0, 10)}"`);
console.log(`Last 5: "${rawApiKey.slice(-5)}"`);
console.log(`Hex: ${Buffer.from(rawApiKey).toString("hex")}`);
console.log(`Has trailing newline: ${rawApiKey.endsWith("\n")}`);
console.log(`Has trailing whitespace: ${rawApiKey !== rawApiKey.trim()}`);
console.log(`Trimmed length: ${rawApiKey.trim().length}`);

const ALCHEMY_URL = `https://base-mainnet.g.alchemy.com/v2/${rawApiKey}`;

async function testMethod(method: string, params: any[]) {
  console.log(`\n=== Testing ${method} ===`);
  
  const body = { jsonrpc: "2.0", id: 1, method, params };
  const bodyString = JSON.stringify(body);
  
  console.log(`Request: ${bodyString}`);
  
  try {
    const res = await fetch(ALCHEMY_URL, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "Content-Type": "application/json",
      },
      body: bodyString,
    });
    
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log(`Response: ${JSON.stringify(data, null, 2)}`);
    
    return data;
  } catch (error) {
    console.error(`Fetch error: ${error}`);
  }
}

async function run() {
  // Test working method first
  console.log("\n========== WORKING METHOD ==========");
  await testMethod("eth_blockNumber", []);
  
  console.log("\n========== WORKING METHOD ==========");
  await testMethod("eth_getCode", ["0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", "latest"]);
  
  // Test failing method
  console.log("\n========== FAILING METHOD ==========");
  await testMethod("alchemy_getAssetTransfers", [{
    fromBlock: "0x0",
    toAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    category: ["external", "erc20"],
    order: "desc",
    maxCount: "0x64",
  }]);
}

run();
