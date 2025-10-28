/**
 * Cook Engineering Manual MCP Wrapper
 *
 * This mcp-lite server acts as a web-accessible wrapper around a Python MCP server
 * that performs OpenAI Vision analysis on engineering documentation stored in Weaviate.
 *
 * Architecture:
 * User → Claude → mcp-lite (Cloudflare Worker) → HTTP → Python MCP Server → Weaviate + OpenAI
 */

import { McpServer, StreamableHttpTransport } from 'mcp-lite';

interface Env {
	PYTHON_MCP_URL: string;
}

// Create MCP Server instance
const server = new McpServer({
	name: 'cook-engineering-manual-wrapper',
	version: '1.0.0',
});

// Tool 1: Search Engineering Manual
server.tool('search_engineering_manual', {
	description: `Search the Cook Engineering Handbook for technical specifications,
formulas, charts, and guidelines. Use this for questions about fans, motors,
ductwork, HVAC systems, wind zones, seismic zones, etc.

Examples:
- "What is the friction loss for round elbows?"
- "Is Missouri a high wind zone?"
- "What are the motor efficiency requirements?"

This tool will automatically handle visual content like maps, charts, and diagrams.`,
	inputSchema: {
		type: 'object',
		properties: {
			query: {
				type: 'string',
				description: 'The technical question or search query',
			},
		},
		required: ['query'],
	},
	handler: async (args: { query: string }, ctx) => {
		const env = ctx.env as Record<string, string>;
		const pythonServerUrl = env.PYTHON_MCP_URL || 'http://localhost:5001';

		try {
			// Call the Python HTTP wrapper
			const response = await fetch(`${pythonServerUrl}/call-tool`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: 'search_engineering_manual',
					arguments: { query: args.query },
				}),
			});

			if (!response.ok) {
				throw new Error(`Python server returned ${response.status}: ${await response.text()}`);
			}

			const result: any = await response.json();

			return {
				content: [
					{
						type: 'text' as const,
						text: result.text || 'No response from server',
					},
				],
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			return {
				content: [
					{
						type: 'text' as const,
						text: `Error calling Python MCP server: ${errorMessage}\n\nMake sure the Python HTTP wrapper is running at ${pythonServerUrl}`,
					},
				],
				isError: true,
			};
		}
	},
});

// Tool 2: Get Page Direct
server.tool('get_page_direct', {
	description: `Retrieve a specific page from the Cook Engineering Handbook by page number.
Use this when you know the exact page you need or when search results reference a specific page.`,
	inputSchema: {
		type: 'object',
		properties: {
			page_number: {
				type: 'number',
				description: 'Page number (1-150)',
			},
		},
		required: ['page_number'],
	},
	handler: async (args: { page_number: number }, ctx) => {
		const env = ctx.env as Record<string, string>;
		const pythonServerUrl = env.PYTHON_MCP_URL || 'http://localhost:5001';

		try {
			// Call the Python HTTP wrapper
			const response = await fetch(`${pythonServerUrl}/call-tool`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name: 'get_page_direct',
					arguments: { page_number: args.page_number },
				}),
			});

			if (!response.ok) {
				throw new Error(`Python server returned ${response.status}: ${await response.text()}`);
			}

			const result: any = await response.json();

			// Handle both text and images if present
			const content: Array<any> = [
				{
					type: 'text',
					text: result.text || 'No content found',
				},
			];

			// Add images if present
			if (result.images && Array.isArray(result.images)) {
				for (const img of result.images) {
					content.push({
						type: 'image',
						data: img.data,
						mimeType: img.mimeType,
					});
				}
			}

			return { content };
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			return {
				content: [
					{
						type: 'text' as const,
						text: `Error calling Python MCP server: ${errorMessage}\n\nMake sure the Python HTTP wrapper is running at ${pythonServerUrl}`,
					},
				],
				isError: true,
			};
		}
	},
});

// Tool 3: Health Check
server.tool('health_check', {
	description: 'Check if the Python MCP server is accessible and responding',
	inputSchema: {
		type: 'object',
		properties: {},
	},
	handler: async (_args, ctx) => {
		const env = ctx.env as Record<string, string>;
		const pythonServerUrl = env.PYTHON_MCP_URL || 'http://localhost:5001';

		try {
			const response = await fetch(`${pythonServerUrl}/health`);
			if (!response.ok) {
				throw new Error(`Server returned ${response.status}`);
			}
			const data: any = await response.json();
			return {
				content: [
					{
						type: 'text' as const,
						text: `✅ Python MCP server is healthy!\n\nStatus: ${JSON.stringify(data, null, 2)}`,
					},
				],
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'Unknown error';
			return {
				content: [
					{
						type: 'text' as const,
						text: `❌ Python MCP server is NOT accessible at ${pythonServerUrl}\n\nError: ${errorMessage}\n\nMake sure:\n1. The Python HTTP wrapper is running (python http_wrapper.py)\n2. The URL is correct\n3. For deployed version, use ngrok to expose your local server`,
					},
				],
				isError: true,
			};
		}
	},
});

// Create transport
const transport = new StreamableHttpTransport();

// Bind server to transport to get handler function
const mcpHandler = transport.bind(server);

// Export Cloudflare Workers handler
export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		// Pass environment variables through context
		return mcpHandler(request, { authInfo: { env } as any });
	},
};
