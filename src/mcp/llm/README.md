# LLM MCP Server

Language Model integration tools supporting WebLLM (local) and Gemini (API).

## Available Tools

### 1. llm_initialize
Initialize an LLM provider.

**Parameters:**
- `provider` (string, required): 'webllm' or 'gemini'
- `apiKey` (string, optional): Required for Gemini provider

**Example:**
```typescript
// WebLLM (local)
await client.callTool('llm_initialize', { 
  provider: 'webllm' 
});

// Gemini (API)
await client.callTool('llm_initialize', { 
  provider: 'gemini',
  apiKey: 'your-api-key'
});
```

### 2. llm_status
Get current LLM status.

**Parameters:** None

**Example:**
```typescript
await client.callTool('llm_status', {});
// Returns: { "initialized": true, "provider": "gemini" }
```

### 3. llm_chat
Send a message to the LLM.

**Parameters:**
- `prompt` (string, required): Message to send

**Example:**
```typescript
await client.callTool('llm_chat', { 
  prompt: 'What is the capital of France?' 
});
// Returns: "The capital of France is Paris."
```

## Providers

### WebLLM
- **Type**: Local inference
- **Model**: Llama 3.2 1B
- **Size**: ~1GB download
- **Pros**: Privacy, no API costs
- **Cons**: Initial download, slower on weak hardware

### Gemini
- **Type**: API-based
- **Model**: gemini-1.5-flash
- **Pros**: Fast, powerful, no local resources
- **Cons**: Requires API key, costs per token
- **Get Key**: [Google AI Studio](https://aistudio.google.com/apikey)

## Architecture

- `llm-server.ts`: Tool definitions and handlers
- Uses `LLMService` from `src/llm-service.ts`
- Integrated into main `worker.ts`
