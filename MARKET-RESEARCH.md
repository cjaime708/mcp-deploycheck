# Market research: DeployCheck as a paid MCP server on MCPize

Researched 2026-09-16 via web search, verified against live pages (vendor pricing pages, HN threads, dev.to). No accounts created, no contact made, nothing published.

## The product (as pitched)
An MCP server that wraps the live DeployCheck API: pre-deploy audits for coding agents — broken-link checking, llms.txt auditing (AI-readiness), HTTPS migration auditing, up to 25 URLs per run, machine-readable pass/fail verdicts. Sold on MCPize at 80% creator revenue share.

## 1. Demand evidence

### Strong signals
1. **People already pay for automated link checking.** Live pricing found today: Atomseo Broken Links Checker ($9.95/mo basic, $29.95/mo pro, $99.95/mo premium — https://error404.atomseo.com/priceplan), Dr. Link Check Pro ($12/mo — https://pickyourapp.com/products/broken-link-checker), Deadlinkchecker auto-check (from $9.95/mo — via everywheremarketer.com review), DeadLinkRadar ($19/mo for 5,000 links — deadlinkradar.com). The paying customers are people who want scheduled, hands-off scans, not one-off manual checks.
2. **Google Cloud made it a first-class monitoring template.** Cloud Monitoring added a "broken link checker" synthetic monitor (cloud.google.com blog). Big-platform validation that broken-link drift is a real operational problem.
3. **The pre-deploy/audit use case is explicitly named by builders.** A dev.to walkthrough of a dead-link checker lists "Pre-deployment Audits: run a crawl on your staging environment before you push to production" as a core use case. DeadLinkRadar positions Screaming Frog as the "pre-launch site check" tool. GitHub Marketplace has a broken-links-checker GitHub Action (merlos/broken-links) for CI use.
4. **The llms.txt/AI-readiness wave is real, even if monetization is thin.** Stripe Docs and Mintlify made "copy for LLMs" buttons standard; an HN thread ("We revamped our docs for AI-driven development") shows developers actively adding llms.txt in pre-commit hooks (repo-mix). Paid products exist: LLMO Pro at $9/year (github.com/markoblogo/llmo-abvx), LLMS.txt Architect Shopify app ($4.90-$9.90/mo). But the low prices ($9/year) show this leg is price-commoditized.
5. **Agent-economy payment rails are live.** By June 2026 Coinbase cited 160M+ autonomous transactions across x402 (techtimes.com). A dev.to author built an MCP server charging agents per call via x402 ($0.001-$0.008 per tool call — github.com/hshintelligence/agent-scrape). AgentTax sells MCP tools at $25/mo for 10K calls with x402 pay-per-call fallback. Agents paying for tools is no longer theoretical.

### Honest gaps (thin demand)
- **No public evidence anyone buys paid MCP tools today.** Every paid-MCP example found is publisher-side infrastructure (SDKs, billing gateways, "61 servers I published" guides). Nobody posts "I pay for MCP servers." MCPize's buyer pool is unproven.
- **llms.txt tooling skews free and skeptical.** Multiple open-source GEO analyzers are free; HN had comments calling llms.txt "a failure." As a standalone paid feature it is weak.
- **Small-site link checking is well served free.** Screaming Frog free tier covers 500 URLs; GitHub Actions are free. The free options cap out at small scale or need manual runs, which is the opening.

## 2. Competition

| Competitor | Price | What it does | Weak spot vs DeployCheck |
|---|---|---|---|
| Screaming Frog SEO Spider | $259/year per user (free up to 500 URLs) | Desktop crawler, technical SEO audits incl. broken links | Desktop app only; no MCP; no agent-native output; humans-only workflow |
| Ahrefs (Broken Link Checker) | from $99/mo (bundled in suite) | Link checking on their backlink database | $99 entry; SEO-suite marketing, not dev/agent workflow; no pre-deploy API or MCP |
| Atomseo Broken Links Checker | $9.95-$99.95/mo | Web-based scanning + scheduled checks | Manual web UI; no MCP/agent integration; no llms.txt or HTTPS audit |
| DeadLinkRadar | $19/mo (5k links) | Continuous link monitoring + alerts | Monitoring-only (catches breaks after deploy), not a pre-deploy gate |
| GEO/llms.txt analyzers (geo.init42.be, LLMO, seo-tools-by-ammar-imtiaz) | free / $9/yr / $4.90-9.90/mo | llms.txt generation and AI-visibility scoring | Fragmented, web-UI-only, mostly free; none bundle with link checks or target coding agents |

**Nobody found bundles all three (links + llms.txt + HTTPS) into one MCP-native tool with a machine-readable pass/fail verdict aimed at coding agents.** That is the gap.

## 3. Pricing anchors (dev micro-tools, live examples)

1. agent-scrape (x402 MCP server): $0.001-$0.008 per tool call
2. PayMCP example pricing: $0.19 per tool call; MCP billing gateway example: $0.01/call with 100 free calls/mo
3. AgentTax MCP: Free/100 calls, $25/mo for 10K calls (~$0.0025/call), $99/mo for 100K
4. dev.to "how to monetize an MCP server" playbook: free tier, Pro $19/mo, Unlimited $99/mo
5. Atomseo link checker: $9.95-$99.95/mo; LLMS.txt Architect: $4.90-$9.90/mo; LLMO Pro: $9/year

**Recommendation:** pay-per-call at $0.02 per audit call, matching the existing /deploycheck x402 price, with a free demo tool call and 100 free calls/month. Pay-per-call fits the agent economy better than a flat monthly fee (agents don't have subscriptions). A $9.99/mo "unlimited-ish" tier could be added later if usage justifies it. Do NOT price like an SEO suite and do NOT give away the paid tier to compete with free tools.

## 4. Positioning

**What would make it win (1-2 things that matter):**
1. **"The pre-deploy gate for coding agents"** — not an SEO tool. Market to the moment a coding agent is about to push: one tool call, machine-readable PASS/FAIL. Every competitor sells to humans with dashboards; none sells a verdict to an agent.
2. **The bundle.** Broken links + llms.txt + HTTPS in one call means one listing, one payment, one integration — the agent economy values fewer tool calls, not more.

**Dead-on-arrival positioning mistakes:**
- Marketing it as an SEO tool to humans (Screaming Frog and Ahrefs already own that mind; the price comparison would kill you).
- Leading with llms.txt as the headline feature (free alternatives are everywhere; it is the weakest leg — keep it as a bundled bonus).
- Flat monthly pricing with no free tier (MCP marketplaces are pay-per-call; nobody subscribes to an unknown listing).

## 5. Verdict: SHIP (as a cheap experiment, with a kill line)

Ship it, but be honest about what we know and don't know. The per-leg demand is proven (people pay for link checking; the agent economy pays per call). The bundle-plus-MCP positioning has no direct competitor found anywhere. Cost to list is near zero. But buyer demand for paid MCP tools is unproven, so this is a bet, not a certainty.

**Kill line:** if the listing gets zero paid calls in the first 30 days, kill the lane — do not invest in more features to "fix" demand.

Next actions for the listing: lead the name and description with "pre-deploy check for coding agents", set per-call pricing at $0.02 with 100 free calls/month, and keep llms.txt as a listed feature, not the headline.
