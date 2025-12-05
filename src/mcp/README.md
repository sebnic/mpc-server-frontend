# MCP Servers Directory

This directory contains all Model Context Protocol (MCP) servers used in this project, organized by functionality.

## 📁 Structure

```
src/mcp/
├── basic-tools/        # Simple utility tools (time, echo, calculate)
├── llm/                # LLM provider integration (WebLLM, Gemini)
├── agent/              # AI Agent with function calling
├── echart/             # ECharts visualization generation
└── chart-discovery/    # Hierarchical chart discovery tools
```

## 🔧 Available Servers

### 1. Basic Tools (`basic-tools/`)
Simple demonstration tools:
- `get_time` - Current date/time
- `echo` - Echo messages
- `calculate` - Basic arithmetic

[📚 Documentation](./basic-tools/README.md)

### 2. LLM Server (`llm/`)
Language model integration:
- `llm_initialize` - Initialize provider (WebLLM/Gemini)
- `llm_status` - Get LLM status
- `llm_chat` - Chat with LLM

**Providers:**
- WebLLM (local, ~1GB)
- Gemini (API, requires key)

[📚 Documentation](./llm/README.md)

### 3. Agent Server (`agent/`)
AI agent with tool-calling capabilities:
- `agent_chat` - Chat with autonomous agent
- `agent_reset` - Reset conversation

**Features:**
- Multi-turn conversations
- Automatic tool selection
- Tool chaining

[📚 Documentation](./agent/README.md)

### 4. EChart Server (`echart/`)
ECharts visualization generation:
- `generate_line_chart` - Line/trend charts
- `generate_bar_chart` - Bar/comparison charts  
- `generate_pie_chart` - Pie/proportion charts
- `generate_scatter_chart` - Scatter plots
- `generate_custom_chart` - Custom configs

[📚 Documentation](./echart/README.md)

### 5. Chart Discovery (`chart-discovery/`)
Hierarchical chart discovery for efficient token usage:
- `get_chart_types` - List available chart types
- `get_chart_config_schema` - Get detailed schema

**Benefits:**
- 33-56% token savings
- Scalable architecture
- Dynamic discovery

[📚 Documentation](./chart-discovery/README.md) | [📊 Demo](../../HIERARCHY_DEMO.md)

## 🏗️ Architecture

### Integration Pattern

All servers are integrated into the main worker (`src/worker.ts`):

```typescript
// Import servers
import { basicToolsSchema, handleBasicTool } from './mcp/basic-tools/...';
import { getLLMToolsSchema, handleLLMTool } from './mcp/llm/...';
// ... etc

// Register tools
const allTools = [
  ...basicToolsSchema,
  ...getLLMToolsSchema(),
  ...echartToolsSchema,
  // ...
];

// Route tool calls
switch (toolName) {
  case 'get_time':
  case 'echo':
  case 'calculate':
    return handleBasicTool(toolName, args);
  
  case 'llm_initialize':
  case 'llm_status':
  case 'llm_chat':
    return handleLLMTool(toolName, args, llmService);
  
  // ... etc
}
```

### Standalone Mode

The EChart server can also run standalone via stdio:

```bash
cd src/mcp/echart
node echart-server.js
```

See [echart/STANDALONE.md](./echart/STANDALONE.md) for details.

## 📊 Tool Hierarchy

```
MCP Server (worker.ts)
├── Basic Tools (always available)
│   ├── get_time
│   ├── echo
│   └── calculate
├── LLM Tools (after initialization)
│   ├── llm_initialize
│   ├── llm_status
│   └── llm_chat
├── Agent Tools (uses LLM)
│   ├── agent_chat
│   └── agent_reset
├── Chart Discovery (metadata)
│   ├── get_chart_types
│   └── get_chart_config_schema
└── Chart Generation (execution)
    ├── generate_line_chart
    ├── generate_bar_chart
    ├── generate_pie_chart
    └── generate_scatter_chart
```

## 🎯 Usage Examples

### Direct Tool Call
```typescript
const client = new MCPBrowserClient();
await client.connect();

// Call any tool
const result = await client.callTool('get_time', {});
```

### Via Agent (Recommended)
```typescript
// Agent automatically selects and uses tools
const response = await client.callTool('agent_chat', {
  message: 'What time is it? And calculate 15 + 27'
});
// Agent calls get_time and calculate, returns natural response
```

### Chart Generation with AI
```typescript
const response = await client.callTool('agent_chat', {
  message: 'Create a line chart: Jan 100, Feb 150, Mar 200'
});
// Agent calls generate_line_chart, returns JSON config
// UI renders the chart
```

## 🔌 Adding New Servers

To add a new MCP server:

1. **Create directory:** `src/mcp/my-server/`
2. **Create server file:** `my-server-server.ts`
   ```typescript
   export const myToolsSchema = [/* tool definitions */];
   export async function handleMyTool(name, args) {/* handler */}
   ```
3. **Create README:** Document usage
4. **Integrate into worker:** Import and register in `src/worker.ts`

## 📖 Learn More

- [MCP Specification](https://spec.modelcontextprotocol.io/)
- [Project README](../../README.md)
- [Hierarchy Demo](../../HIERARCHY_DEMO.md)
- [Integration Guide](../../ECHART_INTEGRATION.md)

## 🏆 Best Practices

1. **Modularity**: Each server in its own directory
2. **Documentation**: Every server has a README
3. **Type Safety**: Use TypeScript interfaces
4. **Error Handling**: Graceful failures with helpful messages
5. **Testing**: Provide examples and test cases
6. **Token Efficiency**: Use hierarchical discovery when possible
