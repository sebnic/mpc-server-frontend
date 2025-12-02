import {
  LLMProvider,
  ChatMessage,
  LLMProviderConfig,
  InitProgressReport,
} from './providers/llm-provider.interface.js';
import { WebLLMProvider } from './providers/webllm-provider.js';
import { GeminiProvider } from './providers/gemini-provider.js';

export type ProviderType = 'webllm' | 'gemini';

export class LLMService {
  private provider: LLMProvider | null = null;
  private currentProviderType: ProviderType | null = null;

  async initialize(
    providerType: ProviderType,
    config: LLMProviderConfig,
    onProgress?: (report: InitProgressReport) => void
  ): Promise<void> {
    try {
      console.log(`[LLM] Initializing ${providerType} provider...`);

      // Create the appropriate provider
      switch (providerType) {
        case 'webllm':
          this.provider = new WebLLMProvider();
          break;
        case 'gemini':
          this.provider = new GeminiProvider();
          break;
        default:
          throw new Error(`Unknown provider type: ${providerType}`);
      }

      // Initialize the provider
      await this.provider.initialize(config, onProgress);
      this.currentProviderType = providerType;

      console.log(`[LLM] ${providerType} provider initialized successfully!`);
    } catch (error) {
      console.error('[LLM] Failed to initialize:', error);
      this.provider = null;
      this.currentProviderType = null;
      throw error;
    }
  }

  async chat(messages: ChatMessage[]): Promise<string> {
    if (!this.provider) {
      throw new Error('LLM not initialized. Call initialize() first.');
    }

    try {
      const response = await this.provider.chat(messages);
      return response.content;
    } catch (error) {
      console.error('[LLM] Chat error:', error);
      throw error;
    }
  }

  async generate(prompt: string): Promise<string> {
    if (!this.provider) {
      throw new Error('LLM not initialized. Call initialize() first.');
    }

    return this.provider.generate(prompt);
  }

  getStatus(): { 
    isReady: boolean; 
    isInitializing: boolean; 
    providerName?: string;
  } {
    if (!this.provider) {
      return {
        isReady: false,
        isInitializing: false,
      };
    }

    return this.provider.getStatus();
  }

  getCurrentProvider(): ProviderType | null {
    return this.currentProviderType;
  }

  async reset(): Promise<void> {
    if (this.provider) {
      await this.provider.reset();
    }
  }
}
