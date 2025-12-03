import { LLMService } from './llm-service.js';

interface Tool {
  name: string;
  description: string;
  inputSchema: any;
}

interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

export class LLMAgent {
  private llmService: LLMService;
  private tools: Tool[] = [];
  private toolExecutor: (name: string, args: any) => Promise<any>;
  private conversationHistory: Array<{ role: string; content: string }> = [];

  constructor(
    llmService: LLMService,
    toolExecutor: (name: string, args: any) => Promise<any>
  ) {
    this.llmService = llmService;
    this.toolExecutor = toolExecutor;
  }

  setTools(tools: Tool[]) {
    // Exclude LLM-related tools to avoid recursion
    this.tools = tools.filter(
      (t) =>
        !t.name.startsWith('llm_') &&
        !t.name.startsWith('agent_')
    );
  }

  private buildSystemPrompt(): string {
    const toolDescriptions = this.tools
      .map((tool) => {
        const params = tool.inputSchema.properties
          ? Object.entries(tool.inputSchema.properties)
              .map(([key, value]: [string, any]) => `${key}: ${value.description || value.type}`)
              .join(', ')
          : 'no parameters';
        return `- ${tool.name}(${params}): ${tool.description}`;
      })
      .join('\n');

    return `You are a helpful AI assistant with access to the following tools:

${toolDescriptions}

When you need to use a tool, respond with ONLY a JSON object in this exact format:
{"tool": "tool_name", "arguments": {"arg1": "value1"}}

For example:
- To get the time: {"tool": "get_time", "arguments": {}}
- To echo: {"tool": "echo", "arguments": {"message": "hello"}}
- To calculate: {"tool": "calculate", "arguments": {"operation": "add", "a": 5, "b": 3}}

If you don't need a tool, respond normally in natural language.

IMPORTANT: 
- When you use a tool, respond with ONLY the JSON, nothing else
- After receiving the tool result, you MUST provide a natural language response to the user incorporating the tool result
- DO NOT call the same tool again after receiving its result
- Your response after receiving a tool result should be conversational and helpful`;
  }

  async chat(userMessage: string): Promise<string> {
    const maxIterations = 5;
    let iteration = 0;

    console.log('[Agent] 💬 Starting new chat:', {
      message: userMessage,
      availableTools: this.tools.map(t => t.name),
    });

    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    while (iteration < maxIterations) {
      iteration++;

      // Build messages with system prompt
      const messages = [
        {
          role: 'system',
          content: this.buildSystemPrompt(),
        },
        ...this.conversationHistory,
      ];

      // Get LLM response
      const response = await this.llmService.chat(messages);

      console.log(`[Agent] Iteration ${iteration}, LLM response:`, response);

      // Check if it's a tool call
      const toolCall = this.parseToolCall(response);

      if (toolCall) {
        // Execute the tool
        console.log('[Agent] 🔧 LLM decided to use a tool:', {
          tool: toolCall.name,
          arguments: toolCall.arguments,
          iteration: iteration,
          timestamp: new Date().toISOString(),
        });
        
        try {
          const toolResult = await this.toolExecutor(toolCall.name, toolCall.arguments);
          console.log('[Agent] ✅ Tool execution completed:', {
            tool: toolCall.name,
            resultPreview: typeof toolResult === 'string' 
              ? toolResult.substring(0, 100) + '...'
              : JSON.stringify(toolResult).substring(0, 100) + '...',
          });
          const resultText =
            toolResult.content?.[0]?.text || JSON.stringify(toolResult);

          // Add tool result to conversation
          this.conversationHistory.push({
            role: 'assistant',
            content: response,
          });
          this.conversationHistory.push({
            role: 'user',
            content: `Tool result: ${resultText}. Now provide a natural language response to the user.`,
          });
          console.log('[Agent] 🔄 Added tool result to history, continuing to next iteration...');
        } catch (error: any) {
          this.conversationHistory.push({
            role: 'assistant',
            content: response,
          });
          this.conversationHistory.push({
            role: 'user',
            content: `Tool execution failed: ${error.message}. Please respond to the user explaining the issue.`,
          });
        }
      } else {
        // Normal response, return to user
        this.conversationHistory.push({
          role: 'assistant',
          content: response,
        });
        return response;
      }
    }

    console.log('[Agent] ⚠️ Max iterations reached without final response');
    return 'I apologize, but I reached the maximum number of tool calls. Please try rephrasing your question.';
  }

  private parseToolCall(response: string): ToolCall | null {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*"tool"[\s\S]*"arguments"[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.tool && parsed.arguments !== undefined) {
        return {
          name: parsed.tool,
          arguments: parsed.arguments,
        };
      }
    } catch (error) {
      // Not a tool call, just a normal response
    }
    return null;
  }

  reset() {
    this.conversationHistory = [];
  }
}
