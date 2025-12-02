import * as webllm from '@mlc-ai/web-llm';
import {
  LLMProvider,
  ChatMessage,
  LLMResponse,
  LLMProviderConfig,
  InitProgressReport,
} from './llm-provider.interface.js';

export class WebLLMProvider implements LLMProvider {
  private engine: webllm.MLCEngineInterface | null = null;
  private isInitializing = false;
  private isReady = false;
  private modelId: string = 'Llama-3.2-1B-Instruct-q4f32_1-MLC';

  async initialize(
    config: LLMProviderConfig,
    onProgress?: (report: InitProgressReport) => void
  ): Promise<void> {
    if (this.isReady) {
      return;
    }

    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    this.isInitializing = true;

    try {
      this.modelId = config.model || this.modelId;
      console.log('[WebLLM] Initializing with model:', this.modelId);

      this.engine = await webllm.CreateMLCEngine(this.modelId, {
        initProgressCallback: (report: webllm.InitProgressReport) => {
          console.log('[WebLLM] Progress:', report.text, report.progress);
          if (onProgress) {
            onProgress({
              text: report.text,
              progress: report.progress,
            });
          }
        },
      });

      this.isReady = true;
      console.log('[WebLLM] Initialized successfully!');
    } catch (error) {
      console.error('[WebLLM] Failed to initialize:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  async chat(messages: ChatMessage[]): Promise<LLMResponse> {
    if (!this.engine || !this.isReady) {
      throw new Error('WebLLM not initialized. Call initialize() first.');
    }

    try {
      const reply = await this.engine.chat.completions.create({
        messages: messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      });

      return {
        content: reply.choices[0]?.message?.content || '',
        usage: reply.usage
          ? {
              promptTokens: reply.usage.prompt_tokens,
              completionTokens: reply.usage.completion_tokens,
              totalTokens: reply.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      console.error('[WebLLM] Chat error:', error);
      throw error;
    }
  }

  async generate(prompt: string): Promise<string> {
    const response = await this.chat([
      {
        role: 'user',
        content: prompt,
      },
    ]);
    return response.content;
  }

  getStatus() {
    return {
      isReady: this.isReady,
      isInitializing: this.isInitializing,
      providerName: 'WebLLM',
    };
  }

  async reset(): Promise<void> {
    if (this.engine) {
      await this.engine.resetChat();
    }
  }
}
