import { MCPBrowserClient } from '../client.js';
import { Logger } from '../ui/logger.js';
import { ChartHandler } from '../charts/chart-handler.js';
import { ConfigManager } from '../config-manager.js';

export class EventHandlers {
  constructor(
    private client: MCPBrowserClient,
    private logger: Logger,
    private chartHandler: ChartHandler
  ) {}

  setupConnectionHandlers() {
    // Connect button
    document.getElementById('connectBtn')!.addEventListener('click', async () => {
      try {
        await this.client.connect();
        document.getElementById('status')!.textContent = 'Connected';
        document.getElementById('status')!.className = 'connected';
        (document.getElementById('connectBtn') as HTMLButtonElement).disabled = true;
        (document.getElementById('disconnectBtn') as HTMLButtonElement).disabled = false;
        
        document.getElementById('toolsSection')!.style.display = 'block';
        document.getElementById('testSection')!.style.display = 'block';
        
        this.logger.log('Connected to MCP server', 'success');
        
        const toolsResult = await this.client.listTools();
        const toolsList = document.getElementById('toolsList')!;
        const toolsArray = (toolsResult as any).tools || toolsResult;
        toolsList.innerHTML = toolsArray
          .map((tool: any) => `
            <div class="tool-item">
              <strong>${tool.name}</strong>: ${tool.description}
            </div>
          `)
          .join('');
      } catch (error) {
        this.logger.log(`Connection error: ${error}`, 'error');
      }
    });

    // Disconnect button
    document.getElementById('disconnectBtn')!.addEventListener('click', async () => {
      await this.client.disconnect();
      document.getElementById('status')!.textContent = 'Disconnected';
      document.getElementById('status')!.className = '';
      (document.getElementById('connectBtn') as HTMLButtonElement).disabled = false;
      (document.getElementById('disconnectBtn') as HTMLButtonElement).disabled = true;
      
      document.getElementById('toolsSection')!.style.display = 'none';
      document.getElementById('testSection')!.style.display = 'none';
      
      this.logger.log('Disconnected from server', 'info');
    });
  }

  setupLLMHandlers() {
    // Provider selection
    document.querySelectorAll('input[name="provider"]').forEach((radio) => {
      radio.addEventListener('change', (e) => {
        const provider = (e.target as HTMLInputElement).value;
        const geminiConfig = document.getElementById('geminiConfig')!;
        geminiConfig.style.display = provider === 'gemini' ? 'block' : 'none';
      });
    });

    // LLM Initialize button
    document.getElementById('llmInitBtn')!.addEventListener('click', async () => {
      try {
        const selectedProvider = (document.querySelector('input[name="provider"]:checked') as HTMLInputElement).value as 'webllm' | 'gemini';
        
        const args: any = { provider: selectedProvider };
        
        if (selectedProvider === 'gemini') {
          let apiKey = (document.getElementById('geminiApiKey') as HTMLInputElement).value;
          const modelInput = (document.getElementById('geminiModel') as HTMLInputElement).value;
          
          // If no API key in field, try to get from config
          if (!apiKey) {
            apiKey = await ConfigManager.getGeminiApiKey();
          } else {
            // Save the new API key to encrypted config
            await ConfigManager.setGeminiApiKey(apiKey);
          }
          
          if (!apiKey) {
            this.logger.log('Please enter a Gemini API key or configure it in .env', 'error');
            return;
          }
          
          args.apiKey = apiKey;
          
          // Use model from input field if specified, otherwise from config
          if (modelInput) {
            args.model = modelInput;
          } else {
            const config = await ConfigManager.getConfig();
            args.model = config.gemini.model;
          }
          
          this.logger.log('Initializing Gemini provider...', 'info');
        } else {
          // WebLLM - get model from config
          const config = await ConfigManager.getConfig();
          args.model = config.webllm.model;
          this.logger.log('Initializing WebLLM... This may take a while (downloading ~1GB model)', 'info');
        }

        document.getElementById('llmStatus')!.textContent = 'Initializing...';
        
        if (selectedProvider === 'webllm') {
          const progressBar = document.getElementById('llmProgress')!;
          progressBar.style.display = 'block';
          document.getElementById('llmProgressText')!.textContent = 'Downloading model...';
          
          await this.client.callTool('llm_initialize', args);
          
          progressBar.style.display = 'none';
        } else {
          await this.client.callTool('llm_initialize', args);
        }

        document.getElementById('llmStatus')!.textContent = 'Ready';
        document.getElementById('llmStatus')!.style.color = '#16a34a';
        this.logger.log('LLM initialized successfully', 'success');
      } catch (error) {
        this.logger.log(`LLM initialization error: ${error}`, 'error');
        document.getElementById('llmStatus')!.textContent = 'Error';
        document.getElementById('llmStatus')!.style.color = '#dc2626';
      }
    });

    // LLM Status button
    document.getElementById('llmStatusBtn')!.addEventListener('click', async () => {
      try {
        const result = await this.client.callTool('llm_status');
        const text = (result as any).content?.[0]?.type === 'text' ? (result as any).content[0].text : '';
        this.logger.log(`LLM Status: ${text}`, 'info');
      } catch (error) {
        this.logger.log(`Error: ${error}`, 'error');
      }
    });

    // LLM Chat button
    document.getElementById('llmChatBtn')!.addEventListener('click', async () => {
      try {
        const prompt = (document.getElementById('llmPrompt') as HTMLTextAreaElement).value;
        if (!prompt.trim()) {
          this.logger.log('Please enter a prompt', 'error');
          return;
        }
        
        this.logger.log(`Sending to LLM: "${prompt}"`, 'info');
        document.getElementById('llmResult')!.textContent = 'Thinking...';
        (document.getElementById('llmChatBtn') as HTMLButtonElement).disabled = true;
        
        const result = await this.client.callTool('llm_chat', { prompt });
        const text = (result as any).content?.[0]?.type === 'text' ? (result as any).content[0].text : '';
        
        document.getElementById('llmResult')!.textContent = text;
        this.logger.log(`LLM Response received`, 'success');
        
        (document.getElementById('llmChatBtn') as HTMLButtonElement).disabled = false;
      } catch (error) {
        this.logger.log(`Error: ${error}`, 'error');
        (document.getElementById('llmChatBtn') as HTMLButtonElement).disabled = false;
      }
    });
  }

