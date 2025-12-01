import * as webllm from '@mlc-ai/web-llm';

export class LLMService {
  private engine: webllm.MLCEngineInterface | null = null;
  private isInitializing = false;
  private isReady = false;

  async initialize(
    modelId: string = 'Llama-3.2-1B-Instruct-q4f32_1-MLC',
    onProgress?: (report: webllm.InitProgressReport) => void
  ): Promise<void> {
    if (this.isReady) {
      return;
    }

    if (this.isInitializing) {
      // Wait for initialization to complete
      while (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return;
    }

    this.isInitializing = true;

    try {
      console.log('[LLM] Initializing WebLLM with model:', modelId);
      
      this.engine = await webllm.CreateMLCEngine(modelId, {
        initProgressCallback: (report: webllm.InitProgressReport) => {
          console.log('[LLM] Progress:', report.text, report.progress);
          if (onProgress) {
            onProgress(report);
          }
        },
      });

      this.isReady = true;
      console.log('[LLM] WebLLM initialized successfully!');
    } catch (error) {
      console.error('[LLM] Failed to initialize:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  async chat(messages: Array<{ role: string; content: string }>): Promise<string> {
    if (!this.engine || !this.isReady) {
      throw new Error('LLM not initialized. Call initialize() first.');
    }

    try {
      const reply = await this.engine.chat.completions.create({
        messages,
      });

      return reply.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('[LLM] Chat error:', error);
      throw error;
    }
  }

  async generate(prompt: string, temperature: number = 0.7): Promise<string> {
    return this.chat([
      {
        role: 'user',
        content: prompt,
      },
    ]);
  }

  getStatus(): { isReady: boolean; isInitializing: boolean } {
    return {
      isReady: this.isReady,
      isInitializing: this.isInitializing,
    };
  }

  async reset(): Promise<void> {
    if (this.engine) {
      await this.engine.resetChat();
    }
  }
}
