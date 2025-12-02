import { MCPBrowserClient } from './client.js';
import { ConfigManager } from './config-manager.js';
import './style.css';

const app = document.querySelector<HTMLDivElement>('#app')!;

app.innerHTML = `
  <div class="container">
    <h1>🚀 MCP Server in Browser POC</h1>
    <p class="subtitle">Model Context Protocol running in a Web Worker</p>
    
    <div class="status">
      <span id="status">Disconnected</span>
    </div>

    <div class="section">
      <button id="connectBtn" class="btn btn-primary">Connect to Server</button>
      <button id="disconnectBtn" class="btn btn-secondary" disabled>Disconnect</button>
    </div>

    <div id="toolsSection" class="section" style="display: none;">
      <h2>Available Tools</h2>
      <div id="toolsList"></div>
    </div>

    <div id="testSection" class="section" style="display: none;">
      <h2>Test Tools</h2>

      <div class="test-card llm-card">
        <h3>🤖 LLM Provider</h3>
        <div class="llm-info">
          <p><strong>Status:</strong> <span id="llmStatus">Not Initialized</span></p>
          <div id="llmProgress" class="progress-bar" style="display: none;">
            <div class="progress-fill" id="llmProgressFill"></div>
            <span class="progress-text" id="llmProgressText">Initializing...</span>
          </div>
        </div>
        
        <div class="provider-selection">
          <label>
            <input type="radio" name="provider" value="webllm" checked />
            <strong>WebLLM</strong> (Local - Llama 3.2 1B, ~1GB download)
          </label>
          <label>
            <input type="radio" name="provider" value="gemini" />
            <strong>Gemini</strong> (API - requires API key)
          </label>
        </div>
        
        <div id="geminiConfig" style="display: none; margin-top: 0.5rem;">
          <input type="password" id="geminiApiKey" placeholder="Enter Gemini API Key" style="width: 100%; margin-bottom: 0.5rem;" />
          <input type="text" id="geminiModel" placeholder="Model (default: gemini-1.5-flash)" style="width: 100%;" />
        </div>
        
        <button class="btn btn-primary" id="llmInitBtn">Initialize LLM</button>
        <button class="btn" id="llmStatusBtn">Check Status</button>
        
        <div id="llmChatSection" style="display: none; margin-top: 1rem;">
          <h4>💬 Simple Chat (LLM only)</h4>
          <textarea id="llmPrompt" placeholder="Ask the LLM anything..." rows="2"></textarea>
          <button class="btn btn-primary" id="llmChatBtn">Send to LLM</button>
          <div class="result" id="llmResult"></div>
        </div>
      </div>

      <div class="test-card agent-card" id="agentSection" style="display: none;">
        <h3>🧠 AI Agent (LLM + MCP Tools)</h3>
        <p class="agent-description">
          This agent can use MCP tools (get_time, calculate, echo) to answer your questions!
        </p>
        <div class="agent-examples">
          <strong>Try asking:</strong>
          <ul>
            <li>"What time is it?"</li>
            <li>"Calculate 23 times 45"</li>
            <li>"What time is it and what's 10 plus 5?"</li>
          </ul>
        </div>
        <textarea id="agentPrompt" placeholder="Ask the agent anything. It can use tools to help answer!" rows="3"></textarea>
        <button class="btn btn-primary" id="agentChatBtn">Ask Agent</button>
        <button class="btn" id="agentResetBtn">Reset Conversation</button>
        <div class="result" id="agentResult"></div>
      </div>
      
      <div class="test-card">
        <h3>Get Time</h3>
        <button class="btn" id="getTimeBtn">Get Current Time</button>
        <div class="result" id="timeResult"></div>
      </div>

      <div class="test-card">
        <h3>Echo</h3>
        <input type="text" id="echoInput" placeholder="Enter a message" />
        <button class="btn" id="echoBtn">Echo Message</button>
        <div class="result" id="echoResult"></div>
      </div>

      <div class="test-card">
        <h3>Calculate</h3>
        <div class="calc-inputs">
          <input type="number" id="calcA" placeholder="Number A" value="10" />
          <select id="calcOp">
            <option value="add">+</option>
            <option value="subtract">-</option>
            <option value="multiply">×</option>
            <option value="divide">÷</option>
          </select>
          <input type="number" id="calcB" placeholder="Number B" value="5" />
        </div>
        <button class="btn" id="calcBtn">Calculate</button>
        <div class="result" id="calcResult"></div>
      </div>
    </div>

    <div class="section">
      <h2>Console</h2>
      <div id="console" class="console"></div>
    </div>
  </div>
`;

