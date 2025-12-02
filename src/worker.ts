import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { 
  CallToolRequestSchema, 
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import { WorkerServerTransport } from './transport.js';
import { LLMService } from './llm-service.js';
import { LLMAgent } from './llm-agent.js';

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
      {
        name: 'llm_initialize',
        description: 'Initialize an LLM provider. Supports WebLLM (local) or Gemini (API).',
        inputSchema: {
          type: 'object',
          properties: {
            provider: {
              type: 'string',
              enum: ['webllm', 'gemini'],
              description: 'LLM provider to use (webllm or gemini)',
            },
            apiKey: {
              type: 'string',
              description: 'API key (required for Gemini)',
            },
            model: {
              type: 'string',
              description: 'Model to use (optional, provider-specific defaults)',
            },
          },
          required: ['provider'],
        },
      },
      {
        name: 'llm_chat',
        description: 'Chat with the local LLM. The LLM must be initialized first.',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'The prompt/question to send to the LLM',
            },
          },
          required: ['prompt'],
        },
      },
      {
        name: 'llm_status',
        description: 'Check the status of the LLM (initialized, initializing, or not ready)',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'agent_chat',
        description: 'Chat with an AI agent that can use MCP tools to answer questions. The agent can get the time, perform calculations, and more.',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Your question or message to the AI agent',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'agent_reset',
        description: 'Reset the agent conversation history',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_time',
        description: 'Returns the current time',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'echo',
        description: 'Echoes back the input message',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'The message to echo',
            },
          },
          required: ['message'],
        },
      },
      {
        name: 'calculate',
        description: 'Performs a simple calculation',
        inputSchema: {
          type: 'object',
          properties: {
            operation: {
              type: 'string',
              enum: ['add', 'subtract', 'multiply', 'divide'],
              description: 'The operation to perform',
            },
            a: {
              type: 'number',
              description: 'First number',
            },
            b: {
              type: 'number',
              description: 'Second number',
            },
          },
          required: ['operation', 'a', 'b'],
        },
      },
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

  switch (name) {
    case 'llm_initialize': {
      const provider = (args as any)?.provider as 'webllm' | 'gemini';
      const apiKey = (args as any)?.apiKey;
      const model = (args as any)?.model;
      
      if (!provider) {
        throw new Error('Provider is required (webllm or gemini)');
      }

      if (provider === 'gemini' && !apiKey) {
        throw new Error('API key is required for Gemini provider');
      }

      try {
        const config: any = { model };
        if (apiKey) {
          config.apiKey = apiKey;
        }

        // Send progress updates via postMessage
        await llmService.initialize(provider, config, (report) => {
          self.postMessage({
            type: 'llm_progress',
            data: {
              text: report.text,
              progress: report.progress,
            },
          });
        });

        const status = llmService.getStatus();
        return {
          content: [
            {
              type: 'text',
              text: `LLM initialized successfully! Provider: ${status.providerName}${model ? `, Model: ${model}` : ''}`,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to initialize LLM: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    }

    case 'llm_chat': {
      const prompt = (args as any)?.prompt;
      
      if (!prompt) {
        throw new Error('Prompt is required');
      }

      try {
        const response = await llmService.generate(prompt);
        return {
          content: [
            {
              type: 'text',
              text: response,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `LLM Error: ${error.message}. Make sure to initialize the LLM first using llm_initialize.`,
            },
          ],
          isError: true,
        };
      }
    }

    case 'llm_status': {
      const status = llmService.getStatus();
      return {
        content: [
          {
            type: 'text',
            text: `LLM Status:\n- Ready: ${status.isReady}\n- Initializing: ${status.isInitializing}`,
          },
        ],
      };
    }

    case 'get_time':
      return {
        content: [
          {
            type: 'text',
            text: `Current time: ${new Date().toISOString()}`,
          },
        ],
      };

    case 'echo':
      return {
        content: [
          {
            type: 'text',
            text: `Echo: ${args?.message}`,
          },
        ],
      };

    case 'calculate': {
      const { operation, a, b } = args as { operation: string; a: number; b: number };
      let result: number;
      
      switch (operation) {
        case 'add':
          result = a + b;
          break;
        case 'subtract':
          result = a - b;
          break;
        case 'multiply':
          result = a * b;
          break;
        case 'divide':
          result = a / b;
          break;
        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      return {
        content: [
          {
            type: 'text',
            text: `Result: ${a} ${operation} ${b} = ${result}`,
          },
        ],
      };
    }

    case 'agent_chat': {
      const message = (args as any)?.message;
      
      if (!message) {
        throw new Error('Message is required');
      }

      try {
        console.log('[MCP Server] Agent starting conversation:', {
          userMessage: message,
          availableTools: availableTools.map(t => t.name),
        });
        
        // Set available tools for the agent (already cached in availableTools)
        llmAgent.setTools(availableTools);

        const response = await llmAgent.chat(message);
        
        console.log('[MCP Server] Agent completed conversation:', {
          responseLength: response.length,
        });
        return {
          content: [
            {
              type: 'text',
              text: response,
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Agent Error: ${error.message}. Make sure the LLM is initialized first.`,
            },
          ],
          isError: true,
        };
      }
    }

    case 'agent_reset': {
      llmAgent.reset();
      return {
        content: [
          {
            type: 'text',
            text: 'Agent conversation history has been reset.',
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
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