  setupAgentHandlers() {
    // Agent Chat button
    document.getElementById('agentChatBtn')!.addEventListener('click', async () => {
      try {
        const prompt = (document.getElementById('agentPrompt') as HTMLTextAreaElement).value;
        if (!prompt.trim()) {
          this.logger.log('Please enter a prompt', 'error');
          return;
        }
        
        this.logger.log(`Sending to Agent: "${prompt}"`, 'info');
        document.getElementById('agentResult')!.textContent = 'Thinking and using tools...';
        (document.getElementById('agentChatBtn') as HTMLButtonElement).disabled = true;
        
        const result = await this.client.callTool('agent_chat', { message: prompt });
        const text = (result as any).content?.[0]?.type === 'text' ? (result as any).content[0].text : '';
        
        document.getElementById('agentResult')!.textContent = text;
        this.logger.log(`Agent Response received`, 'success');
        
        (document.getElementById('agentChatBtn') as HTMLButtonElement).disabled = false;
      } catch (error) {
        this.logger.log(`Error: ${error}`, 'error');
        (document.getElementById('agentChatBtn') as HTMLButtonElement).disabled = false;
      }
    });

    // Agent Reset button
    document.getElementById('agentResetBtn')!.addEventListener('click', async () => {
      try {
        await this.client.callTool('agent_reset');
        document.getElementById('agentResult')!.textContent = '';
        (document.getElementById('agentPrompt') as HTMLTextAreaElement).value = '';
        this.logger.log('Agent conversation reset', 'success');
      } catch (error) {
        this.logger.log(`Error: ${error}`, 'error');
      }
    });
  }

