# mcp-deploycheck
[![MCPize](https://mcpize.com/badge/@cjaime708/mcp-deploycheck)](https://mcpize.com/mcp/mcp-deploycheck)

**The pre-deploy check for coding agents.** One tool call before you push:
broken-link scanning, llms.txt auditing (AI-readiness), and HTTPS migration
audit, with a machine-readable PASS/FAIL verdict. Built for agents, not
dashboards.

Wraps the **x402 DeployCheck** pre-deploy audit endpoints (part of the
Hustler Extract / DeployCheck service, live at
`https://x402-extract-service.onrender.com`). Prepared for the MCPize
marketplace listing (EXP-51): MCPize pays publishers 80% revenue share;
payouts via PayPal/Stripe.

_Maintainer note (not public copy): this listing ships as a cheap experiment.
Kill line: zero paid calls in the first 30 days means kill the lane, no
feature-chasing._

## Tools exposed

| Tool | Upstream endpoint | Cost (direct x402 path) | Input |
|---|---|---|---|
| `deploycheck_demo` | `POST /deploycheck/demo` | **Free** (5 runs/IP/day, up to 3 pages) | `urls`: 1–3 public page URLs |
| `deploycheck` | `POST /deploycheck` | $0.02 USDC/call on Base | `urls`: 1–25 URLs; optional `maxLinksPerPage`, `includeAssets`, `failOnBroken` |
| `recheck` | `POST /recheck` | $0.001 USDC/call on Base | `url`: one public URL; optional `check`: `reachability` \| `headers` \| `llms` |

**Pricing on MCPize:** free tier (100 calls/day) + pay-per-call $0.02 USDC on
Base for `deploycheck` and `recheck`; `deploycheck_demo` stays free. Pricing
is set in the MCPize Dashboard at publish time (it is not part of
`mcpize.yaml`).

Response shape (demo/full audit): `{ ok, pass, pagesChecked, linksChecked, broken, failedPages, summary }`.
Recheck response: `{ ok, pass, check, url, status/ms or headers/found-bytes }`.

## Install

```bash
npm install        # installs @modelcontextprotocol/sdk + zod
npm start          # runs the MCP server on stdio
npm test           # smoke test against the live service (free paths only)
```

Wire it into an MCP client (e.g. Claude Code) via its stdio config pointing at
`node /path/to/mcp-deploycheck/src/index.mjs`.

## Connect via MCPize

Use this MCP server instantly with no local installation:

```bash
npx -y mcpize connect @cjaime708/mcp-deploycheck --client claude
```

Or connect at: **https://mcpize.com/mcp/mcp-deploycheck**

## Paid-key slot (marketplace billing)

The direct path uses x402: paid endpoints return HTTP 402 unless the caller
attaches an x402-signed payment. The server does **not** sign payments itself.
The service also honors marketplace proxy-bypass headers. To bill through a
marketplace (e.g. MCPize's paid tier) instead of x402, set:

- `MCP_PAID_HEADER` — e.g. `x-rapidapi-proxy-secret`
- `MCP_PAID_SECRET` — the marketplace's proxy secret value

Paid tools then run under the marketplace's billing; the 402 handler explains
this to the model when the vars are unset.

## MCPize deploy path (TODO)

MCPize deploy options are CLI (`npx mcpize init`, `mcpize deploy`) or GitHub
auto-deploy, at $0 outlay. Exact command to be filled in once the publisher
account is created (signup approved by operator 2026-09-16, not yet done):

```bash
# TODO: fill in after MCPize publisher signup
# npx mcpize init ...
# mcpize deploy ...
```

## Sandbox test note

The stdio transport sanitizes the child environment; in this sandbox the child
needs the parent's proxy env vars to reach the internet. `smoke.mjs` forwards
`process.env` to the spawned server for that reason. On MCPize's hosted runtime
this is not needed.