// Initialize client
let client: MCPBrowserClient | null = null;

// Initialize configuration on startup
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
    (document.getElementById('geminiApiKey') as HTMLInputElement).value = config.gemini.apiKey;
    (document.getElementById('geminiModel') as HTMLInputElement).placeholder = config.gemini.model;
    log('Gemini API key loaded from configuration', 'info');
  }
  
  // Show Gemini config if it's the default
  if (defaultProvider === 'gemini') {
    document.getElementById('geminiConfig')!.style.display = 'block';
  }
});

// Helper function to log to console
function log(message: string, type: 'info' | 'error' | 'success' = 'info') {
  const consoleDiv = document.getElementById('console')!;
  const entry = document.createElement('div');
  entry.className = `console-entry console-${type}`;
  entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  consoleDiv.appendChild(entry);
  consoleDiv.scrollTop = consoleDiv.scrollHeight;
}

// Handle provider selection
document.querySelectorAll('input[name="provider"]').forEach((radio) => {
  radio.addEventListener('change', (e) => {
    const provider = (e.target as HTMLInputElement).value;
    const geminiConfig = document.getElementById('geminiConfig')!;
    geminiConfig.style.display = provider === 'gemini' ? 'block' : 'none';
  });
});

// Listen for LLM progress updates
function setupLLMProgressListener() {
  if (client && (client as any).worker) {
    (client as any).worker.addEventListener('message', (event: MessageEvent) => {
      console.log('[Main] Worker message:', event.data);
      
      if (event.data.type === 'llm_progress') {
        const progressBar = document.getElementById('llmProgress')!;
        const progressFill = document.getElementById('llmProgressFill')!;
        const progressText = document.getElementById('llmProgressText')!;
        
        progressBar.style.display = 'block';
        progressFill.style.width = `${event.data.data.progress * 100}%`;
        progressText.textContent = event.data.data.text;
        
        log(`LLM Progress: ${Math.round(event.data.data.progress * 100)}% - ${event.data.data.text}`, 'info');
        
        if (event.data.data.progress >= 1) {
          setTimeout(() => {
            progressBar.style.display = 'none';
          }, 2000);
        }
      }
    });
  }
}

// Connect button
document.getElementById('connectBtn')!.addEventListener('click', async () => {
  try {
    log('Connecting to MCP Server...');
    client = new MCPBrowserClient();
    await client.connect();
    
    setupLLMProgressListener();
    
    document.getElementById('status')!.textContent = 'Connected ✓';
    document.getElementById('status')!.className = 'connected';
    (document.getElementById('connectBtn') as HTMLButtonElement).disabled = true;
    (document.getElementById('disconnectBtn') as HTMLButtonElement).disabled = false;
    
    log('Connected successfully!', 'success');
    
    // List tools
    const tools = await client.listTools();
    log(`Found ${tools.length} tools`, 'success');
    
    const toolsList = document.getElementById('toolsList')!;
    toolsList.innerHTML = tools
      .map(
        (tool) => `
        <div class="tool-item">
          <strong>${tool.name}</strong>: ${tool.description}
        </div>
      `
      )
      .join('');
    
    document.getElementById('toolsSection')!.style.display = 'block';
    document.getElementById('testSection')!.style.display = 'block';
  } catch (error) {
    log(`Connection failed: ${error}`, 'error');
    console.error(error);
  }
});

