#!/usr/bin/env node
/**
 * MCP stdio-to-HTTP Bridge (Client approach)
 *
 * This creates an MCP Client that connects to the HTTP server,
 * then exposes that as an MCP Server via stdio for Claude Desktop
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolResultSchema, ListToolsResultSchema } from '@modelcontextprotocol/sdk/types.js';

const MCP_HTTP_URL = process.env.MCP_SERVER_URL || 'http://localhost:8787';

const log = (...args) => console.error('[Bridge]', ...args);

log('Starting stdio-to-HTTP bridge');
log('Target:', MCP_HTTP_URL);

// Make HTTP requests to our mcp-lite server
async function callMcpHttp(method, params = {}) {
  const response = await fetch(MCP_HTTP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.result;
}

// Create stdio server that proxies to HTTP
const server = new Server(
  {
    name: 'cook-mcp-http-bridge',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tools/list
server.setRequestHandler(ListToolsResultSchema, async () => {
  log('Handling tools/list');
  const result = await callMcpHttp('tools/list');
  log('Found', result.tools?.length || 0, 'tools');
  return result;
});

// Handle tools/call
server.setRequestHandler(CallToolResultSchema, async (request) => {
  const { name, arguments: args } = request.params;
  log('Handling tools/call:', name);
  const result = await callMcpHttp('tools/call', { name, arguments: args });
  log('Tool call completed:', name);
  return result;
});

// Start stdio transport
const transport = new StdioServerTransport();
await server.connect(transport);

log('Bridge ready!');
