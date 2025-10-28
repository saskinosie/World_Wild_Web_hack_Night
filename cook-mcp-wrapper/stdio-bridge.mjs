#!/usr/bin/env node
/**
 * MCP stdio-to-HTTP Bridge for Claude Desktop
 *
 * This bridge allows Claude Desktop (which uses stdio) to connect to
 * HTTP-based MCP servers like our mcp-lite Cloudflare Worker.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';

const MCP_HTTP_URL = process.env.MCP_SERVER_URL || 'http://localhost:8787';

// Log to stderr (won't interfere with stdio protocol)
const log = (...args) => console.error('[Bridge]', ...args);

log('Starting MCP stdio-to-HTTP bridge');
log('Target MCP server:', MCP_HTTP_URL);

// Create a proxy MCP server that forwards to HTTP
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

// Forward tools/list to HTTP server
server.setRequestHandler('tools/list', async () => {
  log('Forwarding tools/list request');

  try {
    const response = await fetch(MCP_HTTP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/list',
        params: {}
      })
    });

    const data = await response.json();
    log('Received tools/list response:', data.result?.tools?.length || 0, 'tools');

    return data.result;
  } catch (error) {
    log('Error fetching tools:', error.message);
    throw error;
  }
});

// Forward tools/call to HTTP server
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;
  log('Forwarding tools/call:', name);

  try {
    const response = await fetch(MCP_HTTP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: { name, arguments: args }
      })
    });

    const data = await response.json();
    log('Received tools/call response for:', name);

    return data.result;
  } catch (error) {
    log('Error calling tool:', error.message);
    throw error;
  }
});

// Connect to stdio
const transport = new StdioServerTransport();

log('Connecting to Claude Desktop via stdio...');

await server.connect(transport);

log('Bridge connected and ready!');

// Keep process alive
process.on('SIGINT', async () => {
  log('Shutting down bridge...');
  await server.close();
  process.exit(0);
});
