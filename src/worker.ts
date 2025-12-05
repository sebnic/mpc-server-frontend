import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import { WorkerServerTransport } from './transport.js';
import { LLMService } from './llm-service.js';
import { LLMAgent } from './llm-agent.js';
import { 
  basicToolsSchema, 
  handleBasicTool,
  getLLMToolsSchema,
  handleLLMTool,
  getAgentToolsSchema,
  handleAgentTool
} from './mcp/index.js';
import { 
  getChartDiscoverySchema,
  handleChartDiscoveryTool,
  getChartGenerationSchema,
  handleChartGenerationTool
} from './mcp/echart/echart-tools.js';

// Initialize LLM Service
const llmService = new LLMService();

// Tool executor for the agent
async function executeTool(name: string, args: any): Promise<any> {
  // Create a mock request to reuse the existing tool handling logic
  const request = {
    params: {
      name,
      arguments: args,
    },
  };
  
  return await handleToolCall(request as any);
}

// Initialize LLM Agent
const llmAgent = new LLMAgent(llmService, executeTool);

// Store available tools list
let availableTools: any[] = [];

// Initialize MCP Server in the Web Worker
const server = new Server(
  {
    name: 'browser-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools including LLM tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  availableTools = [
    ...basicToolsSchema,
    ...getLLMToolsSchema(),
    ...getAgentToolsSchema(),
    ...getChartDiscoverySchema(),
    ...getChartGenerationSchema(),
  ];
  
  return {
    tools: availableTools,
  };
});

// Extract tool handling logic to reuse in agent
async function handleToolCall(request: any): Promise<any> {
  const { name, arguments: args } = request.params;
  
  // Log incoming tool call
  console.log('[MCP Server] Received tool call:', {
    tool: name,
    arguments: args,
    timestamp: new Date().toISOString(),
  });

  // Try basic tools
  const basicResult = await handleBasicTool(name, args);
  if (basicResult !== null && basicResult !== undefined) return basicResult;

  // Try LLM tools
  const llmResult = await handleLLMTool(name, args, llmService, (report) => {
    self.postMessage({
      type: 'llm_progress',
      data: {
        text: report.text,
        progress: report.progress,
      },
    });
  });
  if (llmResult !== null && llmResult !== undefined) return llmResult;

  // Try agent tools
  const agentResult = await handleAgentTool(name, args, llmAgent, availableTools);
  if (agentResult !== null && agentResult !== undefined) return agentResult;

  // Try chart discovery tools
  const chartDiscoveryResult = handleChartDiscoveryTool(name, args);
  if (chartDiscoveryResult !== null && chartDiscoveryResult !== undefined) return chartDiscoveryResult;

  // Try chart generation tools
  const chartGenerationResult = handleChartGenerationTool(name, args);
  if (chartGenerationResult !== null && chartGenerationResult !== undefined) return chartGenerationResult;

  // Unknown tool
  throw new Error(`Unknown tool: ${name}`);
}

// Handle tool calls via MCP
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  return await handleToolCall(request);
});

// Start the server with our custom transport
async function startServer() {
  const transport = new WorkerServerTransport();
  await server.connect(transport);
  console.log('[Worker] MCP Server started');
}

startServer().catch((error) => {
  console.error('[Worker] Failed to start server:', error);
});
