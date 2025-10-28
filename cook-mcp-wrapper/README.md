# Cook Engineering Manual MCP Wrapper

## World Wild Web MCP Hack Night - Cloudflare Austin

**Project:** MCP-lite wrapper for a Python MCP server
**Author:** Scott Askinosie
**Date:** October 28, 2025

## Project Overview

This project demonstrates **interoperability between different MCP implementations** by creating a web-accessible mcp-lite wrapper around an existing Python MCP server.

### The Story

As a Python developer, I already built an MCP server that performs OpenAI Vision analysis on engineering documentation stored in Weaviate. To meet the hack night requirements of using **mcp-lite + Cloudflare Workers**, I created a TypeScript wrapper that makes my Python expertise available as a web-accessible MCP service.

### Architecture

```
User/Claude → mcp-lite (Cloudflare Worker)
                  ↓ HTTP
             Python HTTP API
                  ↓
         Python MCP Server → Weaviate + OpenAI Vision
```

## What This Project Does

The original Python MCP server provides AI-powered search through an engineering handbook with these capabilities:

1. **Vector Search**: Uses Weaviate to find relevant content based on natural language queries
2. **Vision Analysis**: Calls OpenAI GPT-4o to analyze technical diagrams, charts, and maps
3. **Multi-modal Results**: Returns both text explanations and base64-encoded images

Example queries:
- "Is Missouri a high wind zone?" → Analyzes wind zone map images
- "What is the friction loss for round elbows?" → Finds specifications and formulas
- "What are the motor efficiency requirements?" → Searches technical specs

## Project Structure

```
cook-mcp-wrapper/
├── src/
│   └── index.ts          # mcp-lite Cloudflare Worker (TypeScript)
├── package.json
├── wrangler.toml         # Cloudflare Workers config
├── tsconfig.json
└── README.md             # This file

../weaviate/cook_image_query_update/
├── mcp_cook_server.py           # Original Python MCP server (stdio)
├── http_wrapper.py              # HTTP API wrapper for Python server
└── .env                         # API keys (Weaviate, OpenAI, Cohere)
```

## Components

### 1. Python MCP Server (Original)
- **File:** `mcp_cook_server.py`
- **Protocol:** stdio (for Claude Desktop)
- **Features:**
  - Vector search via Weaviate
  - OpenAI GPT-4o vision analysis
  - Returns text + base64 images

### 2. Python HTTP Wrapper (New)
- **File:** `http_wrapper.py`
- **Purpose:** Expose Python MCP server via HTTP REST API
- **Port:** 5001
- **Framework:** Flask with CORS support
- **Endpoints:**
  - `GET /health` - Health check
  - `GET /tools` - List available tools
  - `POST /call-tool` - Execute a tool

### 3. mcp-lite Cloudflare Worker (New)
- **File:** `src/index.ts`
- **Purpose:** Web-accessible MCP server that proxies to Python
- **Framework:** mcp-lite + Cloudflare Workers
- **Tools Exposed:**
  - `search_engineering_manual` - AI-powered handbook search
  - `get_page_direct` - Get specific page by number
  - `health_check` - Verify Python server connectivity

## Setup Instructions

### Prerequisites

- Node.js and npm
- Python 3.10+ with venv
- Cloudflare account (for deployment)
- Weaviate Cloud instance (for Python server)
- OpenAI API key (for vision analysis)

### Step 1: Install Dependencies

```bash
# Install Node.js dependencies
cd cook-mcp-wrapper
npm install

# Install Python dependencies
cd ../weaviate/cook_image_query_update
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install flask flask-cors weaviate-client openai python-dotenv
```

### Step 2: Configure Environment

Create `.env` file in the Python project directory:

```env
OPENAI_API_KEY=sk-proj-...
WEAVIATE_URL=your-cluster.weaviate.cloud
WEAVIATE_API_KEY=your-weaviate-key
COHERE_KEY=your-cohere-key
```

### Step 3: Start Python HTTP Wrapper

```bash
cd /path/to/weaviate/cook_image_query_update
source .venv/bin/activate
python http_wrapper.py
```

This starts the Flask server on `http://localhost:5001`

### Step 4: Test Locally

```bash
cd cook-mcp-wrapper
npm run dev
```

This starts the Cloudflare Worker locally using Wrangler.

### Step 5: Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector wrangler dev
```

Or test the Python HTTP API directly:

```bash
curl http://localhost:5001/health
curl -X POST http://localhost:5001/call-tool \
  -H "Content-Type: application/json" \
  -d '{"name": "search_engineering_manual", "arguments": {"query": "Is Missouri a high wind zone?"}}'
