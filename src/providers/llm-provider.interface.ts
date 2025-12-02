/**
 * Generic interface for LLM providers
 * Supports both local (WebLLM) and remote (Gemini, OpenAI, etc.) models
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface InitProgressReport {
  text: string;
  progress: number;
}

export interface LLMProviderConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  [key: string]: any;
}

export interface LLMProvider {
  /**
   * Initialize the provider (download models, setup API, etc.)
   */
  initialize(
    config: LLMProviderConfig,
    onProgress?: (report: InitProgressReport) => void
  ): Promise<void>;

  /**
   * Chat with the LLM
   */
  chat(messages: ChatMessage[]): Promise<LLMResponse>;

  /**
   * Generate a response from a single prompt
   */
  generate(prompt: string): Promise<string>;

  /**
   * Get the status of the provider
   */
  getStatus(): {
    isReady: boolean;
    isInitializing: boolean;
    providerName: string;
  };

  /**
   * Reset conversation state if applicable
   */
  reset(): Promise<void>;
}
