# What is mcp-lite and How Does It Work on Cloudflare Workers?

## What is MCP (Model Context Protocol)?

**MCP** is an open protocol created by Anthropic that allows AI assistants like Claude to interact with external tools, data sources, and services.

Think of it like this:
- **Without MCP:** Claude can only work with information you provide in the conversation
- **With MCP:** Claude can call tools, fetch data, run code, search databases, etc.

## What is mcp-lite?

**mcp-lite** is a lightweight JavaScript/TypeScript library for building MCP servers that work over HTTP.

### Traditional MCP Servers (Python/TypeScript SDK)
```
Claude Desktop ←→ stdio (stdin/stdout) ←→ MCP Server (local process)
```
- Runs as a local process
- Uses stdin/stdout for communication
- Great for desktop apps
- Limited to one computer

### mcp-lite Servers
```
Any Client ←→ HTTP/HTTPS ←→ mcp-lite Server (web accessible)
```
- Runs as a web service
- Uses HTTP/JSON-RPC for communication
- Works from anywhere
- Can be deployed globally

## Why mcp-lite + Cloudflare Workers?

### Cloudflare Workers Explained

**Cloudflare Workers** is a serverless platform that runs JavaScript at the edge of Cloudflare's network (200+ data centers worldwide).

**Key Benefits:**
- ⚡ **Fast:** Runs close to users (sub-50ms latency)
- 💰 **Cheap:** Free tier includes 100,000 requests/day
- 🌍 **Global:** Automatically distributed worldwide
- 📈 **Scalable:** Handles millions of requests
- 🔧 **Simple:** Just JavaScript/TypeScript, no servers to manage

### How mcp-lite Works on Workers

```typescript
import { McpServer, StreamableHttpTransport } from 'mcp-lite';

// 1. Create an MCP server
const server = new McpServer({
  name: 'my-server',
  version: '1.0.0'
});

// 2. Define tools
server.tool('my_tool', {
  description: 'Does something cool',
  inputSchema: { /* JSON Schema */ },
  handler: async (args) => {
    // Your logic here
    return { content: [{ type: 'text', text: 'Result!' }] };
  }
});

// 3. Export Cloudflare Worker handler
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const transport = new StreamableHttpTransport();
    return transport.bind(server)(request);
  }
};
```

## How It Works: Step by Step

### 1. Request Arrives
```
Client → https://your-worker.workers.dev
```
- HTTP POST with JSON-RPC body
- Cloudflare routes to nearest data center
- Worker starts executing (cold start: ~50ms)

### 2. mcp-lite Processes Request
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "my_tool",
    "arguments": { "query": "example" }
  }
}
```

### 3. Worker Executes Tool Handler
```typescript
handler: async (args) => {
  // Can do anything here:
  // - Call APIs
  // - Query databases (Cloudflare D1, KV, R2)
  // - Process data
  // - Call other services (like our Python API!)

  const result = await fetch('http://backend.com/api', {
    method: 'POST',
    body: JSON.stringify(args)
  });

  return {
    content: [
      { type: 'text', text: 'Here is your result...' }
    ]
  };
}
```

### 4. Response Sent Back
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      { "type": "text", "text": "Here is your result..." }
    ]
  }
}
```

## In Your Project

### Your mcp-lite Worker ([src/index.ts](src/index.ts))

```typescript
// 1. Create MCP server instance
const server = new McpServer({
  name: 'cook-engineering-manual-wrapper',
  version: '1.0.0',
});

// 2. Define tool that proxies to Python
server.tool('search_engineering_manual', {
  description: 'Search engineering docs with AI vision',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' }
    },
    required: ['query']
  },
  handler: async (args, ctx) => {
    const pythonUrl = ctx.env.PYTHON_MCP_URL; // http://localhost:5001

    // Call Python HTTP API
    const response = await fetch(`${pythonUrl}/call-tool`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'search_engineering_manual',
        arguments: { query: args.query }
      })
    });

    const result = await response.json();

    // Return MCP-formatted response
    return {
      content: [
        { type: 'text', text: result.text }
      ]
    };
  }
});

// 3. Export Cloudflare Worker handler
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const transport = new StreamableHttpTransport();
    return transport.bind(server)(request);
  }
};
```

## Key Concepts

### 1. JSON-RPC Protocol
mcp-lite uses JSON-RPC 2.0 for communication:

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 123,
  "method": "tools/call",
  "params": { "name": "my_tool", "arguments": { ... } }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 123,
  "result": { "content": [ ... ] }
}
```

### 2. Tool Schema
Tools are defined with JSON Schema for validation:

```typescript
{
  type: 'object',
  properties: {
    query: {
      type: 'string',
      description: 'What to search for'
    }
  },
  required: ['query']
}
```

### 3. MCP Content Types
Responses use MCP content types:

```typescript
// Text content
{ type: 'text', text: 'Hello world' }

