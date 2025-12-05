import { LLMAgent } from '../../llm-agent.js';

// Agent tools schema
export function getAgentToolsSchema() {
  return [
    {
      name: 'agent_chat',
      description: 'Chat with an AI agent that can use MCP tools to complete tasks',
      inputSchema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'The message to send to the agent',
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
  ];
}

export async function handleAgentTool(
  name: string,
  args: any,
  agent: LLMAgent,
  availableTools?: any[]
): Promise<any> {
  switch (name) {
    case 'agent_chat': {
      const message = (args as any)?.message as string;
      if (!message) {
        throw new Error('Message is required');
      }

      try {
        // Set available tools for the agent
        if (availableTools) {
          agent.setTools(availableTools);
        }
        
        console.log('[MCP Server] Agent starting conversation:', {
          userMessage: message,
          availableTools: availableTools?.map(t => t.name) || [],
        });

        const response = await agent.chat(message);
        
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
        };
      }
    }

    case 'agent_reset': {
      agent.reset();
      return {
        content: [
            {
              type: 'text',
              text: 'Agent conversation reset',
            },
        ],
      };
    }

    default:
      return null; // Not an agent tool
  }
}