// Disconnect button
document.getElementById('disconnectBtn')!.addEventListener('click', async () => {
  try {
    if (client) {
      await client.disconnect();
      client = null;
    }
    
    document.getElementById('status')!.textContent = 'Disconnected';
    document.getElementById('status')!.className = '';
    (document.getElementById('connectBtn') as HTMLButtonElement).disabled = false;
    (document.getElementById('disconnectBtn') as HTMLButtonElement).disabled = true;
    
    document.getElementById('toolsSection')!.style.display = 'none';
    document.getElementById('testSection')!.style.display = 'none';
    
    log('Disconnected', 'info');
  } catch (error) {
    log(`Disconnect failed: ${error}`, 'error');
  }
});

// Get Time button
document.getElementById('getTimeBtn')!.addEventListener('click', async () => {
  try {
    log('Calling get_time tool...');
    const result = await client!.callTool('get_time');
    const text = result.content[0].type === 'text' ? result.content[0].text : '';
    document.getElementById('timeResult')!.textContent = text;
    log(`Result: ${text}`, 'success');
  } catch (error) {
    log(`Error: ${error}`, 'error');
  }
});

// Echo button
document.getElementById('echoBtn')!.addEventListener('click', async () => {
  try {
    const message = (document.getElementById('echoInput') as HTMLInputElement).value;
    log(`Calling echo tool with: "${message}"`);
    const result = await client!.callTool('echo', { message });
    const text = result.content[0].type === 'text' ? result.content[0].text : '';
    document.getElementById('echoResult')!.textContent = text;
    log(`Result: ${text}`, 'success');
  } catch (error) {
    log(`Error: ${error}`, 'error');
  }
});

// Calculate button
document.getElementById('calcBtn')!.addEventListener('click', async () => {
  try {
    const a = parseFloat((document.getElementById('calcA') as HTMLInputElement).value);
    const b = parseFloat((document.getElementById('calcB') as HTMLInputElement).value);
    const operation = (document.getElementById('calcOp') as HTMLSelectElement).value;
    
    log(`Calling calculate tool: ${a} ${operation} ${b}`);
    const result = await client!.callTool('calculate', { operation, a, b });
    const text = result.content[0].type === 'text' ? result.content[0].text : '';
    document.getElementById('calcResult')!.textContent = text;
    log(`Result: ${text}`, 'success');
  } catch (error) {
    log(`Error: ${error}`, 'error');
  }
});

// LLM Initialize button
document.getElementById('llmInitBtn')!.addEventListener('click', async () => {
  try {
    const provider = (document.querySelector('input[name="provider"]:checked') as HTMLInputElement).value;
    const args: any = { provider };
    
    if (provider === 'gemini') {
      let apiKey = (document.getElementById('geminiApiKey') as HTMLInputElement).value;
      const model = (document.getElementById('geminiModel') as HTMLInputElement).value;
      
      // If no API key in field, try to get from config
      if (!apiKey) {
        apiKey = await ConfigManager.getGeminiApiKey();
      } else {
        // Save the new API key to encrypted config
        await ConfigManager.setGeminiApiKey(apiKey);
      }
      
      if (!apiKey) {
        log('Please enter a Gemini API key or configure it in .env', 'error');
        return;
      }
      
      args.apiKey = apiKey;
      
      // Use model from config if not specified
      if (model) {
        args.model = model;
      } else {
        const config = await ConfigManager.getConfig();
        args.model = config.gemini.model;
      }
      
      log('Initializing Gemini provider...');
    } else {
      const config = await ConfigManager.getConfig();
      args.model = config.webllm.model;
      log('Initializing WebLLM... This may take a while (downloading ~1GB model)');
    }
    
    document.getElementById('llmStatus')!.textContent = 'Initializing...';
    (document.getElementById('llmInitBtn') as HTMLButtonElement).disabled = true;
    
    const result = await client!.callTool('llm_initialize', args);
    const text = result.content[0].type === 'text' ? result.content[0].text : '';
    
    document.getElementById('llmStatus')!.textContent = 'Ready ✓';
    document.getElementById('llmStatus')!.style.color = '#16a34a';
    document.getElementById('llmChatSection')!.style.display = 'block';
    document.getElementById('agentSection')!.style.display = 'block';
    
    log(`LLM: ${text}`, 'success');
  } catch (error) {
    log(`LLM Error: ${error}`, 'error');
    document.getElementById('llmStatus')!.textContent = 'Failed';
    (document.getElementById('llmInitBtn') as HTMLButtonElement).disabled = false;
  }
});

