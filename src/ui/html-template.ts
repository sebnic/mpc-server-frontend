// HTML template for the main application
export const appTemplate = `
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
          <input 
            type="password" 
            id="geminiApiKey" 
            placeholder="Enter Gemini API Key" 
            class="input-field"
            style="margin-bottom: 0.5rem;"
          />
          <input 
            type="text" 
            id="geminiModel" 
            placeholder="Model (e.g., gemini-2.5-flash, gemini-pro)" 
            class="input-field"
          />
          <small style="display: block; margin-top: 0.25rem; color: #666;">
            Get your key at <a href="https://aistudio.google.com/apikey" target="_blank">Google AI Studio</a>
          </small>
        </div>
        
        <button class="btn btn-primary" id="llmInitBtn">Initialize LLM</button>
        <button class="btn btn-secondary" id="llmStatusBtn">Check Status</button>
      </div>

      <div class="test-card">
        <h3>💬 LLM Chat</h3>
        <textarea id="llmPrompt" placeholder="Enter your message..."></textarea>
        <button class="btn btn-primary" id="llmChatBtn">Send to LLM</button>
        <div class="result" id="llmResult"></div>
      </div>

      <div class="test-card">
        <h3>🤖 Agent (LLM + Tools)</h3>
        <p class="description">The agent can use MCP tools to complete tasks</p>
        <textarea id="agentPrompt" placeholder="Example: What time is it? Calculate 15 + 27"></textarea>
        <button class="btn btn-primary" id="agentChatBtn">Ask Agent</button>
        <button class="btn btn-secondary" id="agentResetBtn">Reset Conversation</button>
        <div class="result" id="agentResult"></div>
      </div>

      <div class="test-card echart-card">
        <h3>📊 ECharts - AI Generation</h3>
        <p class="description">Describe the chart you want in natural language</p>
        
        <div class="chart-prompt-section">
          <textarea 
            id="chartPrompt" 
            placeholder="Example: Create a line chart showing monthly sales from January to June with values 120, 200, 150, 180, 220, 250"
            rows="3"
          ></textarea>
          <button class="btn btn-primary" id="generateChartBtn">🎨 Generate Chart with AI</button>
        </div>
        
        <div class="chart-divider">
          <span>OR try these examples</span>
        </div>
        
        <div class="chart-examples">
          <button class="btn btn-small" id="exampleLine">📈 Sales Example</button>
          <button class="btn btn-small" id="exampleBar">📊 Revenue Example</button>
          <button class="btn btn-small" id="examplePie">🥧 Market Share Example</button>
          <button class="btn btn-small" id="testDiscovery">🔍 Test Discovery (Hierarchy)</button>
        </div>
        
        <div id="chartDisplay" class="chart-container" style="display: none;">
          <div id="chartCanvas" style="width: 100%; height: 400px;"></div>
        </div>
        
        <details class="chart-config">
          <summary>View Configuration JSON</summary>
          <pre id="chartConfigJson"></pre>
        </details>
        
        <details class="chart-debug">
          <summary>🐛 Debug: View Agent Response</summary>
          <pre id="chartDebugResponse"></pre>
        </details>
      </div>

      <div class="test-card">
        <h3>⏰ Time Tool</h3>
        <button class="btn btn-primary" id="getTimeBtn">Get Current Time</button>
        <div class="result" id="timeResult"></div>
      </div>

      <div class="test-card">
        <h3>🔊 Echo Tool</h3>
        <input type="text" id="echoInput" placeholder="Enter message to echo" class="input-field" />
        <button class="btn btn-primary" id="echoBtn">Echo</button>
        <div class="result" id="echoResult"></div>
      </div>

      <div class="test-card">
        <h3>🧮 Calculator Tool</h3>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <input type="number" id="calcA" placeholder="a" class="input-field" style="width: 80px;" />
          <select id="calcOp" class="input-field" style="width: 100px;">
            <option value="add">+</option>
            <option value="subtract">-</option>
            <option value="multiply">×</option>
            <option value="divide">÷</option>
          </select>
          <input type="number" id="calcB" placeholder="b" class="input-field" style="width: 80px;" />
          <button class="btn btn-primary" id="calcBtn">Calculate</button>
        </div>
        <div class="result" id="calcResult"></div>
      </div>
    </div>

    <div class="section">
      <h2>Logs</h2>
      <div id="logs" class="logs"></div>
    </div>
  </div>
`;
