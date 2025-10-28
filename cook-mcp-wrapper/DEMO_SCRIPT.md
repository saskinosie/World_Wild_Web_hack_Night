# 2-Minute Demo Script

## Opening (15 seconds)

**Say:** "I'm Scott, and I built an mcp-lite wrapper that demonstrates MCP interoperability - connecting a Python MCP server with OpenAI Vision to Cloudflare Workers."

**Show:** Architecture diagram from PRESENTATION.md

---

## The Hook (30 seconds)

**Say:** "Here's the challenge: I already had a Python MCP server that analyzes engineering documents using GPT-4o Vision. Rather than rebuild everything in TypeScript, I created a wrapper that meets the hack night requirements while demonstrating real-world MCP interoperability."

**Show:** Claude Desktop with tools visible

---

## Live Demo (60 seconds)

### Step 1: Health Check (15 seconds)
**Say:** "Let me show you it working. First, a health check that tests all 5 layers of the stack."

**Do:** Run `health_check` tool in Claude Desktop

**Point out:** "✓ Python HTTP API is healthy - that's the full stack working!"

### Step 2: Explain Architecture (30 seconds)
**Say:** "Here's what's happening:"

**Point to diagram:**
1. "Claude Desktop talks stdio to..."
2. "A Node.js bridge using the MCP SDK, which converts to HTTP for..."
3. "**This mcp-lite worker on Cloudflare Workers** - the hack night requirement..."
4. "Which calls a Python Flask API that wraps..."
5. "My Python MCP server with Weaviate and OpenAI Vision"

**Emphasize:** "The middle layer - the mcp-lite Cloudflare Worker - is what meets the hack night specs."

### Step 3: Show AI Query (15 seconds)
**Say:** "If time permits, watch it answer a technical question using AI vision..."

**Do:** Run `search_engineering_manual` with query: "What are the motor efficiency requirements?"

**Point out:** "It's searching Weaviate, analyzing diagrams with GPT-4o, and returning the answer through all 5 layers."

---

## The Payoff (15 seconds)

**Say:** "This demonstrates three things:"
1. "✓ Uses mcp-lite + Cloudflare Workers"
2. "✓ Shows MCP interoperability between Python and TypeScript"
3. "✓ Provides a real pattern for wrapping existing MCP servers for web access"

**Show:** GitHub repo or test-mcp.sh output

---

## Closing

**Say:** "Built in 2.5 hours. About 500 lines of new code. Fully functional. Questions?"

---

## Backup: If Something Breaks

**Plan B:** Show the test script output
```bash
./test-mcp.sh
```

**Plan C:** Explain architecture with diagram only
- Walk through each layer
- Explain why this pattern matters
- Show code snippets from [src/index.ts](src/index.ts)

---

## Key Points to Hit

✅ **Meets requirements:** mcp-lite + Cloudflare Workers
✅ **Real AI functionality:** OpenAI Vision + Weaviate
✅ **Interoperability:** Python ↔ TypeScript via MCP protocol
✅ **Practical pattern:** Wrapping vs rewriting
✅ **Works end-to-end:** Claude Desktop to backend

---

## Questions You Might Get

**Q: Why the complexity?**
A: "It's actually a pattern - each layer has a purpose. The mcp-lite layer makes it web-accessible."

**Q: Why not pure TypeScript?**
A: "Time and reuse. My Python server works great. This shows how to integrate existing tools into the mcp-lite ecosystem."

**Q: What's the latency?**
A: "Bridge adds <50ms. Main latency is OpenAI API (1-3s)."

**Q: Production ready?**
A: "Core: yes. Needs: auth, rate limiting, monitoring. 80% there!"

---

## Confidence Boosters

- It works! You tested it!
- You built 5 layers in 2.5 hours
- The architecture makes sense
- You have working code to show
- The pattern is valuable

**You got this! 🚀**
