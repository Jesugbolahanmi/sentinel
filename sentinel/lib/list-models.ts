import { config } from "dotenv";
config({ path: ".env.local" });

async function listModels() {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`
  );
  const data = await res.json();
  const names = data.models
    .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
    .map((m: any) => m.name);
  console.log(names);
}

listModels();