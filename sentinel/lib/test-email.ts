import { config } from "dotenv";
config({ path: ".env.local" });

import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY!,
});

async function test() {
  const result = await brevo.transactionalEmails.sendTransacEmail({
    subject: "Sentinel Test Alert",
    htmlContent: "<p>This is a test alert from Sentinel.</p>",
    sender: { name: "Sentinel", email: process.env.BREVO_FROM_EMAIL! },
    to: [{ email: process.env.BREVO_FROM_EMAIL! }],
  });
  console.log("Sent:", result);
}

test();