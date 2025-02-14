#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
const isValidScrapedData = (args) => typeof args === 'object' &&
    args !== null &&
    typeof args.data === 'object';
class AIServer {
    server;
    constructor() {
        this.server = new Server({
            name: 'orbyt chat',
            version: '0.1.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        // Error handling
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'analyze_data',
                    description: 'Analyze scraped token data',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            data: {
                                type: 'object',
                                properties: {
                                    tokenName: { type: 'string' },
                                    price: { type: 'string' },
                                    marketCap: { type: 'string' },
                                },
                            },
                        },
                        required: ['data'],
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            if (request.params.name !== 'analyze_data') {
                throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
            }
            if (!isValidScrapedData(request.params.arguments)) {
                throw new McpError(ErrorCode.InvalidParams, 'Invalid data format');
            }
            const data = request.params.arguments.data;
            // Basic analysis (placeholder for more advanced AI logic)
            let analysis = '';
            if (data.tokenName) {
                analysis += `Analysis for ${data.tokenName}:\\n`;
            }
            if (data.price) {
                analysis += `- Current Price: ${data.price}\\n`;
            }
            if (data.marketCap) {
                analysis += `- Market Cap: ${data.marketCap}\\n`;
            }
            analysis += 'This is a basic analysis. More advanced analysis would be performed here.';
            return {
                content: [
                    {
                        type: 'text',
                        text: analysis,
                    },
                ],
            };
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('AI Analyzer MCP server running on stdio');
    }
}
const server = new AIServer();
server.run().catch(console.error);
