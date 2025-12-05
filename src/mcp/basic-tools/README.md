# Basic Tools MCP Server

Simple utility tools for demonstration purposes.

## Available Tools

### 1. get_time
Get the current date and time.

**Parameters:** None

**Example:**
```typescript
await client.callTool('get_time', {});
// Returns: "12/5/2025, 11:30:00 PM"
```

### 2. echo
Echo a message back.

**Parameters:**
- `message` (string, required): Message to echo

**Example:**
```typescript
await client.callTool('echo', { message: 'Hello World' });
// Returns: "Hello World"
```

### 3. calculate
Perform basic arithmetic operations.

**Parameters:**
- `operation` (string, required): Operation to perform (add, subtract, multiply, divide)
- `a` (number, required): First number
- `b` (number, required): Second number

**Example:**
```typescript
await client.callTool('calculate', { 
  operation: 'add', 
  a: 5, 
  b: 3 
});
// Returns: "5 add 3 = 8"
```

## Usage

These tools are automatically loaded in the main worker and don't need standalone execution.

## Architecture

- `basic-tools-server.ts`: Tool definitions and handlers
- Integrated into main `worker.ts` via imports
