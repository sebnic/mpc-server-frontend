import { MCPBrowserClient } from '../client.js';
import { Logger } from '../ui/logger.js';

export class ChartHandler {
  constructor(
    private client: MCPBrowserClient,
    private logger: Logger
  ) {}

  async renderChart(toolName: string, args: any) {
    try {
      this.logger.log(`Generating ${toolName}...`, 'info');
      const result = await this.client.callTool(toolName, args);
      const configText = (result as any).content?.[0]?.type === 'text' ? (result as any).content[0].text : '{}';
      const config = JSON.parse(configText);
      
      // Display config JSON
      document.getElementById('chartConfigJson')!.textContent = JSON.stringify(config, null, 2);
      
      // Import and render chart
      const echarts = await import('echarts');
      const chartDisplay = document.getElementById('chartDisplay')!;
      const chartCanvas = document.getElementById('chartCanvas')!;
      
      chartDisplay.style.display = 'block';
      
      // Initialize chart
      const chart = echarts.init(chartCanvas);
      chart.setOption(config);
      
      // Handle window resize
      window.addEventListener('resize', () => chart.resize());
      
      this.logger.log('Chart generated successfully!', 'success');
    } catch (error) {
      this.logger.log(`Chart generation error: ${error}`, 'error');
    }
  }

  async generateWithAI(prompt: string) {
    // Check if the prompt seems to be about charts
    const chartKeywords = [
      'chart', 'graphique', 'graph', 'diagramme', 'courbe', 'histogramme',
      'pie', 'line', 'bar', 'camembert', 'circulaire', 'barre', 'ligne',
      'plot', 'visuali', 'données', 'data', 'valeur', 'value'
    ];
    const promptLower = prompt.toLowerCase();
    const containsChartKeyword = chartKeywords.some(keyword => promptLower.includes(keyword));
    
    this.logger.log(`AI generating chart: "${prompt}"`, 'info');
    const generateBtn = document.getElementById('generateChartBtn') as HTMLButtonElement;
    generateBtn.disabled = true;
    generateBtn.textContent = '🤖 Generating...';
    
    try {
      let enhancedPrompt: string;
      
      if (!containsChartKeyword) {
        // Request is not about charts - ask LLM to respond with humor
        enhancedPrompt = `L'utilisateur a demandé: "${prompt}"

Cependant, ce système est spécialisé UNIQUEMENT dans la création de graphiques ECharts (line chart, bar chart, pie chart).

Réponds avec humour en expliquant poliment que tu ne peux créer que des graphiques ECharts, et propose un lien créatif ou humoristique entre leur demande et les graphiques.

Exemples:
- Si on demande une recette → "Je ne suis qu'un humble créateur de graphiques ECharts 📊! Mais je pourrais vous faire un joli pie chart des proportions d'ingrédients... si vous m'en donnez les valeurs! 🥧"
- Si on demande la météo → "Je ne prédis pas la météo, mais je peux tracer un line chart des températures si vous me donnez les données! ☀️📈"

Sois créatif et sympathique!`;
      } else {
        // Normal chart request
        enhancedPrompt = `Create a chart based on this request: ${prompt}

IMPORTANT: You MUST use one of these MCP tools:
- generate_line_chart (for trends over time)
- generate_bar_chart (for comparisons)  
- generate_pie_chart (for proportions/percentages)

After using the tool, just return the exact JSON configuration you received, nothing else.`;
      }
      
      const result = await this.client.callTool('agent_chat', { message: enhancedPrompt });
      const responseText = (result as any).content?.[0]?.type === 'text' ? (result as any).content[0].text : '';
      
      // Check if LLM is not initialized
      if (responseText.includes('LLM not initialized') || responseText.includes('Agent Error')) {
        this.logger.log('❌ LLM not initialized!', 'error');
        this.logger.log('⚠️ Please initialize the LLM first:', 'error');
        this.logger.log('1. Choose a provider (Gemini recommended)', 'info');
        this.logger.log('2. Enter your API key if using Gemini', 'info');
        this.logger.log('3. Click "Initialize LLM" and wait for "Ready" status', 'info');
        generateBtn.disabled = false;
        generateBtn.textContent = '🎨 Generate Chart with AI';
        return;
      }
      
      // Show response in debug section
      document.getElementById('chartDebugResponse')!.textContent = responseText;
      
      console.log('[Chart Generation] ===== DEBUG INFO =====');
      console.log('[Chart Generation] Response type:', (result as any).content?.[0]?.type);
      console.log('[Chart Generation] Response length:', responseText.length);
      console.log('[Chart Generation] Response chars breakdown:');
      for (let i = 0; i < Math.min(responseText.length, 50); i++) {
        console.log(`  [${i}]: "${responseText[i]}" (code: ${responseText.charCodeAt(i)})`);
      }
      console.log('[Chart Generation] First 300 chars:', responseText.substring(0, 300));
      console.log('[Chart Generation] Last 300 chars:', responseText.substring(Math.max(0, responseText.length - 300)));
      console.log('[Chart Generation] Full response:');
      console.log(responseText);
      
      // Try multiple strategies to extract JSON configuration
      let config: any = null;
      
      console.log('[Chart Generation] 🔍 Extracting JSON from response...');
      
      // Strategy 1: Try direct parse first (fastest)
      try {
        const trimmed = responseText.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          const parsed = JSON.parse(trimmed);
          if (parsed && (parsed.series || parsed.title || parsed.data || parsed.xAxis || parsed.yAxis)) {
            config = parsed;
            console.log('[Chart Generation] ✅ Direct parse succeeded!');
          }
        }
      } catch (e) {
        console.log('[Chart Generation] Direct parse failed:', e);
      }
      
      // Strategy 2: Extract JSON by matching balanced braces
      if (!config) {
        console.log('[Chart Generation] Trying balanced brace extraction...');
        const firstBrace = responseText.indexOf('{');
        if (firstBrace !== -1) {
          let braceCount = 0;
          let inString = false;
          let escaped = false;
          let jsonEnd = -1;
          
          for (let i = firstBrace; i < responseText.length; i++) {
            const char = responseText[i];
            
            if (escaped) {
              escaped = false;
              continue;
            }
            
            if (char === '\\') {
              escaped = true;
              continue;
            }
            
            if (char === '"') {
              inString = !inString;
              continue;
            }
            
            if (!inString) {
              if (char === '{') braceCount++;
              if (char === '}') {
                braceCount--;
                if (braceCount === 0) {
                  jsonEnd = i + 1;
                  break;
                }
              }
            }
          }
          
          if (jsonEnd !== -1) {
            const jsonStr = responseText.substring(firstBrace, jsonEnd);
            console.log('[Chart Generation] Extracted JSON:', jsonStr.substring(0, 200) + '...');
            try {
              const parsed = JSON.parse(jsonStr);
              if (parsed && (parsed.series || parsed.title || parsed.data || parsed.xAxis || parsed.yAxis)) {
                config = parsed;
                console.log('[Chart Generation] ✅ Balanced brace extraction succeeded!');
              }
            } catch (e) {
              console.log('[Chart Generation] Balanced brace parse failed:', e);
            }
          }
        }
      }
      
      // Strategy 3: Try to find JSON with code blocks (```json ... ```)
      if (!config) {
        console.log('[Chart Generation] Trying code block extraction...');
        const codeBlockMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (codeBlockMatch) {
          try {
            const parsed = JSON.parse(codeBlockMatch[1]);
            if (parsed && (parsed.series || parsed.title || parsed.data || parsed.xAxis || parsed.yAxis)) {
              config = parsed;
              console.log('[Chart Generation] ✅ Code block extraction succeeded!');
            }
          } catch (e) {
            console.log('[Chart Generation] Code block parse failed:', e);
          }
        }
      }
      
      if (config) {
        console.log('[Chart Generation] 🎨 Rendering chart with config:', config);
        
        // Display config JSON
        document.getElementById('chartConfigJson')!.textContent = JSON.stringify(config, null, 2);
        
        // Import and render chart
        const echarts = await import('echarts');
        const chartDisplay = document.getElementById('chartDisplay')!;
        const chartCanvas = document.getElementById('chartCanvas')!;
        
        console.log('[Chart Generation] Chart container:', {
          display: chartDisplay,
          canvas: chartCanvas,
          width: chartCanvas.offsetWidth,
          height: chartCanvas.offsetHeight,
        });
        
        chartDisplay.style.display = 'block';
        
        // Wait for DOM to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('[Chart Generation] After display block:', {
          width: chartCanvas.offsetWidth,
          height: chartCanvas.offsetHeight,
        });
        