  setupToolHandlers() {
    // Time button
    document.getElementById('getTimeBtn')!.addEventListener('click', async () => {
      try {
        const result = await this.client.callTool('get_time');
        const text = (result as any).content?.[0]?.type === 'text' ? (result as any).content[0].text : '';
        document.getElementById('timeResult')!.textContent = text;
        this.logger.log('Got current time', 'success');
      } catch (error) {
        this.logger.log(`Error: ${error}`, 'error');
      }
    });

    // Echo button
    document.getElementById('echoBtn')!.addEventListener('click', async () => {
      try {
        const message = (document.getElementById('echoInput') as HTMLInputElement).value;
        const result = await this.client.callTool('echo', { message });
        const text = (result as any).content?.[0]?.type === 'text' ? (result as any).content[0].text : '';
        document.getElementById('echoResult')!.textContent = text;
        this.logger.log('Echo successful', 'success');
      } catch (error) {
        this.logger.log(`Error: ${error}`, 'error');
      }
    });

    // Calculator button
    document.getElementById('calcBtn')!.addEventListener('click', async () => {
      try {
        const a = parseFloat((document.getElementById('calcA') as HTMLInputElement).value);
        const b = parseFloat((document.getElementById('calcB') as HTMLInputElement).value);
        const operation = (document.getElementById('calcOp') as HTMLSelectElement).value;
        
        const result = await this.client.callTool('calculate', { operation, a, b });
        const text = (result as any).content?.[0]?.type === 'text' ? (result as any).content[0].text : '';
        document.getElementById('calcResult')!.textContent = text;
        this.logger.log('Calculation successful', 'success');
      } catch (error) {
        this.logger.log(`Error: ${error}`, 'error');
      }
    });
  }

  setupChartHandlers() {
    // Generate Chart with AI
    document.getElementById('generateChartBtn')!.addEventListener('click', async () => {
      const prompt = (document.getElementById('chartPrompt') as HTMLTextAreaElement).value;
      if (!prompt.trim()) {
        this.logger.log('Please enter a chart description', 'error');
        return;
      }
      await this.chartHandler.generateWithAI(prompt);
    });

    // Example buttons
    document.getElementById('exampleLine')!.addEventListener('click', () => {
      this.chartHandler.renderChart('generate_line_chart', {
        title: 'Monthly Sales 2024',
        xAxisData: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        series: [
          { name: '2024', data: [120, 200, 150, 180, 220, 250] },
          { name: '2023', data: [100, 180, 140, 160, 200, 230] }
        ]
      });
    });

    document.getElementById('exampleBar')!.addEventListener('click', () => {
      this.chartHandler.renderChart('generate_bar_chart', {
        title: 'Quarterly Revenue',
        xAxisData: ['Q1', 'Q2', 'Q3', 'Q4'],
        series: [
          { name: 'Product A', data: [1500, 1800, 2100, 2400] },
          { name: 'Product B', data: [1200, 1400, 1600, 1800] }
        ]
      });
    });

    document.getElementById('examplePie')!.addEventListener('click', () => {
      this.chartHandler.renderChart('generate_pie_chart', {
        title: 'Market Share 2025',
        data: [
          { name: 'Product A', value: 335 },
          { name: 'Product B', value: 234 },
          { name: 'Product C', value: 158 },
          { name: 'Product D', value: 147 },
          { name: 'Others', value: 126 }
        ]
      });
    });

    // Test Discovery button - demonstrates hierarchy
    document.getElementById('testDiscovery')!.addEventListener('click', async () => {
      try {
        this.logger.log('🔍 Step 1: Discovering available chart types...', 'info');
        const typesResult = await this.client.callTool('get_chart_types', {});
        const typesText = (typesResult as any).content?.[0]?.type === 'text' ? (typesResult as any).content[0].text : '{}';
        this.logger.log('📋 Available types: ' + JSON.parse(typesText).types.map((t: any) => t.name).join(', '), 'success');
        
        this.logger.log('🔍 Step 2: Getting detailed schema for "pie" chart...', 'info');
        const schemaResult = await this.client.callTool('get_chart_config_schema', { chartType: 'pie' });
        const schemaText = (schemaResult as any).content?.[0]?.type === 'text' ? (schemaResult as any).content[0].text : '{}';
        const schema = JSON.parse(schemaText);
        this.logger.log('📐 Schema retrieved. Tool to use: ' + schema.tool, 'success');
        
        this.logger.log('🔍 Step 3: Generating pie chart using discovered schema...', 'info');
        await this.chartHandler.renderChart('generate_pie_chart', {
          title: 'Discovery Demo',
          data: [
            { name: 'Step 1: Discovery', value: 30, color: 'blue' },
            { name: 'Step 2: Schema', value: 30, color: 'green' },
            { name: 'Step 3: Generation', value: 40, color: 'orange' }
          ]
        });
        
        this.logger.log('✅ Hierarchy demonstration complete! Check logs to see the 3-step flow.', 'success');
      } catch (error) {
        this.logger.log(`Error: ${error}`, 'error');
      }
    });
  }
}