```

## Deployment

### Option 1: Local Demo (Easiest for Hack Night)

1. Start Python HTTP wrapper on localhost:5001
2. Run `npm run dev` for local Cloudflare Worker
3. Demo using MCP Inspector or curl

### Option 2: Deploy with ngrok (Public Demo)

1. Start Python HTTP wrapper
2. Expose with ngrok:
```bash
ngrok http 5001
```
3. Update `wrangler.toml`:
```toml
[vars]
PYTHON_MCP_URL = "https://your-ngrok-url.ngrok.io"
```
4. Deploy to Cloudflare:
```bash
npm run deploy
```

### Option 3: Full Cloud Deployment

To make this production-ready, you would need to:
- Deploy Python server to a cloud platform (AWS Lambda, Google Cloud Run, etc.)
- Update PYTHON_MCP_URL in `wrangler.toml`
- Deploy Cloudflare Worker: `npm run deploy`

## Tools Available

### 1. search_engineering_manual

Searches the Cook Engineering Handbook using AI vision analysis.

**Input:**
```json
{
  "query": "Is Missouri a high wind zone?"
}
```

**Output:**
- Text response from GPT-4o analyzing relevant pages and images
- May include analysis of maps, charts, tables

### 2. get_page_direct

Retrieves a specific page by number.

**Input:**
```json
{
  "page_number": 42
}
```

**Output:**
- Text content from that page
- Base64-encoded images if present

### 3. health_check

Verifies the Python MCP server is accessible.

**Input:**
```json
{}
```

**Output:**
- Status message
- Connection diagnostics

## Demo Script

For the hack night presentation:

1. **Show the architecture diagram** (User → mcp-lite → Python → Weaviate + OpenAI)

2. **Explain the value proposition:**
   - "I work in Python, but wanted to meet the mcp-lite + Cloudflare requirements"
   - "This demonstrates MCP interoperability - different implementations working together"
   - "Shows how to bridge existing MCP tools into the web ecosystem"

3. **Run the health check:**
   ```bash
   curl http://localhost:8787/mcp -X POST -H "Content-Type: application/json" \
     -d '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "health_check", "arguments": {}}, "id": 1}'
   ```

4. **Demonstrate the AI vision search:**
   - Ask: "Is Missouri a high wind zone?"
   - Show how it searches Weaviate, finds relevant pages with maps
   - Show GPT-4o analyzing the visual content
   - Display the answer with confidence

5. **Highlight the technical achievements:**
   - Python MCP server with OpenAI vision
   - HTTP REST API wrapper (Flask)
   - mcp-lite Cloudflare Worker (TypeScript)
   - All communicating via standard protocols

## Troubleshooting

### Python server won't start
- Check `.env` file exists with all required keys
- Verify Weaviate cluster is running (may need to wake from sleep)
- Activate virtual environment before running

### mcp-lite can't reach Python server
- Verify Python server is running on port 5001
- Check `PYTHON_MCP_URL` in wrangler.toml
- Test Python API directly with curl first

### TypeScript compilation errors
- Run `npm install` to ensure dependencies are installed
- Check that `mcp-lite` version matches (0.8.2)

## Technical Decisions

### Why HTTP wrapper instead of direct mcp-lite implementation?

**Time constraint:** 2 hours for the hack night
**Reuse existing work:** I already had a working Python MCP server with complex Weaviate + OpenAI integration
**Demonstrate interoperability:** Shows MCP as a protocol can work across implementations

### Why not port everything to TypeScript?

The Python implementation includes:
- Weaviate vector search (complex setup)
- OpenAI vision API integration
- Base64 image handling
- Custom PDF extraction pipeline

Porting all of this would take 8+ hours. The wrapper approach achieves the hack night goals in 2 hours while showing a valuable pattern.

## Future Improvements

- [ ] Deploy Python server to Cloud Run or Lambda
- [ ] Add authentication/API keys
- [ ] Implement caching layer
- [ ] Add more tools (document upload, collection management)
- [ ] Create TypeScript native implementation for comparison
- [ ] Add websocket support for streaming responses

## Links

- [mcp-lite Documentation](https://github.com/fiberplane/mcp-lite)
- [Model Context Protocol](https://modelcontextprotocol.io)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Weaviate Vector Database](https://weaviate.io)
- [OpenAI Vision API](https://platform.openai.com/docs/guides/vision)

## License

MIT

## Contact

Created for World Wild Web MCP Hack Night at Cloudflare Austin, October 28, 2025
