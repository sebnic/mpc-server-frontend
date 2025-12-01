import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { WorkerClientTransport } from './transport.js';

export class MCPBrowserClient {
  private client: Client;
  public worker: Worker; // Exposed for progress listeners
  private transport: WorkerClientTransport;

  constructor() {
    // Create the worker
    this.worker = new Worker(new URL('./worker.ts', import.meta.url), {
      type: 'module',
    });

    // Create transport and client
    this.transport = new WorkerClientTransport(this.worker);
    this.client = new Client(
      {
        name: 'browser-mcp-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );
  }

  async connect(): Promise<void> {
    await this.client.connect(this.transport);
    console.log('[Client] Connected to MCP Server');
  }

  async listTools() {
    const response = await this.client.listTools();
    return response.tools;
  }

  async callTool(name: string, args?: Record<string, unknown>) {
    const response = await this.client.callTool({ name, arguments: args });
    return response;
  }

  async disconnect(): Promise<void> {
    await this.client.close();
    console.log('[Client] Disconnected from MCP Server');
  }
}
