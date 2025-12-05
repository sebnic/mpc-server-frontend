import { LLMService } from '../../llm-service.js';

// LLM tools schema
export function getLLMToolsSchema() {
  return [
    {
      name: 'llm_initialize',
      description: 'Initialize an LLM provider. Supports WebLLM (local) or Gemini (API).',
      inputSchema: {
        type: 'object',
        properties: {
          provider: {
            type: 'string',
            enum: ['webllm', 'gemini'],
            description: 'LLM provider to use',
          },
          apiKey: {
            type: 'string',
            description: 'API key (required for Gemini)',
          },
        },
        required: ['provider'],
      },
    },
    {
      name: 'llm_status',
      description: 'Get the current status of the LLM',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'llm_chat',
      description: 'Send a message to the LLM and get a response',
      inputSchema: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: 'The message to send to the LLM',
          },
        },
        required: ['prompt'],
      },
    },
  ];
}

export async function handleLLMTool(
  name: string,
  args: any,
  llmService: LLMService,
  onProgress?: (report: { text: string; progress?: number }) => void
): Promise<any> {
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

        // Send progress updates via callback
        await llmService.initialize(provider, config, onProgress);

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

    default:
      return null; // Not an LLM tool
  }
}
