const fs = require("fs");
const path = require("path");

// Parse .env.local manually
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || "";
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

async function main() {
  const url = `${supabaseUrl}/rest/v1/`;
  try {
    const response = await fetch(url, {
      headers: {
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const spec = await response.json();
    const rpcPaths = Object.keys(spec.paths || {}).filter(p => p.startsWith("/rpc/"));
    console.log("RPC Paths in database:", rpcPaths);
  } catch (error) {
    console.error("Error fetching OpenAPI spec:", error);
  }
}

main();
