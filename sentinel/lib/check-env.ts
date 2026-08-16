import { config } from "dotenv";
config({ path: ".env.local" });

console.log("Alchemy key exists:", !!process.env.ALCHEMY_API_KEY);
console.log("Alchemy key length:", process.env.ALCHEMY_API_KEY?.length);
console.log("First 5 chars:", process.env.ALCHEMY_API_KEY?.slice(0, 5));