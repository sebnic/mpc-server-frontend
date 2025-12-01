import { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import { JSONRPCMessage } from '@modelcontextprotocol/sdk/types.js';

/**
 * Transport layer for MCP communication via Web Worker postMessage
 * Server-side (runs inside the Worker)
 */
export class WorkerServerTransport implements Transport {
  async start(): Promise<void> {
    // Listen for messages from the main thread
    self.addEventListener('message', this.handleMessage.bind(this));
  }

  async close(): Promise<void> {
    self.removeEventListener('message', this.handleMessage.bind(this));
  }

  async send(message: JSONRPCMessage): Promise<void> {
    // Send message to main thread
    self.postMessage(message);
  }

  private handleMessage(event: MessageEvent): void {
    const message = event.data as JSONRPCMessage;
    if (this.onmessage) {
      this.onmessage(message);
    }
  }

  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;
}

/**
 * Transport layer for MCP communication via Web Worker postMessage
 * Client-side (runs in the main thread)
 */
export class WorkerClientTransport implements Transport {
  constructor(private worker: Worker) {}

  async start(): Promise<void> {
    // Listen for messages from the worker
    this.worker.addEventListener('message', this.handleMessage.bind(this));
    this.worker.addEventListener('error', this.handleError.bind(this));
  }

  async close(): Promise<void> {
    this.worker.removeEventListener('message', this.handleMessage.bind(this));
    this.worker.removeEventListener('error', this.handleError.bind(this));
    this.worker.terminate();
  }

  async send(message: JSONRPCMessage): Promise<void> {
    // Send message to worker
    this.worker.postMessage(message);
  }

  private handleMessage(event: MessageEvent): void {
    const message = event.data as JSONRPCMessage;
    if (this.onmessage) {
      this.onmessage(message);
    }
  }

  private handleError(error: ErrorEvent): void {
    if (this.onerror) {
      this.onerror(new Error(error.message));
    }
  }

  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: (message: JSONRPCMessage) => void;
}
