// Generated at deploy time to avoid modifying upstream's wrangler.toml.
// This file deliberately contains no API_SECRET; keep_vars retains the remote secret.
import fs from 'node:fs';

const databaseId = process.env.D1_DATABASE_ID;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
if (!/^[a-f0-9-]{36}$/i.test(databaseId ?? '') || !/^[a-f0-9]{32}$/i.test(accountId ?? '')) {
  throw new Error('Valid D1_DATABASE_ID and CLOUDFLARE_ACCOUNT_ID secrets are required');
}
const input = fs.readFileSync('wrangler.toml', 'utf8');
if (!/^\s*keep_vars\s*=\s*true\s*$/m.test(input)) {
  throw new Error('Refusing deploy: upstream config must set keep_vars = true to preserve API_SECRET');
}
const lines = input.split(/\r?\n/);
let inD1 = false;
let foundDatabase = false;
let foundWorker = false;
const output = [];
for (const line of lines) {
  const trimmed = line.trim();
  if (trimmed === '[[d1_databases]]') inD1 = true;
  else if (trimmed.startsWith('[')) inD1 = false;
  if (/^name\s*=/.test(trimmed) && !foundWorker) {
    output.push('name = "cf-server-monitor"');
    foundWorker = true;
    continue;
  }
  if (inD1 && /^database_id\s*=/.test(trimmed)) continue;
  output.push(line);
  if (inD1 && /^database_name\s*=\s*["']server-monitor-db["']\s*$/.test(trimmed)) {
    output.push(`database_id = "${databaseId}"`);
    foundDatabase = true;
  }
}
if (!foundWorker || !foundDatabase || !output.join('\n').includes('binding = "DB"')) {
  throw new Error('Upstream Wrangler layout changed; refusing potentially destructive deployment');
}
const config = output.join('\n');
fs.writeFileSync('wrangler.production.toml', config);
console.log('Prepared safe in-place deploy config for cf-server-monitor (DB and secrets preserved)');
