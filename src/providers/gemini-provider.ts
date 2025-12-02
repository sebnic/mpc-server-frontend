import {
  LLMProvider,
  ChatMessage,
  LLMResponse,
  LLMProviderConfig,
  InitProgressReport,
} from './llm-provider.interface.js';

export class GeminiProvider implements LLMProvider {
  private apiKey: string = '';
  private model: string = 'gemini-1.5-flash';
  private temperature: number = 0.7;
  private maxTokens: number = 1024;
  private isReady: boolean = false;
  private isInitializing: boolean = false;
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';

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
      if (!config.apiKey) {
        throw new Error('Gemini API key is required');
      }

      this.apiKey = config.apiKey;
      this.model = config.model || this.model;
      this.temperature = config.temperature ?? this.temperature;
      this.maxTokens = config.maxTokens ?? this.maxTokens;

      if (onProgress) {
        onProgress({ text: 'Validating Gemini API key...', progress: 0.5 });
      }

      // Test the API key with a simple request
      await this.testConnection();

      if (onProgress) {
        onProgress({ text: 'Gemini API ready!', progress: 1.0 });
      }

      this.isReady = true;
      console.log('[Gemini] Provider initialized successfully');
    } catch (error) {
      console.error('[Gemini] Failed to initialize:', error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  private async testConnection(): Promise<void> {
    try {
      const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: 'Hello' }],
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error?.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }
    } catch (error: any) {
      throw new Error(`Failed to connect to Gemini API: ${error.message}`);
    }
  }

  async chat(messages: ChatMessage[]): Promise<LLMResponse> {
    if (!this.isReady) {
      throw new Error('Gemini provider not initialized. Call initialize() first.');
    }

    try {
      // Convert messages to Gemini format
      const contents = this.convertMessagesToGemini(messages);

      const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: this.temperature,
            maxOutputTokens: this.maxTokens,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(
          error.error?.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      const usage = data.usageMetadata
        ? {
            promptTokens: data.usageMetadata.promptTokenCount,
            completionTokens: data.usageMetadata.candidatesTokenCount,
            totalTokens: data.usageMetadata.totalTokenCount,
          }
        : undefined;

      return {
        content,
        usage,
      };
    } catch (error: any) {
      console.error('[Gemini] Chat error:', error);
      throw new Error(`Gemini API error: ${error.message}`);
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
      providerName: 'Gemini',
    };
  }

  async reset(): Promise<void> {
    // Gemini is stateless, nothing to reset
    console.log('[Gemini] Reset called (stateless provider)');
  }

  private convertMessagesToGemini(messages: ChatMessage[]): any[] {
    // Gemini uses a different format than OpenAI
    // System messages need to be handled specially
    const contents: any[] = [];
    let systemInstruction = '';

    for (const msg of messages) {
      if (msg.role === 'system') {
        // Accumulate system messages
        systemInstruction += msg.content + '\n';
      } else {
        const role = msg.role === 'assistant' ? 'model' : 'user';
        contents.push({
          role,
          parts: [{ text: msg.content }],
        });
      }
    }

    // If we have system instructions, prepend them to the first user message
    if (systemInstruction && contents.length > 0 && contents[0].role === 'user') {
      contents[0].parts[0].text = `${systemInstruction.trim()}\n\n${contents[0].parts[0].text}`;
    }

    return contents;
  }
}