        // Clear and initialize chart
        const chartElement = chartCanvas as HTMLElement;
        const existingChart = echarts.getInstanceByDom(chartElement);
        if (existingChart) {
          console.log('[Chart Generation] Disposing existing chart');
          existingChart.dispose();
        }
        
        console.log('[Chart Generation] Initializing ECharts...');
        const chart = echarts.init(chartElement);
        console.log('[Chart Generation] Setting option...');
        chart.setOption(config);
        console.log('[Chart Generation] Chart rendered!');
        
        // Ensure chart resizes with window
        window.addEventListener('resize', () => {
          console.log('[Chart Generation] Window resized, updating chart');
          chart.resize();
        });
        
        this.logger.log('✨ Chart generated successfully by AI!', 'success');
      } else {
        // No chart config found - this might be a humorous response for off-topic request
        console.log('[Chart Generation] ❌ Config extraction failed. containsChartKeyword:', containsChartKeyword);
        console.log('[Chart Generation] Response was:', responseText);
        
        if (!containsChartKeyword) {
          // Display the LLM's humorous response
          this.logger.log('🤖 ' + responseText, 'info');
        } else {
          // This was supposed to be a chart but extraction failed
          this.logger.log('AI response: ' + responseText.substring(0, 200) + '...', 'info');
          this.logger.log('Could not extract chart configuration.', 'error');
          this.logger.log('💡 Tips: Be specific about chart type (line/bar/pie) and provide data values.', 'info');
          this.logger.log('💡 Check the "🐛 Debug: View Agent Response" section below for the full response.', 'info');
        }
      }
    } catch (error) {
      this.logger.log(`Error: ${error}`, 'error');
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = '🎨 Generate Chart with AI';
    }
  }
}
