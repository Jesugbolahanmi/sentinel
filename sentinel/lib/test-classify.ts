import { config } from "dotenv";
config({ path: ".env.local" });

import { classifyAddress } from "./basescan";

async function test() {
  const wallet = await classifyAddress("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
  console.log("Known contract:", wallet);

  const fake = await classifyAddress("0x0000000000000000000000000000000000dead");
  console.log("Dead/burn address:", fake);

  const invalid = await classifyAddress("not-a-real-address");
  console.log("Invalid format:", invalid);
}

test();