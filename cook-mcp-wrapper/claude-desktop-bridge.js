#!/usr/bin/env node
/**
 * Claude Desktop Bridge for HTTP-based MCP Server
 *
 * This script acts as a stdio bridge that allows Claude Desktop to connect
 * to our mcp-lite HTTP server running on Cloudflare Workers.
 *
 * Architecture:
 * Claude Desktop (stdio) → This Bridge (stdio ↔ HTTP) → mcp-lite Worker (HTTP)
 */

const http = require('http');
const readline = require('readline');

// Configuration
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:8787';

// Setup readline for stdio
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Session ID for stateful connections
let sessionId = null;

// Error logging to stderr (won't interfere with stdio protocol)
function logError(message, ...args) {
  console.error(`[Bridge Error] ${message}`, ...args);
}

function logInfo(message, ...args) {
  console.error(`[Bridge Info] ${message}`, ...args);
}

// Send HTTP request to MCP server
async function sendToMcpServer(jsonRpcMessage) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(jsonRpcMessage);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        ...(sessionId && { 'mcp-session-id': sessionId })
      }
    };

    const req = http.request(MCP_SERVER_URL, options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        // Capture session ID from response if present
        if (res.headers['mcp-session-id']) {
          sessionId = res.headers['mcp-session-id'];
          logInfo('Session ID captured:', sessionId);
        }

        try {
          const jsonResponse = JSON.parse(responseData);
          resolve(jsonResponse);
        } catch (error) {
          logError('Failed to parse response:', responseData);
          reject(new Error('Invalid JSON response from MCP server'));
        }
      });
    });

    req.on('error', (error) => {
      logError('HTTP request failed:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Process incoming JSON-RPC messages from Claude Desktop
rl.on('line', async (line) => {
  try {
    const request = JSON.parse(line);
    logInfo('Received from Claude Desktop:', request.method);

    // Forward request to MCP server
    const response = await sendToMcpServer(request);
    logInfo('Received from MCP server:', response.result ? 'success' : 'error');

    // Send response back to Claude Desktop via stdout
    console.log(JSON.stringify(response));
  } catch (error) {
    logError('Error processing message:', error.message);

    // Send error response back to Claude Desktop
    const errorResponse = {
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32603,
        message: 'Internal error: ' + error.message
      }
    };
    console.log(JSON.stringify(errorResponse));
  }
});

rl.on('close', () => {
  logInfo('Connection closed');
  process.exit(0);
});

// Handle process termination
process.on('SIGINT', () => {
  logInfo('Received SIGINT, shutting down');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logInfo('Received SIGTERM, shutting down');
  process.exit(0);
});

// Startup message
logInfo('Claude Desktop Bridge started');
logInfo('Connecting to MCP server:', MCP_SERVER_URL);
logInfo('Waiting for messages from Claude Desktop...');