// LLM Status button
document.getElementById('llmStatusBtn')!.addEventListener('click', async () => {
  try {
    const result = await client!.callTool('llm_status');
    const text = result.content[0].type === 'text' ? result.content[0].text : '';
    log(`LLM Status: ${text}`, 'info');
  } catch (error) {
    log(`Error: ${error}`, 'error');
  }
});

// LLM Chat button
document.getElementById('llmChatBtn')!.addEventListener('click', async () => {
  try {
    const prompt = (document.getElementById('llmPrompt') as HTMLTextAreaElement).value;
    if (!prompt.trim()) {
      log('Please enter a prompt', 'error');
      return;
    }
    
    log(`Sending to LLM: "${prompt}"`);
    document.getElementById('llmResult')!.textContent = 'Thinking...';
    (document.getElementById('llmChatBtn') as HTMLButtonElement).disabled = true;
    
    const result = await client!.callTool('llm_chat', { prompt });
    const text = result.content[0].type === 'text' ? result.content[0].text : '';
    
    document.getElementById('llmResult')!.textContent = text;
    log(`LLM Response received`, 'success');
    (document.getElementById('llmChatBtn') as HTMLButtonElement).disabled = false;
  } catch (error) {
    log(`LLM Error: ${error}`, 'error');
    document.getElementById('llmResult')!.textContent = `Error: ${error}`;
    (document.getElementById('llmChatBtn') as HTMLButtonElement).disabled = false;
  }
});

// Agent Chat button
document.getElementById('agentChatBtn')!.addEventListener('click', async () => {
  try {
    const message = (document.getElementById('agentPrompt') as HTMLTextAreaElement).value;
    if (!message.trim()) {
      log('Please enter a message', 'error');
      return;
    }
    
    log(`Asking agent: "${message}"`);
    document.getElementById('agentResult')!.textContent = 'Agent thinking and using tools...';
    (document.getElementById('agentChatBtn') as HTMLButtonElement).disabled = true;
    
    const result = await client!.callTool('agent_chat', { message });
    const text = result.content[0].type === 'text' ? result.content[0].text : '';
    
    document.getElementById('agentResult')!.textContent = text;
    log(`Agent response received`, 'success');
    (document.getElementById('agentChatBtn') as HTMLButtonElement).disabled = false;
  } catch (error) {
    log(`Agent Error: ${error}`, 'error');
    document.getElementById('agentResult')!.textContent = `Error: ${error}`;
    (document.getElementById('agentChatBtn') as HTMLButtonElement).disabled = false;
  }
});

// Agent Reset button
document.getElementById('agentResetBtn')!.addEventListener('click', async () => {
  try {
    await client!.callTool('agent_reset');
    document.getElementById('agentResult')!.textContent = '';
    (document.getElementById('agentPrompt') as HTMLTextAreaElement).value = '';
    log('Agent conversation reset', 'success');
  } catch (error) {
    log(`Error: ${error}`, 'error');
  }
});

log('Application ready. Click "Connect to Server" to start.');
