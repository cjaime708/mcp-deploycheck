#!/usr/bin/env node
/**
 * Smoke test for mcp-deploycheck.
 * Talks to the MCP server over stdio with the SDK client, calls each tool,
 * and prints a pass/fail line. Spend policy: only FREE paths are exercised
 * (/health, /deploycheck/demo). Paid tools (deploycheck full, recheck) are
 * invoked with no payment and are EXPECTED to return the 402 handler text —
 * that proves the tool wires through without spending a cent.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const BASE = "https://x402-extract-service.onrender.com";
const dir = path.dirname(fileURLToPath(import.meta.url));
const results = [];
const ok = (name, detail) => results.push(`PASS ${name} — ${detail}`);
const fail = (name, detail) => results.push(`FAIL ${name} — ${detail}`);

// 1. service health (free, direct HTTP)
try {
  const r = await fetch(BASE + "/health", { signal: AbortSignal.timeout(25000) });
  const j = await r.json();
  if (j.ok) ok("/health", `service ${j.service}, priceAtomic ${j.priceAtomic}`);
  else fail("/health", JSON.stringify(j).slice(0, 120));
} catch (e) {
  fail("/health", e.message);
}

// 2. MCP server over stdio
const transport = new StdioClientTransport({
  command: "node",
  args: [path.join(dir, "src", "index.mjs")],
  // Sandbox note: the test env egresses via proxy env vars. The SDK's
  // stdio transport sanitizes the child environment, which breaks direct
  // HTTPS; forward the parent env so the child can reach the network.
  // (MCPize's hosted runtime provides its own networking.)
  env: { ...process.env },
});
const client = new Client({ name: "smoke-test", version: "1.0.0" });
try {
  await client.connect(transport);
  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name);
  if (names.includes("deploycheck_demo") && names.includes("deploycheck") && names.includes("recheck")) {
    ok("tools/list", `3 tools exposed: ${names.join(", ")}`);
  } else {
    fail("tools/list", `expected 3 tools, got: ${names.join(", ")}`);
  }

  // 3. deploycheck_demo — FREE path, 1 URL
  try {
    const res = await client.callTool({
      name: "deploycheck_demo",
      arguments: { urls: ["https://example.com/"] },
    });
    const txt = res.content?.[0]?.text ?? "";
    const j = JSON.parse(txt);
    if (j.pass === true || j.pass === false || typeof j.summary === "string") {
      ok("tool deploycheck_demo", `free demo returned verdict (pass=${j.pass}, summary len=${String(j.summary).length})`);
    } else {
      fail("tool deploycheck_demo", txt.slice(0, 200));
    }
  } catch (e) {
    fail("tool deploycheck_demo", e.message);
  }

  // 4. deploycheck (full, paid) — EXPECT 402 handler text, no spend
  try {
    const res = await client.callTool({
      name: "deploycheck",
      arguments: { urls: ["https://example.com/"] },
    });
    const txt = res.content?.[0]?.text ?? "";
    const j = JSON.parse(txt);
    if (j.error && j.error.includes("Payment required")) {
      ok("tool deploycheck (paid)", "402 payment handler wired correctly, $0 spent");
    } else {
      fail("tool deploycheck (paid)", txt.slice(0, 200));
    }
  } catch (e) {
    fail("tool deploycheck (paid)", e.message);
  }

  // 5. recheck (paid) — EXPECT 402 handler text, no spend
  try {
    const res = await client.callTool({
      name: "recheck",
      arguments: { url: "https://example.com/", check: "reachability" },
    });
    const txt = res.content?.[0]?.text ?? "";
    const j = JSON.parse(txt);
    if (j.error && j.error.includes("Payment required")) {
      ok("tool recheck (paid)", "402 payment handler wired correctly, $0 spent");
    } else {
      fail("tool recheck (paid)", txt.slice(0, 200));
    }
  } catch (e) {
    fail("tool recheck (paid)", e.message);
  }
} catch (e) {
  fail("mcp-connect", e.message);
} finally {
  try {
    await client.close();
  } catch {}
}

console.log(results.join("\n"));
const fails = results.filter((r) => r.startsWith("FAIL")).length;
process.exit(fails ? 1 : 0);
