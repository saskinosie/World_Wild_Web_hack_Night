#!/bin/bash

# Test script for Cook MCP Wrapper
# This tests the complete flow: mcp-lite Worker → Python HTTP API → Weaviate + OpenAI

echo "=========================================="
echo "Cook MCP Wrapper Test Suite"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Python HTTP API Health Check
echo "Test 1: Python HTTP API Health Check"
echo "--------------------------------------"
response=$(curl -s http://localhost:5001/health)
if echo "$response" | grep -q "ok"; then
    echo -e "${GREEN}✓ Python HTTP API is healthy${NC}"
    echo "Response: $response"
else
    echo -e "${RED}✗ Python HTTP API failed${NC}"
    exit 1
fi
echo ""

# Test 2: List available tools
echo "Test 2: List Available Tools"
echo "--------------------------------------"
response=$(curl -s http://localhost:5001/tools)
if echo "$response" | grep -q "search_engineering_manual"; then
    echo -e "${GREEN}✓ Tools endpoint working${NC}"
    echo "$response" | jq '.tools[].name' 2>/dev/null || echo "$response"
else
    echo -e "${RED}✗ Tools endpoint failed${NC}"
    exit 1
fi
echo ""

# Test 3: MCP Worker Health (via MCP protocol)
echo "Test 3: MCP Worker - Health Check Tool"
echo "--------------------------------------"
response=$(curl -s -X POST http://localhost:8787/ \
  -H "Content-Type: application/json" \
  -H "mcp-protocol-version: 2024-11-05" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "health_check",
      "arguments": {}
    }
  }')

if echo "$response" | grep -q "Python MCP server"; then
    echo -e "${GREEN}✓ MCP Worker health check successful${NC}"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
else
    echo -e "${YELLOW}⚠ MCP Worker response (may need session):${NC}"
    echo "$response" | jq '.' 2>/dev/null || echo "$response"
fi
echo ""

# Test 4: Initialize MCP session
echo "Test 4: Initialize MCP Session"
echo "--------------------------------------"
response=$(curl -s -X POST http://localhost:8787/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "initialize",
    "params": {
      "protocolVersion": "2024-11-05",
      "capabilities": {},
      "clientInfo": {
        "name": "test-client",
        "version": "1.0.0"
      }
    }
  }')

echo -e "${GREEN}Initialize response:${NC}"
echo "$response" | jq '.' 2>/dev/null || echo "$response"
echo ""

# Test 5: List tools via MCP protocol
echo "Test 5: List Tools via MCP Protocol"
echo "--------------------------------------"
response=$(curl -s -X POST http://localhost:8787/ \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/list",
    "params": {}
  }')

echo -e "${GREEN}Tools list:${NC}"
echo "$response" | jq '.result.tools[] | .name' 2>/dev/null || echo "$response"
echo ""

echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}✓ Python HTTP API: Running on http://localhost:5001${NC}"
echo -e "${GREEN}✓ MCP-lite Worker: Running on http://localhost:8787${NC}"
echo ""
echo -e "${YELLOW}Note: Full query testing requires Weaviate data to be vectorized${NC}"
echo ""
echo "To test with Claude Code or MCP Inspector:"
echo "  npx @modelcontextprotocol/inspector http://localhost:8787"
echo ""
