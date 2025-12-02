import { CryptoService } from './crypto-service.js';

export interface AppConfig {
  gemini: {
    apiKey: string;
    model: string;
  };
  webllm: {
    model: string;
  };
  defaultProvider: 'webllm' | 'gemini';
}

export class ConfigManager {
  private static encryptedConfig: {
    geminiApiKey?: string;
  } = {};
  private static passphrase: string | null = null;
  private static isInitialized = false;

  /**
   * Initialize the config manager by encrypting secrets at startup
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('[Config] Initializing configuration...');

    // Generate device-specific passphrase
    this.passphrase = await CryptoService.generateDevicePassphrase();

    // Get values from environment variables (injected by Vite)
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

    // Encrypt sensitive data if provided
    if (geminiApiKey && geminiApiKey.trim()) {
      try {
        this.encryptedConfig.geminiApiKey = await CryptoService.encrypt(
          geminiApiKey,
          this.passphrase
        );
        console.log('[Config] Gemini API key encrypted successfully');
      } catch (error) {
        console.error('[Config] Failed to encrypt Gemini API key:', error);
      }
    }

    this.isInitialized = true;
    console.log('[Config] Configuration initialized');
  }

  /**
   * Get the full application configuration
   */
  static async getConfig(): Promise<AppConfig> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Decrypt Gemini API key if available
    let geminiApiKey = '';
    if (this.encryptedConfig.geminiApiKey && this.passphrase) {
      try {
        geminiApiKey = await CryptoService.decrypt(
          this.encryptedConfig.geminiApiKey,
          this.passphrase
        );
      } catch (error) {
        console.error('[Config] Failed to decrypt Gemini API key:', error);
      }
    }

    return {
      gemini: {
        apiKey: geminiApiKey,
        model: import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash',
      },
      webllm: {
        model: import.meta.env.VITE_WEBLLM_MODEL || 'Llama-3.2-1B-Instruct-q4f32_1-MLC',
      },
      defaultProvider:
        (import.meta.env.VITE_DEFAULT_PROVIDER as 'webllm' | 'gemini') || 'webllm',
    };
  }

  /**
   * Get Gemini API key (decrypted)
   */
  static async getGeminiApiKey(): Promise<string> {
    const config = await this.getConfig();
    return config.gemini.apiKey;
  }

  /**
   * Check if Gemini is configured
   */
  static async isGeminiConfigured(): Promise<boolean> {
    const apiKey = await this.getGeminiApiKey();
    return apiKey.length > 0;
  }

  /**
   * Update Gemini API key at runtime (will be encrypted)
   */
  static async setGeminiApiKey(apiKey: string): Promise<void> {
    if (!this.passphrase) {
      this.passphrase = await CryptoService.generateDevicePassphrase();
    }

    if (apiKey && apiKey.trim()) {
      this.encryptedConfig.geminiApiKey = await CryptoService.encrypt(
        apiKey,
        this.passphrase
      );
      console.log('[Config] Gemini API key updated and encrypted');
    } else {
      this.encryptedConfig.geminiApiKey = undefined;
      console.log('[Config] Gemini API key cleared');
    }
  }

  /**
   * Get the default provider
   */
  static async getDefaultProvider(): Promise<'webllm' | 'gemini'> {
    const config = await this.getConfig();
    return config.defaultProvider;
  }
}
