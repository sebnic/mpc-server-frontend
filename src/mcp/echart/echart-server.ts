import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

class EChartMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'echart-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers() {
    // Liste des outils disponibles
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'generate_line_chart',
          description: 'Generate ECharts configuration for a line chart',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Chart title',
              },
              xAxisData: {
                type: 'array',
                items: { type: 'string' },
                description: 'X-axis labels',
              },
              series: {
                type: 'array',
                description: 'Data series for the chart',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    data: { type: 'array', items: { type: 'number' } },
                  },
                },
              },
            },
            required: ['xAxisData', 'series'],
          },
        },
        {
          name: 'generate_bar_chart',
          description: 'Generate ECharts configuration for a bar chart',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Chart title',
              },
              xAxisData: {
                type: 'array',
                items: { type: 'string' },
                description: 'X-axis categories',
              },
              series: {
                type: 'array',
                description: 'Data series for the chart',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    data: { type: 'array', items: { type: 'number' } },
                  },
                },
              },
            },
            required: ['xAxisData', 'series'],
          },
        },
        {
          name: 'generate_pie_chart',
          description: 'Generate ECharts configuration for a pie chart',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Chart title',
              },
              data: {
                type: 'array',
                description: 'Pie chart data',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    value: { type: 'number' },
                  },
                },
              },
            },
            required: ['data'],
          },
        },
        {
          name: 'generate_scatter_chart',
          description: 'Generate ECharts configuration for a scatter chart',
          inputSchema: {
            type: 'object',
            properties: {
              title: {
                type: 'string',
                description: 'Chart title',
              },
              series: {
                type: 'array',
                description: 'Data series for scatter plot',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    data: {
                      type: 'array',
                      items: {
                        type: 'array',
                        items: { type: 'number' },
                      },
                    },
                  },
                },
              },
            },
            required: ['series'],
          },
        },
        {
          name: 'generate_custom_chart',
          description: 'Generate custom ECharts configuration with full control',
          inputSchema: {
            type: 'object',
            properties: {
              config: {
                type: 'object',
                description: 'Complete ECharts configuration object',
              },
            },
            required: ['config'],
          },
        },
      ];

      return { tools };
    });

    // Gestion des appels d'outils
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        let config: any;

        switch (name) {
          case 'generate_line_chart':
            config = this.generateLineChart(args as any);
            break;

          case 'generate_bar_chart':
            config = this.generateBarChart(args as any);
            break;

          case 'generate_pie_chart':
            config = this.generatePieChart(args as any);
            break;

          case 'generate_scatter_chart':
            config = this.generateScatterChart(args as any);
            break;

          case 'generate_custom_chart':
            config = (args as any)?.config || {};
            break;

          default:
            throw new Error(`Unknown tool: ${name}`);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(config, null, 2),
            },
          ],
        };
      } catch (error: any) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  private generateLineChart(args: {
    title?: string;
    xAxisData: string[];
    series: Array<{ name: string; data: number[] }>;
  }) {
    return {
      title: args.title
        ? {
            text: args.title,
            left: 'center',
          }
        : undefined,
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: args.series.map((s) => s.name),
        top: args.title ? 40 : 10,
      },
      xAxis: {
        type: 'category',
        data: args.xAxisData,
        boundaryGap: false,
      },
      yAxis: {
        type: 'value',
      },
      series: args.series.map((s) => ({
        name: s.name,
        type: 'line',
        data: s.data,
        smooth: true,
      })),
    };
  }

  private generateBarChart(args: {
    title?: string;
    xAxisData: string[];
    series: Array<{ name: string; data: number[] }>;
  }) {
    return {
      title: args.title
        ? {
            text: args.title,
            left: 'center',
          }
        : undefined,
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
      },
      legend: {
        data: args.series.map((s) => s.name),
        top: args.title ? 40 : 10,
      },
      xAxis: {
        type: 'category',
        data: args.xAxisData,
      },
      yAxis: {
        type: 'value',
      },
      series: args.series.map((s) => ({
        name: s.name,
        type: 'bar',
        data: s.data,
      })),
    };
  }

  private generatePieChart(args: {
    title?: string;
    data: Array<{ name: string; value: number }>;
  }) {
    return {
      title: args.title
        ? {
            text: args.title,
            left: 'center',
          }
        : undefined,
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: args.title ? 60 : 20,
      },
      series: [
        {
          name: 'Data',
          type: 'pie',
          radius: '50%',
          data: args.data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  }

  private generateScatterChart(args: {
    title?: string;
    series: Array<{ name: string; data: number[][] }>;
  }) {
    return {
      title: args.title
        ? {
            text: args.title,
            left: 'center',
          }
        : undefined,
      tooltip: {
        trigger: 'item',
      },
      legend: {
        data: args.series.map((s) => s.name),
        top: args.title ? 40 : 10,
      },
      xAxis: {
        type: 'value',
      },
      yAxis: {
        type: 'value',
      },
      series: args.series.map((s) => ({
        name: s.name,
        type: 'scatter',
        data: s.data,
        symbolSize: 8,
      })),
    };
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('EChart MCP Server running on stdio');
  }
}

// Démarrage du serveur
const server = new EChartMCPServer();
server.start().catch(console.error);
