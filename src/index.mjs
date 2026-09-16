#!/usr/bin/env node
/**
 * mcp-deploycheck — Model Context Protocol server wrapping the x402
 * DeployCheck pre-deploy audit endpoints (Hustler Extract / DeployCheck).
 *
 * Tools:
 *   - deploycheck_demo(urls)   : free demo audit, up to 3 pages, no payment
 *   - deploycheck(urls, opts)  : full audit, up to 25 pages (paid $0.02 USDC
 *                                via x402 on Base when called without a
 *                                marketplace bypass; MCPize listing sets
 *                                pricing downstream)
 *   - recheck(url, check)      : quick reachability/headers/llms.txt check
 *                                (paid $0.001 USDC entry product on the
 *                                direct x402 path)
 *
 * Paid paths: on the direct x402 path, payment goes through the standard
 * x402 HTTP 402 handshake (USDC on Base). The service ALSO supports
 * marketplace proxy-bypass headers (x-rapidapi-proxy-secret,
 * x-zyla-proxy-secret, x-payapi-proxy-secret, ...). When this server is
 * listed on MCPize, the operator sets MCPize's paid-tier key here:
 * set MCP_PAID_HEADER / MCP_PAID_SECRET to the marketplace's proxy secret,
 * and paid tools run under the marketplace's billing instead of x402.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL =
  process.env.DEPLOYCHECK_BASE_URL ||
  "https://x402-extract-service.onrender.com";

// Marketplace billing passthrough. When blank, calls use the direct x402
// path (which returns HTTP 402 for paid endpoints unless a signed x402
// payment header is attached; the MCP server does not sign payments — the
// operator does that client-side or via the marketplace key).
const PAID_HEADER = process.env.MCP_PAID_HEADER || "";
const PAID_SECRET = process.env.MCP_PAID_SECRET || "";

async function callEndpoint(path, body) {
  const headers = { "content-type": "application/json" };
  if (PAID_HEADER && PAID_SECRET) headers[PAID_HEADER] = PAID_SECRET;
  const res = await fetch(BASE_URL + path, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text.slice(0, 2000) };
  }
  if (res.status === 402) {
    return {
      error:
        "Payment required: this endpoint is $0.02 (deploycheck) / $0.001 (recheck) USDC on Base via x402. " +
        "Pay directly with an x402-signed client, or set MCP_PAID_HEADER/MCP_PAID_SECRET for marketplace billing.",
      paymentHint: data,
    };
  }
  if (!res.ok) {
    return { error: `Upstream ${res.status}: ${JSON.stringify(data).slice(0, 500)}` };
  }
  return data;
}

const server = new McpServer({
  name: "mcp-deploycheck",
  version: "1.0.0",
});

// ---------------------------------------------------------------- free demo
server.tool(
  "deploycheck_demo",
  "Run a free DeployCheck pre-deploy link audit on up to 3 public pages. " +
    "Returns pass/fail, broken links, failed pages, and a summary. No payment. " +
    "Use for quick smoke checks before paying for the full 25-page audit.",
  { urls: z.array(z.string().url()).min(1).max(3).describe("Public page URLs to audit (max 3 for the free demo)") },
  async ({ urls }) => ({
    content: [
      { type: "text", text: JSON.stringify(await callEndpoint("/deploycheck/demo", { urls }), null, 2) },
    ],
  })
);

// ---------------------------------------------------------------- full audit
server.tool(
  "deploycheck",
  "Run the full DeployCheck pre-deploy link audit on up to 25 public pages. " +
    "Returns pass/fail verdict, broken links, failed pages, and a summary. " +
    "On the direct path this endpoint costs $0.02 USDC per audit run via x402 on Base " +
    "(HTTP 402 without payment or a marketplace bypass secret).",
  {
    urls: z.array(z.string().url()).min(1).max(25).describe("Public page URLs to audit (max 25)"),
    maxLinksPerPage: z.number().int().min(1).max(500).optional().describe("Max links checked per page (default 200)"),
    includeAssets: z.boolean().optional().describe("Check image/script sources too (default true)"),
    failOnBroken: z.boolean().optional().describe("Fail the verdict on any broken link"),
  },
  async ({ urls, maxLinksPerPage, includeAssets, failOnBroken }) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          await callEndpoint("/deploycheck", {
            urls,
            ...(maxLinksPerPage !== undefined ? { maxLinksPerPage } : {}),
            ...(includeAssets !== undefined ? { includeAssets } : {}),
            ...(failOnBroken !== undefined ? { failOnBroken } : {}),
          }),
          null,
          2
        ),
      },
    ],
  })
);

// ---------------------------------------------------------------- quick recheck
server.tool(
  "recheck",
  "Quick re-check of one public URL: reachability, security-header presence, " +
    "or llms.txt discovery. On the direct path this endpoint costs $0.001 USDC " +
    "per call via x402 on Base (HTTP 402 without payment or a marketplace bypass secret).",
  {
    url: z.string().url().describe("Public http(s) URL to re-check"),
    check: z.enum(["reachability", "headers", "llms"]).optional().describe("Which quick check to run (default: reachability)"),
  },
  async ({ url, check }) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          await callEndpoint("/recheck", { url, ...(check ? { check } : {}) }),
          null,
          2
        ),
      },
    ],
  })
);

const transport = new StdioServerTransport();
await server.connect(transport);
