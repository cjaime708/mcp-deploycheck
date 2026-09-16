# TEST-RESULTS — mcp-deploycheck smoke test (2026-09-16 ~18:35 CDT)

Command: `node smoke.mjs` in `~/workspace/mcp-deploycheck`.
The test talks to the MCP server over stdio with the SDK client, lists tools,
and calls each one against the LIVE service
(`https://x402-extract-service.onrender.com`, v1.10.0 per /openapi.json).

## Results — 5/5 PASS, $0.00 spent

```
PASS /health — service hustler-extract, priceAtomic 5000
PASS tools/list — 3 tools exposed: deploycheck_demo, deploycheck, recheck
PASS tool deploycheck_demo — free demo returned verdict (pass=true, summary len=75)
PASS tool deploycheck (paid) — 402 payment handler wired correctly, $0 spent
PASS tool recheck (paid) — 402 payment handler wired correctly, $0 spent
```

## Spend detail

- Only the FREE paths were exercised: `/health` and `/deploycheck/demo`
  (1 URL: https://example.com/ — returned `pass=true`, `pricePaidAtomic="0"`).
- Paid tools (`deploycheck` full audit, `recheck`) were invoked with no payment
  and are EXPECTED to hit the server's 402 handler — the pass criterion is the
  payment-required text, not a verdict. Zero USDC moved.

## Incident during testing (resolved, no code change needed in the server)

First run failed 3/5 with `fetch failed` inside the spawned MCP server, while
direct stdio calls worked. Root cause: the SDK's `StdioClientTransport`
sanitizes the child environment (2 vars), dropping this sandbox's proxy env
vars, so the child's HTTPS handshake died with a TLS "wrong version number"
error. Fix in `smoke.mjs` only: forward `process.env` to the child. The
server code itself needed no change. Note: on MCPize's hosted runtime this
sandbox-specific workaround is unnecessary.

## Not verifiable without the MCPize publisher account

- The actual `mcpize init` / `mcpize deploy` (or GitHub auto-deploy) flow —
  command left as TODO in README.md.
- How MCPize prices per tool call and what publisher share lands per paid call
  (homepage states 80% share, but per-call economics are unverified).
- Stripe Connect payout wiring for the publisher account.
- Whether MCPize accepts stdio-only servers or requires a hosted HTTP/SSE
  endpoint (current build is stdio; may need a small HTTP wrapper for listing).