// Image content (base64)
{ type: 'image', data: 'base64string...', mimeType: 'image/png' }

// Resource content
{ type: 'resource', uri: 'file://path/to/file' }
```

## Comparison: Traditional MCP vs mcp-lite

### Traditional MCP (Python/TypeScript SDK)

```python
from mcp.server import Server
from mcp.server.stdio import stdio_server

app = Server("my-server")

@app.list_tools()
async def list_tools():
    return [...]

@app.call_tool()
async def call_tool(name, arguments):
    return [...]

# Runs via stdio
async def main():
    async with stdio_server() as (read, write):
        await app.run(read, write, ...)
```

**Pros:**
- Full SDK features
- Direct integration with Claude Desktop
- Rich type system

**Cons:**
- Must run locally
- Can't be web-accessible
- Requires Python/Node runtime

### mcp-lite (HTTP-based)

```typescript
import { McpServer } from 'mcp-lite';

const server = new McpServer({ name: 'my-server' });

server.tool('my_tool', {
  inputSchema: { ... },
  handler: async (args) => { ... }
});

// Runs via HTTP
export default {
  async fetch(request) {
    return transport.bind(server)(request);
  }
};
```

**Pros:**
- Web-accessible (HTTP/HTTPS)
- Deploy globally (Cloudflare Workers)
- Works with any HTTP client
- No local process needed

**Cons:**
- Fewer features than full SDK
- HTTP adds slight latency
- Need bridging for Claude Desktop (stdio)

## Why This Matters for Your Project

### The Bridge You Built

You combined **both approaches**:

1. **mcp-lite on Cloudflare Workers** → Web accessible, meets hack requirements
2. **stdio bridge** → Connects to Claude Desktop
3. **Python MCP server** → Leverages existing code

This demonstrates:
- ✅ **Protocol interoperability** (stdio ↔ HTTP)
- ✅ **Language interoperability** (Python ↔ TypeScript)
- ✅ **Deployment flexibility** (local + cloud)
- ✅ **Real-world pattern** (wrapping existing services)

## Deployment Options

### Local Development (What you're doing now)
```bash
npm run dev
# Runs on http://localhost:8787
```

### Deploy to Cloudflare
```bash
npm run deploy
# Deploys to https://cook-mcp-wrapper.your-subdomain.workers.dev
```

### After Deployment
Anyone can call it:
```bash
curl https://cook-mcp-wrapper.your-subdomain.workers.dev \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

## The Big Picture

### Traditional Architecture (Before)
```
Claude Desktop → Python MCP (stdio) → Weaviate/OpenAI
```
- Works great locally
- Can't access remotely
- Limited to one machine

### Your New Architecture (After)
```
Any Client → HTTP → mcp-lite (Cloudflare) → Python API → Weaviate/OpenAI
     ↓
Claude Desktop → stdio bridge → ───────┘
```
- Works locally AND remotely
- Globally accessible
- Multiple access patterns
- Production-ready

## Key Takeaways

1. **mcp-lite = HTTP-based MCP servers**
   - Lightweight, web-focused
   - Perfect for serverless platforms

2. **Cloudflare Workers = Edge computing**
   - JavaScript at 200+ locations worldwide
   - Fast, cheap, scalable

3. **Your project = Bridge between worlds**
   - stdio (desktop) ↔ HTTP (web)
   - Python (existing) ↔ TypeScript (new)
   - Local (development) ↔ Global (production)

4. **This pattern is valuable**
   - Not just a hack
   - Real solution for making MCP servers web-accessible
   - Shows how to integrate legacy systems

## Questions You Might Get

**Q: Why not just use the Python MCP SDK?**
A: We do! We wrapped it with mcp-lite to make it web-accessible and meet hack requirements.

**Q: Is HTTP slower than stdio?**
A: Slightly (~50ms overhead), but negligible compared to AI API calls (1-3s).

**Q: Can mcp-lite do everything the full SDK does?**
A: Most things! It's focused on core functionality: tools, prompts, resources.

**Q: Why Cloudflare Workers vs AWS Lambda?**
A: Edge locations (faster), simpler deployment, better free tier, and the hack required it! 😊

---

## Further Reading

- [mcp-lite GitHub](https://github.com/fiberplane/mcp-lite)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [JSON-RPC 2.0](https://www.jsonrpc.org/specification)
