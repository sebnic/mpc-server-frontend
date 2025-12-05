# Agent MCP Server

AI Agent with function calling capabilities. The agent can autonomously use available MCP tools to complete complex tasks.

## Available Tools

### 1. agent_chat
Chat with the AI agent. The agent can use any available MCP tool.

**Parameters:**
- `message` (string, required): Message to send to the agent

**Example:**
```typescript
await client.callTool('agent_chat', { 
  message: 'What time is it? And calculate 15 + 27' 
});
// Agent will:
// 1. Call get_time tool
// 2. Call calculate tool with a=15, b=27
// 3. Return a natural language response with both answers
```

### 2. agent_reset
Reset the agent's conversation history.

**Parameters:** None

**Example:**
```typescript
await client.callTool('agent_reset', {});
// Returns: "Agent conversation reset"
```

## How It Works

The agent uses a **function calling** pattern:

1. **User sends message** → Agent receives it
2. **Agent analyzes** → Determines if tools are needed
3. **Tool execution** → Agent calls relevant MCP tools
4. **Response generation** → Agent synthesizes results
5. **Natural language output** → User gets friendly response

## Architecture

```
User Message
    ↓
LLM Agent (llm-agent.ts)
    ↓
Tool Detection
    ↓
MCP Tool Call (via executeTool callback)
    ↓
Tool Result
    ↓
Context Update
    ↓
Final Response
```

## Example Conversations

### Time Query
```
User: "What time is it?"
Agent: → Calls get_time
Agent: "It's currently 11:30 PM on December 5, 2025."
```

### Multi-Tool Task
```
User: "Calculate 50 + 75 and echo the result"
Agent: → Calls calculate(add, 50, 75)
Agent: → Calls echo("125")
Agent: "The sum of 50 and 75 is 125. Here's the echo: 125"
```

### Chart Generation
```
User: "Create a line chart showing sales data"
Agent: → Calls generate_line_chart
Agent: → Returns ECharts JSON configuration
UI: → Renders the chart
```

## Features

- ✅ **Multi-turn conversations** - Maintains context
- ✅ **Tool chaining** - Can use multiple tools in sequence
- ✅ **Error handling** - Graceful failure recovery
- ✅ **Natural responses** - Friendly, conversational output

## Dependencies

- `LLMAgent` from `src/llm-agent.ts`
- `LLMService` (must be initialized first)
- Access to all MCP tools via `executeTool` callback

## Technical Details

- **Max iterations**: 5 (prevents infinite loops)
- **Tool exclusion**: Agent tools are filtered from available tools
- **System prompt**: Dynamically generated with tool descriptions
- **Conversation history**: Stored in memory (resets on agent_reset)
