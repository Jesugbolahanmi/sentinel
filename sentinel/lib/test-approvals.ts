import { config } from "dotenv";
config({ path: ".env.local" });

import { getApprovalEvents } from "./basescan";

async function test() {
  const approvals = await getApprovalEvents("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
  console.log(`Found ${approvals.length} approval events`);
  console.log(JSON.stringify(approvals.slice(0, 3), null, 2));
}

test();