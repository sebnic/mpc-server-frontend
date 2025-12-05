import { MCPBrowserClient } from './client.js';
import { ConfigManager } from './config-manager.js';
import { Logger } from './ui/logger.js';
import { ChartHandler } from './charts/chart-handler.js';
import { EventHandlers } from './ui/event-handlers.js';
import { appTemplate } from './ui/html-template.js';
import './ui/style.css';

// Initialize app
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = appTemplate;

// Initialize core services
const configManager = new ConfigManager();
const client = new MCPBrowserClient();
const logger = new Logger('logs');

// Initialize handlers
const chartHandler = new ChartHandler(client, logger);
const eventHandlers = new EventHandlers(client, logger, chartHandler);

// Setup all event handlers
eventHandlers.setupConnectionHandlers();
eventHandlers.setupLLMHandlers();
eventHandlers.setupAgentHandlers();
eventHandlers.setupToolHandlers();
eventHandlers.setupChartHandlers();

// Initialize configuration and pre-fill fields
ConfigManager.initialize().then(async () => {
  const config = await ConfigManager.getConfig();
  console.log('[App] Configuration loaded');
  
  // Pre-select default provider
  const defaultProvider = config.defaultProvider;
  const providerRadio = document.querySelector(
    `input[name="provider"][value="${defaultProvider}"]`
  ) as HTMLInputElement;
  if (providerRadio) {
    providerRadio.checked = true;
  }
  
  // Pre-fill Gemini config if available
  if (config.gemini.apiKey) {
    const apiKeyInput = document.getElementById('geminiApiKey') as HTMLInputElement;
    if (apiKeyInput) {
      apiKeyInput.value = config.gemini.apiKey;
      logger.log('Gemini API key loaded from configuration', 'info');
    }
  }
  
  // Pre-fill Gemini model
  if (config.gemini.model) {
    const modelInput = document.getElementById('geminiModel') as HTMLInputElement;
    if (modelInput) {
      modelInput.placeholder = `Model (default: ${config.gemini.model})`;
    }
  }
  
  // Show Gemini config if it's the default
  if (defaultProvider === 'gemini') {
    document.getElementById('geminiConfig')!.style.display = 'block';
  }
  
  // Ready message
  logger.log('Application ready. Click "Connect to Server" to start.', 'info');
});
