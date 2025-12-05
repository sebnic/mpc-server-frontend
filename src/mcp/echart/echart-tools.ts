// ECharts tool schemas and handlers for browser integration

// Discovery tools
export function getChartDiscoverySchema() {
  return [
    {
      name: 'get_chart_types',
      description: 'Get list of available ECharts types with descriptions and use cases. Call this first to discover what charts are available.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'get_chart_config_schema',
      description: 'Get detailed configuration schema and examples for a specific chart type. Call this to learn how to configure a chart before generating it.',
      inputSchema: {
        type: 'object',
        properties: {
          chartType: {
            type: 'string',
            enum: ['line', 'bar', 'pie', 'scatter', 'radar', 'gauge', 'funnel', 'heatmap'],
            description: 'The chart type to get schema for',
          },
        },
        required: ['chartType'],
      },
    },
  ];
}

// Generation tools
export function getChartGenerationSchema() {
  return [
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
                name: { type: 'string', description: 'Section name/label' },
                value: { type: 'number', description: 'Section value' },
                color: { type: 'string', description: 'Optional section color (e.g., "orange", "red", "#FF5733")' },
              },
              required: ['name', 'value'],
            },
          },
        },
        required: ['data'],
      },
    },
  ];
}

// Discovery tool handlers
export function handleChartDiscoveryTool(name: string, args: any): any {
  switch (name) {
    case 'get_chart_types': {
      const chartTypes = {
        types: [
          {
            name: 'line',
            description: 'Line chart for showing trends over time or continuous data',
            useCases: ['Time series', 'Trends', 'Progressive data'],
            example: 'Sales over months, temperature changes, stock prices',
          },
          {
            name: 'bar',
            description: 'Bar chart for comparing values across categories',
            useCases: ['Comparisons', 'Rankings', 'Categorical data'],
            example: 'Revenue by product, scores by team, population by city',
          },
          {
            name: 'pie',
            description: 'Pie chart for showing proportions of a whole',
            useCases: ['Percentages', 'Market share', 'Distribution'],
            example: 'Budget allocation, browser usage, survey results',
          },
          {
            name: 'scatter',
            description: 'Scatter plot for showing correlation between two variables',
            useCases: ['Correlation analysis', 'Data distribution', 'Outlier detection'],
            example: 'Height vs weight, price vs quality, test scores comparison',
          },
          {
            name: 'radar',
            description: 'Radar chart for multivariate data comparison',
            useCases: ['Multi-dimensional comparison', 'Performance metrics'],
            example: 'Skills assessment, product features, team capabilities',
          },
          {
            name: 'gauge',
            description: 'Gauge chart for showing progress or single value metrics',
            useCases: ['KPI dashboard', 'Progress indicators', 'Speed/performance meters'],
            example: 'CPU usage, completion rate, satisfaction score',
          },
          {
            name: 'funnel',
            description: 'Funnel chart for showing process stages and conversion',
            useCases: ['Sales pipeline', 'Conversion rates', 'Process flow'],
            example: 'Marketing funnel, recruitment process, order flow',
          },
          {
            name: 'heatmap',
            description: 'Heatmap for showing data density or intensity across two dimensions',
            useCases: ['Data patterns', 'Correlation matrices', 'Activity tracking'],
            example: 'Website clicks, hourly traffic, correlation analysis',
          },
        ],
        note: 'Currently implemented: line, bar, pie. Others can be added on demand.',
      };
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(chartTypes, null, 2),
          },
        ],
      };
    }

    case 'get_chart_config_schema': {
      const chartType = (args as any).chartType;
      let schema: any;
      
      switch (chartType) {
        case 'line':
          schema = {
            type: 'line',
            description: 'Line chart showing trends over continuous data',
            parameters: {
              title: { type: 'string', optional: true, description: 'Chart title' },
              xAxisData: { type: 'array<string>', required: true, description: 'Labels for X-axis (e.g., months, dates)' },
              series: {
                type: 'array<object>',
                required: true,
                description: 'Data series to plot',
                structure: {
                  name: { type: 'string', description: 'Series name for legend' },
                  data: { type: 'array<number>', description: 'Y-axis values corresponding to xAxisData' },
                },
              },
            },
            example: {
              title: 'Monthly Sales',
              xAxisData: ['Jan', 'Feb', 'Mar', 'Apr'],
              series: [
                { name: '2024', data: [120, 200, 150, 180] },
                { name: '2023', data: [100, 180, 140, 160] },
              ],
            },
            tool: 'generate_line_chart',
          };
          break;
          
        case 'bar':
          schema = {
            type: 'bar',
            description: 'Bar chart for comparing values across categories',
            parameters: {
              title: { type: 'string', optional: true, description: 'Chart title' },
              xAxisData: { type: 'array<string>', required: true, description: 'Category labels' },
              series: {
                type: 'array<object>',
                required: true,
                description: 'Data series for bars',
                structure: {
                  name: { type: 'string', description: 'Series name' },
                  data: { type: 'array<number>', description: 'Values for each category' },
                },
              },
            },
            example: {
              title: 'Quarterly Revenue',
              xAxisData: ['Q1', 'Q2', 'Q3', 'Q4'],
              series: [
                { name: 'Product A', data: [1500, 1800, 2100, 2400] },
                { name: 'Product B', data: [1200, 1400, 1600, 1800] },
              ],
            },
            tool: 'generate_bar_chart',
          };
          break;
          
        case 'pie':
          schema = {
            type: 'pie',
            description: 'Pie chart showing proportions',
            parameters: {
              title: { type: 'string', optional: true, description: 'Chart title' },
              data: {
                type: 'array<object>',
                required: true,
                description: 'Pie sections',
                structure: {
                  name: { type: 'string', description: 'Section label' },
                  value: { type: 'number', description: 'Section value' },
                  color: { type: 'string', optional: true, description: 'Custom color (e.g., "red", "#FF0000")' },
                },
              },
            },
            example: {
              title: 'Market Share',
              data: [
                { name: 'Product A', value: 35, color: 'orange' },
                { name: 'Product B', value: 28, color: 'red' },
                { name: 'Product C', value: 22, color: 'green' },
                { name: 'Others', value: 15, color: 'gray' },
              ],
            },
            tool: 'generate_pie_chart',
          };
          break;
          
        default:
          schema = {
            error: `Chart type "${chartType}" schema not yet implemented`,
            availableTypes: ['line', 'bar', 'pie'],
            note: 'Other types (scatter, radar, gauge, funnel, heatmap) can be implemented on demand',
          };
      }
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(schema, null, 2),
          },
        ],
      };
    }

    default:
      return null; // Not a discovery tool
  }
}

// Chart generation tool handlers
export function handleChartGenerationTool(name: string, args: any): any {
  switch (name) {
    case 'generate_line_chart': {
      const config = generateLineChart(args as any);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(config, null, 2),
          },
        ],
      };
    }

    case 'generate_bar_chart': {
      const config = generateBarChart(args as any);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(config, null, 2),
          },
        ],
      };
    }

    case 'generate_pie_chart': {
      const config = generatePieChart(args as any);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(config, null, 2),
          },
        ],
      };
    }

    default:
      return null; // Not a generation tool
  }
}

// ECharts configuration generators
function generateLineChart(args: {
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

function generateBarChart(args: {
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

function generatePieChart(args: {
  title?: string;
  data: Array<{ name: string; value: number; color?: string }>;
}) {
  // Transform data to include itemStyle for colors
  const transformedData = args.data.map(item => ({
    name: item.name,
    value: item.value,
    ...(item.color ? {
      itemStyle: {
        color: item.color
      }
    } : {})
  }));

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
        data: transformedData,
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
