#!/usr/bin/env node
/**
 * MCP stdio-to-HTTP Bridge for Claude Desktop
 *
 * Connects Claude Desktop (stdio) to mcp-lite HTTP server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema
} from '@modelcontextprotocol/sdk/types.js';

const MCP_HTTP_URL = process.env.MCP_SERVER_URL || 'http://localhost:8787';

const log = (...args) => console.error('[Bridge]', ...args);

log('Starting MCP stdio-to-HTTP bridge');
log('Target:', MCP_HTTP_URL);

// HTTP client for mcp-lite server
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
    const text = await response.text();
    log('HTTP Error:', response.status, text);
    throw new Error(`HTTP ${response.status}: ${text}`);
  }

  const data = await response.json();

  if (data.error) {
    log('MCP Error:', data.error);
    throw new Error(data.error.message || 'Unknown MCP error');
  }

  return data.result;
}

// Create stdio server
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

// Handle tools/list - use the schema as first parameter
server.setRequestHandler(ListToolsRequestSchema, async () => {
  log('Forwarding tools/list');
  try {
    const result = await callMcpHttp('tools/list');
    log('✓ tools/list:', result.tools?.length || 0, 'tools');
    return result;
  } catch (error) {
    log('✗ tools/list failed:', error.message);
    throw error;
  }
});

// Handle tools/call - use the schema as first parameter
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  log('Forwarding tools/call:', name);

  try {
    const result = await callMcpHttp('tools/call', { name, arguments: args });
    log('✓ tools/call:', name, 'completed');
    return result;
  } catch (error) {
    log('✗ tools/call failed:', name, error.message);
    throw error;
  }
});

// Connect to stdio
const transport = new StdioServerTransport();

try {
  await server.connect(transport);
  log('✓ Bridge connected and ready!');
} catch (error) {
  log('✗ Failed to connect:', error.message);
  process.exit(1);
}

// Graceful shutdown
process.on('SIGINT', async () => {
  log('Shutting down...');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  log('Shutting down...');
  await server.close();
  process.exit(0);
});
